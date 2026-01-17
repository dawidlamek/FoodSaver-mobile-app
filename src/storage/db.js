import * as SQLite from "expo-sqlite";

let db = null;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("foodsaver.db");
  }
  return db;
}

export async function initDb() {
  const database = await getDb();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      expiryDate TEXT NOT NULL,
      description TEXT,
      photoUri TEXT,
      notificationId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
}
