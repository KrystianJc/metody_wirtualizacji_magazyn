import express from "express";

const app = express();
const PORT = 3000;

// endpoint testowy
app.get("/api/check", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", (req, res) => {
  res.json([
    {
      id: 0,
      name: "test",
      category: "testowa",
      amount: 0,
      section: 4,
      rack: 3,
      shelf: 5,
      placement: 10,
    },
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
