import { api } from "./api";

function hasFile(values) {
  return values?.imageFile instanceof File || values?.image instanceof File;
}

function toFormData(values) {
  const fd = new FormData();
  Object.entries(values || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;

    if ((k === "image" || k === "imageFile") && v instanceof File) {
      fd.append("image", v);
      return;
    }

    // keep booleans/numbers as strings (backend should cast)
    fd.append(k, String(v));
  });
  return fd;
}

export async function listBarbers({ all = false, activeOnly = false } = {}) {
  const params = {};
  if (all) params.all = "true";
  if (activeOnly) params.activeOnly = "true";

  const { data } = await api.get("/api/barbers", {
    params: Object.keys(params).length ? params : undefined,
  });
  console.log("bar:", data);
  return data;
}

export async function createBarber(values) {
  if (hasFile(values)) {
    const { data } = await api.post("/api/barbers", toFormData(values));
    return data;
  }

  // no file -> JSON (easier types)
  const { data } = await api.post("/api/barbers", values);
  return data;
}

export async function updateBarber(id, values) {
  if (hasFile(values)) {
    const { data } = await api.patch(`/api/barbers/${id}`, toFormData(values));
    return data;
  }

  const { data } = await api.patch(`/api/barbers/${id}`, values);
  return data;
}

export async function deleteBarber(id) {
  const { data } = await api.delete(`/api/barbers/${id}`);
  return data;
}
