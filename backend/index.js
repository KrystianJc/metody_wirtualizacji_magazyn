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
      id: 1,
      name: "Wiertarka Bosch",
      category: "Elektronarzędzia",
      amount: 15,
      section: 2,
      rack: 4,
      shelf: 3,
      placement: 10,
    },
    {
      id: 2,
      name: "Młotek Stanley",
      category: "Narzędzia ręczne",
      amount: 40,
      section: 2,
      rack: 4,
      shelf: 1,
      placement: 12,
    },
    {
      id: 3,
      name: "Zestaw śrub M8",
      category: "Elementy złączne",
      amount: 150,
      section: 5,
      rack: 1,
      shelf: 2,
      placement: 5,
    },
    {
      id: 4,
      name: "Klucz nastawny 250 mm",
      category: "Narzędzia ręczne",
      amount: 18,
      section: 2,
      rack: 3,
      shelf: 2,
      placement: 7,
    },
    {
      id: 5,
      name: "Wkrety do drewna 4 x 50 mm",
      category: "Elementy złączne",
      amount: 320,
      section: 5,
      rack: 2,
      shelf: 1,
      placement: 3,
    },
    {
      id: 6,
      name: "Szlifierka katowa Makita",
      category: "Elektronarzędzia",
      amount: 7,
      section: 2,
      rack: 5,
      shelf: 3,
      placement: 11,
    },
    {
      id: 7,
      name: "Tasma miernicza 5 m",
      category: "Narzędzia pomiarowe",
      amount: 24,
      section: 3,
      rack: 1,
      shelf: 2,
      placement: 4,
    },
    {
      id: 8,
      name: "Rekawice robocze",
      category: "BHP",
      amount: 45,
      section: 1,
      rack: 2,
      shelf: 1,
      placement: 6,
    },
    {
      id: 9,
      name: "Poziomica aluminiowa 60 cm",
      category: "Narzędzia pomiarowe",
      amount: 12,
      section: 3,
      rack: 2,
      shelf: 3,
      placement: 8,
    },
    {
      id: 10,
      name: "Przedluzacz bebnowy 25 m",
      category: "Osprzęt elektryczny",
      amount: 9,
      section: 4,
      rack: 1,
      shelf: 2,
      placement: 2,
    },
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
