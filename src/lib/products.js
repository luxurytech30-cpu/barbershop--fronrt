// src/lib/products.js
import { api } from "./api";

// GET all products
export async function listProducts() {
  const r = await api.get("/api/products");
  // adjust if your backend returns { products: [...] }
  return r.data.products ?? r.data ?? [];
}

// CREATE product (multipart)
export async function createProduct(formData) {
  const r = await api.post("/api/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return r.data;
}

// DELETE product
export async function deleteProduct(id) {
  const r = await api.delete(`/api/products/${id}`);
  return r.data;
}

// UPDATE product (patch)
export async function updateProduct(id, values) {
  const fd = new FormData();

  Object.entries(values).forEach(([k, v]) => {
    if (v === undefined || v === null) return;

    // allow either "image" or "imageFile" from your state
    if ((k === "image" || k === "imageFile") && v instanceof File) {
      fd.append("image", v); // backend expects "image"
      return;
    }

    fd.append(k, String(v));
  });

  const r = await api.patch(`/api/products/${id}`, fd); // no headers
  return r.data;
}
