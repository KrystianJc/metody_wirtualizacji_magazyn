import express from "express";

const app = express();
const PORT = 3000;

// endpoint testowy
app.get("/api/check", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
