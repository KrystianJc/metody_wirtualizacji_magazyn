import express from "express";
import pg from "pg";

const pool = new pg.Pool({
  // zmienna środowiskowe z compose
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// endpoint testowy
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
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

  const result = await pool.query(
    `INSERT INTO products (name, category, amount, section, rack, shelf, placement)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name.trim(), category.trim(), amount, section, rack, shelf, placement],
  );

  res.status(201).json(result.rows[0]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
