import { getDb } from "./db";

export async function listProducts() {
  const db = await getDb();
  return await db.getAllAsync(`SELECT * FROM products ORDER BY expiryDate ASC;`);
}

export async function getProductById(id) {
  const db = await getDb();
  const row = await db.getFirstAsync(`SELECT * FROM products WHERE id = ?;`, [id]);
  return row ?? null;
}

export async function addProduct({ name, expiryDate, description, photoUri, notificationId }) {
  const db = await getDb();
  const now = new Date().toISOString();

  const res = await db.runAsync(
    `INSERT INTO products (name, expiryDate, description, photoUri, notificationId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [name, expiryDate, description ?? "", photoUri ?? null, notificationId ?? null, now, now]
  );

  return res.lastInsertRowId;
}

export async function updateProduct(id, { name, expiryDate, description, photoUri, notificationId }) {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE products
     SET name = ?, expiryDate = ?, description = ?, photoUri = ?, notificationId = ?, updatedAt = ?
     WHERE id = ?;`,
    [name, expiryDate, description ?? "", photoUri ?? null, notificationId ?? null, now, id]
  );
}

export async function deleteProduct(id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM products WHERE id = ?;`, [id]);
}

/**
 * Sync helper: wstaw zdalny produkt do lokalnej bazy (po id),
 * ale NIE ruszaj notificationId (to lokalna rzecz).
 */
export async function upsertRemoteProduct(remote) {
  const db = await getDb();

  const local = await getProductById(remote.id);

  // jeśli lokalny nie istnieje => insert z konkretnym id
  if (!local) {
    await db.runAsync(
      `INSERT INTO products (id, name, expiryDate, description, photoUri, notificationId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        remote.id,
        remote.name,
        remote.expiryDate,
        remote.description ?? "",
        remote.photoUri ?? null,
        null,
        remote.updatedAt, // createdAt
        remote.updatedAt, // updatedAt
      ]
    );
    return;
  }

  // jeśli zdalny jest nowszy => update (bez notificationId)
  const localUpdated = new Date(local.updatedAt).getTime();
  const remoteUpdated = new Date(remote.updatedAt).getTime();

  if (remoteUpdated > localUpdated) {
    await db.runAsync(
      `UPDATE products
       SET name = ?, expiryDate = ?, description = ?, photoUri = ?, updatedAt = ?
       WHERE id = ?;`,
      [
        remote.name,
        remote.expiryDate,
        remote.description ?? "",
        remote.photoUri ?? null,
        remote.updatedAt,
        remote.id,
      ]
    );
  }
}
