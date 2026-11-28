import express from 'express';
import pg from 'pg';
import promClient from 'prom-client';

// włączenie gotowych metryk Node
promClient.collectDefaultMetrics();

const pool = new pg.Pool({
	// zmienna środowiskowe z compose
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

// obsługa błędu puli gdy zgłosi błąd, aby Node nie kończył procesu
pool.on('error', (err) => {
	console.error('Unexpected database error:', err.message);
});

const app = express();
const PORT = process.env.PORT || 3000;

const httpRequests = new promClient.Counter({
	name: 'http_requests_total',
	help: 'Liczba żądań HTTP',
	labelNames: ['method', 'route', 'status'],
});
const stockWithdrawn = new promClient.Counter({
	name: 'stock_withdrawn_items_total',
	help: 'Liczba pobranych sztuk wg produktu',
	labelNames: ['product'],
});

app.use((req, res, next) => {
	res.on('finish', () => {
		httpRequests // kolejnosc lables musi sie zgadzac z const httpRequests
			.labels(req.method, req.route?.path ?? 'unknown', res.statusCode) //req.route?.path bierze bezwględna ściężkę jeśli istnieje, w przeciwnym razie undefined
			.inc();
	});
	next();
});

app.use(express.json());

const productHistoryTable = `
	CREATE TABLE IF NOT EXISTS product_history (
		id SERIAL PRIMARY KEY,
		product_id INTEGER NOT NULL,
		product_name TEXT NOT NULL,
		event_type TEXT NOT NULL CHECK (event_type IN ('product_added', 'product_updated', 'stock_withdrawn', 'product_deleted')),
		actor TEXT NOT NULL,
		before_data JSONB,
		after_data JSONB,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`;

async function recordProductHistory(client, { product, eventType, actor, before, after }) {
	await client.query(
		`INSERT INTO product_history (product_id, product_name, event_type, actor, before_data, after_data)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		[product.id, product.name, eventType, actor, before, after],
	);
}

function changedBy(req) {
	const user = req.get('X-User')?.trim();
	return user ? user.slice(0, 100) : 'unknown';
}

// endpoint testowy
app.get('/health', async (req, res) => {
	try {
		await pool.query('SELECT 1');
		res.json({ status: 'ok' });
	} catch (err) {
		console.error('Health check failed:', err.message);
		res.status(503).json({ error: 'Database unreachable' });
	}
});

app.get('/metrics', async (req, res) => {
	res.set('Content-Type', promClient.register.contentType);
	res.send(await promClient.register.metrics());
});

app.get('/api/products', async (req, res) => {
	const result = await pool.query('SELECT * FROM products ORDER BY id');
	res.json(result.rows);
});

app.get('/api/products/:id', async (req, res) => {
	const id = Number(req.params.id);

	if (!Number.isInteger(id) || id < 1) {
		return res.status(400).json({ error: 'Invalid product id' });
	}

	const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

	if (result.rows.length === 0) {
		return res.status(404).json({ error: 'Product not found' });
	}

	res.json(result.rows[0]);
});

app.post('/api/products', async (req, res) => {
	const { name, category, amount, section, rack, shelf, placement } =
		req.body ?? {};
	const user = changedBy(req);

	if (typeof name !== 'string' || name.trim() === '') {
		return res.status(400).json({ error: "Field 'name' is required" });
	}
	if (typeof category !== 'string' || category.trim() === '') {
		return res.status(400).json({ error: "Field 'category' is required" });
	}

	const numbers = { amount, section, rack, shelf, placement };
	for (const [field, value] of Object.entries(numbers)) {
		if (!Number.isInteger(value) || value < 0) {
			return res
				.status(400)
				.json({ error: `Field '${field}' must be a non-negative integer` });
		}
	}

	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const result = await client.query(
			`INSERT INTO products (name, category, amount, section, rack, shelf, placement)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
			[name.trim(), category.trim(), amount, section, rack, shelf, placement],
		);
		const product = result.rows[0];
		await recordProductHistory(client, { product, eventType: 'product_added', actor: user, before: null, after: product });
		await client.query(
			`INSERT INTO stock_movements (product_id, product_name, event_type, amount, changed_by)
			 VALUES ($1, $2, 'product_added', $3, $4)`,
			[product.id, product.name, product.amount, user],
		);
		await client.query('COMMIT');

		res.status(201).json(product);
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('Failed to record product addition:', err.message);
		res.status(500).json({ error: 'Failed to record product addition' });
	} finally {
		client.release();
	}
});

app.patch('/api/products/:id/stock', async (req, res) => {
	const id = Number(req.params.id);
	const { amount } = req.body ?? {};
	const user = changedBy(req);

	if (!Number.isInteger(id) || id < 1) {
		return res.status(400).json({ error: 'Invalid product id' });
	}

	if (!Number.isInteger(amount) || amount < 1) {
		return res.status(400).json({ error: 'Amount must be a positive integer' });
	}

	const client = await pool.connect();

	try {
		await client.query('BEGIN');
		const previousResult = await client.query('SELECT * FROM products WHERE id = $1 FOR UPDATE', [id]);
		if (previousResult.rowCount === 0) {
			await client.query('ROLLBACK');
			return res.status(404).json({ error: 'Product not found' });
		}
		const previous = previousResult.rows[0];
		if (previous.amount < amount) {
			await client.query('ROLLBACK');
			return res.status(409).json({ error: 'Insufficient stock' });
		}
		const result = await client.query(
			`UPDATE products
			 SET amount = amount - $1
			 WHERE id = $2 AND amount >= $1
			 RETURNING *`,
			[amount, id],
		);

		if (result.rowCount === 0) {
			const existing = await client.query(
				'SELECT 1 FROM products WHERE id = $1',
				[id],
			);
			await client.query('ROLLBACK');

			if (existing.rowCount === 0) {
				return res.status(404).json({ error: 'Product not found' });
			}

			return res.status(409).json({ error: 'Insufficient stock' });
		}

		const product = result.rows[0];
		await recordProductHistory(client, { product, eventType: 'stock_withdrawn', actor: user, before: previous, after: product });
		await client.query(
			`INSERT INTO stock_movements (product_id, product_name, event_type, amount, changed_by)
			 VALUES ($1, $2, 'stock_withdrawn', $3, $4)`,
			[id, product.name, amount, user],
		);
		await client.query('COMMIT');
		stockWithdrawn.labels(product.name).inc(amount);

		res.json(product);
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('Failed to record stock movement:', err.message);
		res.status(500).json({ error: 'Failed to record stock movement' });
	} finally {
		client.release();
	}
});

app.delete('/api/products/:id', async (req, res) => {
	const id = Number(req.params.id);
	const user = changedBy(req);

	if (!Number.isInteger(id) || id < 1) {
		return res.status(400).json({ error: 'Invalid product id' });
	}

	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const deleted = await client.query(
			`DELETE FROM products
			 WHERE id = $1
			 RETURNING *`,
			[id],
		);

		if (deleted.rowCount === 0) {
			await client.query('ROLLBACK');
			return res.status(404).json({ error: 'Product not found' });
		}

		const product = deleted.rows[0];
		await recordProductHistory(client, { product, eventType: 'product_deleted', actor: user, before: product, after: null });
		await client.query(
			`INSERT INTO stock_movements (product_id, product_name, event_type, amount, changed_by)
			 VALUES (NULL, $1, 'product_deleted', $2, $3)`,
			[product.name, product.amount, user],
		);
		await client.query('COMMIT');
		res.status(204).send();
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('Failed to record product deletion:', err.message);
		res.status(500).json({ error: 'Failed to record product deletion' });
	} finally {
		client.release();
	}
});

app.get('/api/products/:id/movements', async (req, res) => {
	const id = Number(req.params.id);

	if (!Number.isInteger(id) || id < 1) {
		return res.status(400).json({ error: 'Invalid product id' });
	}

	const result = await pool.query(
		`SELECT id, product_id, product_name, event_type, amount, changed_by, created_at
		 FROM stock_movements
		 WHERE product_id = $1
		 ORDER BY created_at DESC, id DESC`,
		[id],
	);

	res.json(result.rows);
});

app.get('/api/products/:id/history', async (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isInteger(id) || id < 1) {
		return res.status(400).json({ error: 'Invalid product id' });
	}
	try {
		const result = await pool.query(
			`SELECT id, product_id, product_name, event_type, actor AS changed_by, before_data, after_data, created_at
			 FROM product_history WHERE product_id = $1 ORDER BY created_at DESC, id DESC`,
			[id],
		);
		res.json(result.rows);
	} catch (err) {
		console.error('Failed to fetch product history:', err.message);
		res.status(500).json({ error: 'Failed to fetch product history' });
	}
});

app.get('/api/stock-movements', async (req, res) => {
	try {
		const result = await pool.query(
			`SELECT id, product_id, product_name, event_type, amount, changed_by, created_at
			 FROM stock_movements
			 ORDER BY created_at DESC, id DESC`,
		);
		res.json(result.rows);
	} catch (err) {
		console.error('Failed to fetch stock movements:', err.message);
		res.status(500).json({ error: 'Failed to fetch stock movements' });
	}
});

pool.query(productHistoryTable)
	.then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
	.catch((err) => {
		console.error('Failed to initialize product history:', err.message);
		process.exit(1);
	});
