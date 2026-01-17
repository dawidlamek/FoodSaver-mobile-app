import { apiFetch } from "./client";

export function apiListProducts() {
  return apiFetch("/products");
}

export function apiUpsertProduct(product) {
  // PUT /products/:id
  return apiFetch(`/products/${product.id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}

export function apiDeleteProduct(id) {
  return apiFetch(`/products/${id}`, { method: "DELETE" });
}
