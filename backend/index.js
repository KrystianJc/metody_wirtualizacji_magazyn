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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
