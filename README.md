# Magazyn

Aplikacja do przeglądania produktów w magazynie, dodawania ich oraz pobierania ze stanu.

## Format wymiany danych

Backend udostępnia API HTTP. Dane wejściowe i odpowiedzi API są przesyłane w formacie JSON. Przy żądaniach z treścią (`POST`, `PATCH`) należy wysłać nagłówek `Content-Type: application/json`.

Produkt jest reprezentowany przez obiekt:

```json
{
  "id": 1,
  "name": "Wiertarka Bosch",
  "category": "Elektronarzędzia",
  "amount": 15,
  "section": 2,
  "rack": 4,
  "shelf": 3,
  "placement": 10
}
```

Pola `id`, `amount`, `section`, `rack`, `shelf` i `placement` są liczbami całkowitymi. `id` jest nadawane przez bazę. Ilość i wartości lokalizacji muszą być nieujemne. `name` i `category` są niepustymi tekstami.

Zdarzenie magazynowe jest reprezentowane przez obiekt:

```json
{
  "id": 5,
  "product_id": 1,
  "product_name": "Wiertarka Bosch",
  "event_type": "stock_withdrawn",
  "amount": 4,
  "created_at": "2026-11-10T11:45:12.456Z"
}
```

`id` i `created_at` nadaje baza. `event_type` może mieć wartość `product_added`, `stock_withdrawn` lub `product_deleted`. `amount` oznacza początkowy stan przy dodaniu, pobraną ilość przy pobraniu albo stan pozostały przy usunięciu.

## Endpointy API

| Metoda i ścieżka | Dane wejściowe | Odpowiedź |
|---|---|---|
| `GET /health` | Brak | `200` — `{ "status": "ok" }`; `503` — brak połączenia z bazą |
| `GET /api/products` | Brak | `200` — lista produktów posortowana według ID |
| `GET /api/products/:id` | ID w ścieżce URL | `200` — produkt; `400` — nieprawidłowe ID; `404` — brak produktu |
| `POST /api/products` | Obiekt nowego produktu bez `id` | `201` — dodany produkt; `400` — nieprawidłowe dane |
| `PATCH /api/products/:id/stock` | `{ "amount": 2 }` — liczba sztuk do pobrania | `200` — produkt ze zmienionym stanem; `400` — nieprawidłowe ID lub ilość; `404` — brak produktu; `409` — za mały stan |
| `GET /api/products/:id/movements` | ID w ścieżce URL | `200` — historia zdarzeń produktu (najnowsze pierwsze), `[]` gdy brak; `400` — nieprawidłowe ID |
| `GET /api/stock-movements` | Brak | `200` — historia wszystkich zdarzeń (najnowsze pierwsze), również usuniętych produktów |
| `DELETE /api/products/:id` | ID w ścieżce URL | `204` — produkt usunięty; `400` — nieprawidłowe ID; `404` — brak produktu |

Błędy API zwracające treść mają format JSON:

```json
{
  "error": "Product not found"
}
```

### Dodawanie produktu

`POST /api/products` przyjmuje obiekt bez pola `id`:

```json
{
  "name": "Wiertarka Bosch",
  "category": "Elektronarzędzia",
  "amount": 15,
  "section": 2,
  "rack": 4,
  "shelf": 3,
  "placement": 10
}
```

Po poprawnym dodaniu zwraca kod `201` i kompletny obiekt produktu, razem z nadanym `id`. Dodanie jest rejestrowane w `stock_movements` jako `product_added`.

### Pobieranie części zapasu

`PATCH /api/products/:id/stock` zmniejsza stan produktu o liczbę sztuk podaną w polu `amount`. Przykładowe żądanie dla produktu o ID `1`:

```http
PATCH /api/products/1/stock
Content-Type: application/json
```

```json
{
  "amount": 2
}
```

Ilość musi być dodatnią liczbą całkowitą, a stan magazynowy musi wystarczać na pobranie. Każde udane pobranie jest zapisywane jako osobny wpis `stock_withdrawn`. Nieudane pobrania (`404`, `409`) nie są zapisywane. Zmiana stanu i wpis historii są wykonywane w jednej transakcji.

### Historia magazynu

`GET /api/products/:id/movements` zwraca zdarzenia produktu, od najnowszego. `GET /api/stock-movements` zwraca wszystkie zdarzenia, które wyświetla podstrona historii.

Dodanie produktu, każde udane pobranie i usunięcie produktu tworzą osobny wpis. Przy usunięciu zapisywana jest ilość pozostała w magazynie. Wpisy pozostają po usunięciu produktu: `product_id` jest ustawiane na `null`, a zapisana nazwa produktu pozostaje w historii.

### Usuwanie produktu

`DELETE /api/products/:id` usuwa cały produkt i zapisuje zdarzenie `product_deleted`. Przy sukcesie zwraca `204 No Content`, czyli odpowiedź bez treści.

## Walidacja lokalizacji

Formularz frontendowy sprawdza, czy wskazane miejsce (sekcja, regał, półka i pozycja) jest już zajęte. Backend nie sprawdza unikalności lokalizacji.
