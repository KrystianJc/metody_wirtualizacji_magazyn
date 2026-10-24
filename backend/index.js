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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
