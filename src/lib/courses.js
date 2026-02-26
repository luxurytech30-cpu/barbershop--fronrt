import { api } from "./api";

export async function listCourses() {
  const { data } = await api.get("/api/courses");
  return data;
}

/**
 * dates example:
 * [
 *  { startAt: "2026-03-10T10:00", endAt: "2026-03-10T12:00", zoomLink: "..." }
 * ]
 */
export async function createCourse({ title, type, barberId, dates = [], isActive = true }) {
  const payload = { title, type, barberId, dates, isActive };
  const { data } = await api.post("/api/courses", payload);
  return data;
}