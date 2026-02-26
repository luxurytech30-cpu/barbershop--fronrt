import { api } from "./api";

export async function getBarberSchedule(barberId) {
  const { data } = await api.get(`/api/barbers-schedule/${barberId}`);
  console.log("barber schu:", data);
  return data?.data ?? data; // supports {success,data} or raw
}

export async function setWeeklyHours(barberId, weeklyHours) {
  const { data } = await api.put(
    `/api/barbers-schedule/${barberId}/weekly-hours`,
    {
      weeklyHours,
    },
  );
  return data?.data ?? data;
}

export async function setWeeklyBreaks(barberId, weeklyBreaks) {
  const { data } = await api.put(
    `/api/barbers-schedule/${barberId}/weekly-breaks`,
    {
      weeklyBreaks,
    },
  );
  return data?.data ?? data;
}

export async function blockDate(barberId, date, note = "") {
  const { data } = await api.post(
    `/api/barbers-schedule/${barberId}/block-date`,
    {
      date,
      note,
    },
  );
  return data?.data ?? data;
}

export async function overrideDate(barberId, payload) {
  const { data } = await api.post(
    `/api/barbers-schedule/${barberId}/override-date`,
    payload,
  );
  return data?.data ?? data;
}

export async function deleteOverride(barberId, date) {
  const { data } = await api.delete(
    `/api/barbers-schedule/${barberId}/override-date/${date}`,
  );
  return data?.data ?? data;
}
