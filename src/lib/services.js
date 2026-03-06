import { api } from "./api";

// ✅ Users (only active)
export async function listServices() {
  const r = await api.get("/api/services?active=1");
  return r.data.services ?? [];
}

// ✅ Admin
export async function adminListServices() {
  const r = await api.get("/api/services/admin/all");
  return r.data.services ?? [];
}

export async function adminCreateService(values) {
  const r = await api.post("/api/services/admin", values);
  return r.data.service;
}

export async function adminUpdateService(id, values) {
  const r = await api.patch(`/api/services/admin/${id}`, values);
  return r.data.service;
}

export async function adminDeleteService(id) {
  const r = await api.delete(`/api/services/admin/${id}`);
  return r.data;
}
