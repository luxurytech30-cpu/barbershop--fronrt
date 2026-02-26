import { api } from "./api";

export async function getCart() {
  const { data } = await api.get("/api/cart");
  return data;
}

export async function setCart(items) {
  const { data } = await api.post("/api/cart/set", { items });
  return data;
}

export async function clearCart() {
  const { data } = await api.post("/api/cart/clear");
  return data;
}