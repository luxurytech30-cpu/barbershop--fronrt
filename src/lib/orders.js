import { api } from "./api";

export async function createOrder() {
  const { data } = await api.post("/api/orders");
  return data;
}

export async function myOrders() {
  const { data } = await api.get("/api/orders/me");
  return data;
}