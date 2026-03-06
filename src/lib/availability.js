import { api } from "./api";

// durationMin is the selected service duration
export async function getAvailability(barberId, date, durationMin) {
  const r = await api.get(`/api/availability/${barberId}`, {
    params: { date, durationMin },
  });
  // your route returns { success, data }
  return r.data?.data ?? { slots: [] };
}
