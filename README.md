# FoodSaver – aplikacja mobilna

FoodSaver to aplikacja mobilna do zarządzania magazynem produktów spożywczych. Użytkownik może dodawać, edytować i usuwać produkty, kontrolować daty ważności oraz otrzymywać lokalne powiadomienia przed upływem terminu przydatności. Dane są przechowywane lokalnie w bazie SQLite, a aplikacja może pobierać produkty z backendu poprzez REST API. Na potrzeby demonstracji/backend może być wystawiony publicznie przez tunel HTTPS (ngrok).

Projekt wykonany w ramach przedmiotu **„Budowa aplikacji mobilnych z użyciem technologii frontendowych”**.

## Funkcje
- CRUD produktów (dodaj/edytuj/usuń)
- Pola produktu: **nazwa**, **data ważności**, **opis**, **zdjęcie (opcjonalnie)**
- Lokalna baza danych: **SQLite**
- Powiadomienia lokalne: przypomnienia przed terminem ważności + ustawienia (dni/godzina/minuta)
- Synchronizacja: pobieranie danych z backendu przez **REST API**

## Technologie
- React Native + Expo (aplikacja mobilna)
- JavaScript
- expo-sqlite (SQLite)
- expo-notifications (powiadomienia lokalne)
- Node.js + Express (REST API)
- ngrok (tunel HTTPS do demo)

## REST API
Backend udostępnia m.in.:
- `GET /health` – status serwera
- `GET /products` – lista produktów (JSON)

## Uruchomienie projektu (pełna instrukcja)
Wykonaj poniższe polecenia w podanej kolejności:

```bash
# 1) Aplikacja mobilna (w katalogu głównym projektu)
npm install
npx expo start

# 2 Backend REST API (w drugim terminalu)
cd server
npm install
node index.js

# 3 Tunel HTTPS (w trzecim terminalu)
ngrok http 3000
```
Po uruchomieniu ngrok skopiuj wygenerowany adres HTTPS i wklej go w aplikacji:
Ustawienia → Adres serwera (REST API), a następnie wykonaj synchronizację (pobranie danych).

Informacje końcowe

Aplikacja spełnia wymagania projektu:

aplikacja mobilna oparta o technologie frontendowe,

funkcja natywna: powiadomienia lokalne,

lokalna baza danych SQLite,

komunikacja z backendem REST API,

synchronizacja danych z serwerem.