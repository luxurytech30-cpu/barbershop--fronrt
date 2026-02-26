import { useEffect, useState } from "react";
import { listCourses, createCourse } from "../../lib/courses";
import { listBarbers } from "../../lib/barbers";
import { api } from "../../lib/api";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [barbers, setBarbers] = useState([]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("zoom");
  const [barberId, setBarberId] = useState("");

  async function refresh() {
    const [c, b] = await Promise.all([listCourses(), listBarbers()]);
    setCourses(c);
    setBarbers(b);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e) {
    e.preventDefault();

    await createCourse({
      title,
      type,
      barberId,
      dates: [],
    });

    setTitle("");
    refresh();
  }

  async function onDelete(id) {
    if (!confirm("Delete course?")) return;
    await api.delete(`/api/courses/${id}`);
    refresh();
  }

  return (
    <div>
      <h2>Courses</h2>

      <form onSubmit={onCreate} style={form}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="zoom">Zoom</option>
          <option value="online">Online</option>
        </select>

        <select value={barberId} onChange={(e) => setBarberId(e.target.value)}>
          <option value="">Barber</option>
          {barbers.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>

        <button>Create</button>
      </form>

      {courses.map((c) => (
        <div key={c._id} style={row}>
          <div style={{ flex: 1 }}>{c.title} — {c.type}</div>
          <button onClick={() => onDelete(c._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

const form = { display: "flex", gap: 10, marginBottom: 20 };
const row = { display: "flex", gap: 10, marginBottom: 10 };