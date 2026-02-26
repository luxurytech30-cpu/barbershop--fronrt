import { api } from "./api";

export async function register(payload) {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
}

export async function login(username, password) {
  const { data } = await api.post("/api/auth/login", { username, password });
  return data;
}

export async function me() {
  const { data } = await api.get("/api/auth/me");
  return data.user; // {id, role, username} or null
}

export async function logout() {
  const { data } = await api.post("/api/auth/logout");
  return data;
}