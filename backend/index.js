import express from "express";
import pg from "pg";

const pool = new pg.Pool({
  // zmienna środowiskowe z compose
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// obsługa błędu puli gdy zgłosi błąd, aby Node nie kończył procesu
pool.on("error", (err) => {
  console.error("Unexpected database error:", err.message);
});

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// endpoint testowy
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(503).json({ error: "Database unreachable" });
  }
});

app.get("/api/products", async (req, res) => {
  const result = await pool.query("SELECT * FROM products ORDER BY id");
  res.json(result.rows);
});

app.get("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(result.rows[0]);
});

app.post("/api/products", async (req, res) => {
  const { name, category, amount, section, rack, shelf, placement } =
    req.body ?? {};

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Field 'name' is required" });
  }
  if (typeof category !== "string" || category.trim() === "") {
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
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO products (name, category, amount, section, rack, shelf, placement)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
      [name.trim(), category.trim(), amount, section, rack, shelf, placement],
    );
    const product = result.rows[0];
    await client.query(
      `INSERT INTO stock_movements (product_id, product_name, event_type, amount)
			 VALUES ($1, $2, 'product_added', $3)`,
      [product.id, product.name, product.amount],
    );
    await client.query("COMMIT");

    res.status(201).json(product);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to record product addition:", err.message);
    res.status(500).json({ error: "Failed to record product addition" });
  } finally {
    client.release();
  }
});

app.patch("/api/products/:id/stock", async (req, res) => {
  const id = Number(req.params.id);
  const { amount } = req.body ?? {};

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  if (!Number.isInteger(amount) || amount < 1) {
    return res.status(400).json({ error: "Amount must be a positive integer" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE products
			 SET amount = amount - $1
			 WHERE id = $2 AND amount >= $1
			 RETURNING *`,
      [amount, id],
    );

    if (result.rowCount === 0) {
      const existing = await client.query(
        "SELECT 1 FROM products WHERE id = $1",
        [id],
      );
      await client.query("ROLLBACK");

      if (existing.rowCount === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.status(409).json({ error: "Insufficient stock" });
    }

    const product = result.rows[0];
    await client.query(
      `INSERT INTO stock_movements (product_id, product_name, event_type, amount)
			 VALUES ($1, $2, 'stock_withdrawn', $3)`,
      [id, product.name, amount],
    );
    await client.query("COMMIT");

    res.json(product);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to record stock movement:", err.message);
    res.status(500).json({ error: "Failed to record stock movement" });
  } finally {
    client.release();
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const deleted = await client.query(
      `DELETE FROM products
			 WHERE id = $1
			 RETURNING id, name, amount`,
      [id],
    );

    if (deleted.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Product not found" });
    }

    const product = deleted.rows[0];
    await client.query(
      `INSERT INTO stock_movements (product_id, product_name, event_type, amount)
			 VALUES (NULL, $1, 'product_deleted', $2)`,
      [product.name, product.amount],
    );
    await client.query("COMMIT");
    res.status(204).send();
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to record product deletion:", err.message);
    res.status(500).json({ error: "Failed to record product deletion" });
  } finally {
    client.release();
  }
});

app.get("/api/products/:id/movements", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const result = await pool.query(
    `SELECT id, product_id, product_name, event_type, amount, created_at
		 FROM stock_movements
		 WHERE product_id = $1
		 ORDER BY created_at DESC, id DESC`,
    [id],
  );

  res.json(result.rows);
});

app.get("/api/stock-movements", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, product_id, product_name, event_type, amount, created_at
			 FROM stock_movements
			 ORDER BY created_at DESC, id DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch stock movements:", err.message);
    res.status(500).json({ error: "Failed to fetch stock movements" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
