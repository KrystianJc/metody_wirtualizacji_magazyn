CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  section INTEGER NOT NULL,
  rack INTEGER NOT NULL,
  shelf INTEGER NOT NULL,
  placement INTEGER NOT NULL
);

INSERT INTO products (name, category, amount, section, rack, shelf, placement) VALUES
  ('Wiertarka Bosch','Elektronarzędzia',15,2,4,3,10),
  ('Młotek Stanley','Narzędzia ręczne',40,2,4,1,12),
  ('Zestaw śrub M8','Elementy złączne',150,5,1,2,5),
  ('Klucz nastawny 250 mm','Narzędzia ręczne',18,2,3,2,7),
  ('Wkrety do drewna 4 x 50 mm','Elementy złączne',320,5,2,1,3),
  ('Szlifierka katowa Makita','Elektronarzędzia',7,2,5,3,11),
  ('Tasma miernicza 5 m','Narzędzia pomiarowe',24,3,1,2,4),
  ('Rekawice robocze','BHP',45,1,2,1,6),
  ('Poziomica aluminiowa 60 cm','Narzędzia pomiarowe',12,3,2,3,8),
  ('Przedluzacz bebnowy 25 m','Osprzęt elektryczny',9,4,1,2,2);