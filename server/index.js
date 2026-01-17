const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "db.json");

function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ products: [] }, null, 2), "utf-8");
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// healthcheck
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// LIST
app.get("/products", (req, res) => {
  const db = readDb();
  res.json(db.products || []);
});

// UPSERT by id (create or update)
app.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  if (!body.name || !body.expiryDate || !body.updatedAt) {
    return res.status(400).json({ error: "Missing fields: name, expiryDate, updatedAt" });
  }

  const db = readDb();
  db.products = db.products || [];

  const idx = db.products.findIndex((p) => Number(p.id) === id);
  const next = {
    id,
    name: String(body.name),
    expiryDate: String(body.expiryDate),
    description: String(body.description ?? ""),
    photoUri: body.photoUri ?? null,
    updatedAt: String(body.updatedAt),
  };

  if (idx >= 0) {
    db.products[idx] = next;
  } else {
    db.products.push(next);
  }

  writeDb(db);
  res.json(next);
});

// DELETE
app.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const db = readDb();
  db.products = (db.products || []).filter((p) => Number(p.id) !== id);
  writeDb(db);

  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`REST API running on http://localhost:${PORT}`);
});
