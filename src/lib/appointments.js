// src/lib/appointments.js
import { api } from "./api";

export async function listAppointments({ date, barberId } = {}) {
  const params = {};
  if (date) params.date = date; // "YYYY-MM-DD"
  if (barberId) params.barberId = barberId;

  const { data } = await api.get("/api/appointments", {
    params: Object.keys(params).length ? params : undefined,
  });
  return data;
}

export async function createAppointment(values) {
  const { data } = await api.post("/api/appointments", values);
  return data;
}

export async function updateAppointment(id, values) {
  const { data } = await api.patch(`/api/appointments/${id}`, values);
  return data;
}

export async function cancelAppointment(id) {
  const { data } = await api.delete(`/api/appointments/${id}`);
  return data;
}
