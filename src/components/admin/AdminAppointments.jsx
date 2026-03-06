// src/components/admin/AdminAppointments.jsx
import { useEffect, useMemo, useState } from "react";
import { listBarbers } from "../../lib/barbers";
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from "../../lib/appointments";
import { getBarberSchedule } from "../../lib/barberSchedule";

const STATUS = [
  "booked",
  "checked_in",
  "in_service",
  "done",
  "cancelled",
  "no_show",
];

const SERVICE_OPTIONS = [
  { value: "", label: "Select service…" },
  { value: "Haircut", label: "Haircut" },
  { value: "Beard", label: "Beard" },
  { value: "Haircut+Beard", label: "Haircut + Beard" },
  { value: "Kids", label: "Kids" },
  { value: "Color", label: "Color" },
];

// ---------- time helpers ----------
function pad2(n) {
  return String(n).padStart(2, "0");
}
function todayYYYYMMDD() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function isoFromDateTime(dateStr, timeStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0); // local
  return dt.toISOString();
}
function splitIsoToLocal(dateIso) {
  const d = new Date(dateIso);
  const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const timeStr = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return { dateStr, timeStr };
}
function fmtTime(dateIso) {
  const d = new Date(dateIso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function toMin(t) {
  const [h, m] = String(t || "00:00")
    .split(":")
    .map(Number);
  return (h || 0) * 60 + (m || 0);
}
function toHHMM(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${pad2(h)}:${pad2(m)}`;
}
function addMin(t, minutes) {
  return toHHMM(toMin(t) + minutes);
}
function overlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}
function getDayKey(dateStr) {
  // midday avoids timezone edge-cases
  const d = new Date(`${dateStr}T12:00:00`);
  return String(d.getDay()); // "0".."6"
}
function ensureObj(m) {
  if (!m) return {};
  return typeof m === "object" ? m : {};
}
function getOverrideForDate(schedule, dateStr) {
  return (schedule?.overrides || []).find((o) => o.date === dateStr) || null;
}

/**
 * Build available start slots for a barber on a given date:
 * - weekly hours or override hours
 * - removes breaks (weekly or override)
 * - removes overlaps with existing appointments (except cancelled)
 * - supports allowing one appointment id (editing same row)
 */
function buildSlots({
  schedule,
  dateStr,
  existingAppointments = [],
  slotMinutesFallback = 30,
  allowAppointmentId = null,
}) {
  const slotMinutes = Number(schedule?.slotMinutes || slotMinutesFallback);

  const ov = getOverrideForDate(schedule, dateStr);
  if (ov?.isClosed) {
    return {
      closed: true,
      note: ov.note || "Closed day",
      slots: [],
      slotMinutes,
    };
  }

  const dayKey = getDayKey(dateStr);

  const weeklyHours = ensureObj(schedule?.weeklyHours);
  const weeklyBreaks = ensureObj(schedule?.weeklyBreaks);

  const hours = (ov?.hours?.length ? ov.hours : weeklyHours?.[dayKey]) || [];
  const breaks =
    (ov?.breaks?.length ? ov.breaks : weeklyBreaks?.[dayKey]) || [];

  if (!Array.isArray(hours) || hours.length === 0) {
    return {
      closed: true,
      note: ov?.note || "Closed (no hours set)",
      slots: [],
      slotMinutes,
    };
  }

  const booked = (existingAppointments || [])
    .filter((a) => a && a.status !== "cancelled")
    .filter(
      (a) =>
        !allowAppointmentId || String(a._id) !== String(allowAppointmentId),
    )
    .map((a) => ({
      start: toMin(fmtTime(a.startAt)),
      end: toMin(fmtTime(a.endAt)),
    }));

  const slots = [];
  for (const h of hours) {
    const startMin = toMin(h.start);
    const endMin = toMin(h.end);

    for (let t = startMin; t + slotMinutes <= endMin; t += slotMinutes) {
      const slotStart = t;
      const slotEnd = t + slotMinutes;

      // ✅ block past times (only for today, local)
      const todayStr = todayYYYYMMDD();
      if (dateStr === todayStr) {
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const buffer = 10;
        if (slotStart <= nowMin + buffer) continue;
      }

      const inBreak = (breaks || []).some((b) =>
        overlap(slotStart, slotEnd, toMin(b.start), toMin(b.end)),
      );
      if (inBreak) continue;

      const isBooked = booked.some((x) =>
        overlap(slotStart, slotEnd, x.start, x.end),
      );
      if (isBooked) continue;

      slots.push(toHHMM(slotStart));
    }
  }

  return { closed: false, note: ov?.note || "", slots, slotMinutes };
}
function isPastDate(dateStr) {
  return dateStr < todayYYYYMMDD(); // works because YYYY-MM-DD
}
// ---------- component ----------
export default function AdminAppointments() {
  const [barbers, setBarbers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [date, setDate] = useState(todayYYYYMMDD());
  const [barberId, setBarberId] = useState("");

  // create
  const [create, setCreate] = useState({
    barberId: "",
    customerName: "",
    phone: "",
    service: "",
    notes: "",
    date: todayYYYYMMDD(),
    startTime: "",
    endTime: "",
  });
  const [createSlots, setCreateSlots] = useState([]);
  const [createSlotMinutes, setCreateSlotMinutes] = useState(30);
  const [createMsg, setCreateMsg] = useState("");

  // edit
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({
    barberId: "",
    customerName: "",
    phone: "",
    service: "",
    notes: "",
    status: "booked",
    date: todayYYYYMMDD(),
    startTime: "",
    endTime: "",
  });
  const [editSlots, setEditSlots] = useState([]);
  const [editSlotMinutes, setEditSlotMinutes] = useState(30);
  const [editMsg, setEditMsg] = useState("");

  const count = useMemo(() => items.length, [items]);

  async function loadBarbers() {
    try {
      const data = await listBarbers({ all: true });
      setBarbers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("LOAD BARBERS ERROR:", e?.response?.data || e);
      setBarbers([]);
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      const data = await listAppointments({
        date,
        barberId: barberId || undefined,
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("LIST APPOINTMENTS ERROR:", e?.response?.data || e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBarbers();
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, barberId]);

  function resetCreate() {
    setCreate({
      barberId: "",
      customerName: "",
      phone: "",
      service: "",
      notes: "",
      date: todayYYYYMMDD(),
      startTime: "",
      endTime: "",
    });
    setCreateSlots([]);
    setCreateMsg("");
    setCreateSlotMinutes(30);
  }

  // ---- availability loaders ----
  async function loadCreateAvailability(nextCreate = create) {
    if (!nextCreate.barberId || !nextCreate.date) {
      setCreateSlots([]);
      setCreateMsg("Pick barber + date");
      return;
    }

    try {
      const schedule = await getBarberSchedule(nextCreate.barberId);
      const appts = await listAppointments({
        date: nextCreate.date,
        barberId: nextCreate.barberId,
      });

      const r = buildSlots({
        schedule,
        dateStr: nextCreate.date,
        existingAppointments: Array.isArray(appts) ? appts : [],
        slotMinutesFallback: 30,
      });

      setCreateSlotMinutes(r.slotMinutes);

      if (r.closed) {
        setCreateSlots([]);
        setCreateMsg(r.note || "Closed");
        setCreate((s) => ({ ...s, startTime: "", endTime: "" }));
        return;
      }

      if (!r.slots.length) {
        setCreateSlots([]);
        setCreateMsg(r.note ? `No slots (${r.note})` : "No available slots");
        setCreate((s) => ({ ...s, startTime: "", endTime: "" }));
        return;
      }

      setCreateSlots(r.slots);
      setCreateMsg(r.note || "");

      // pick first slot if current not valid
      const start = r.slots.includes(nextCreate.startTime)
        ? nextCreate.startTime
        : r.slots[0];
      const end = addMin(start, r.slotMinutes);
      setCreate((s) => ({ ...s, startTime: start, endTime: end }));
    } catch (e) {
      console.log("CREATE AVAILABILITY ERROR:", e?.response?.data || e);
      setCreateSlots([]);
      setCreateMsg("Failed to load availability");
      setCreate((s) => ({ ...s, startTime: "", endTime: "" }));
    }
  }

  async function loadEditAvailability(nextEdit = edit, allowId = editingId) {
    if (!nextEdit.barberId || !nextEdit.date) {
      setEditSlots([]);
      setEditMsg("Pick barber + date");
      return;
    }

    try {
      const schedule = await getBarberSchedule(nextEdit.barberId);
      const appts = await listAppointments({
        date: nextEdit.date,
        barberId: nextEdit.barberId,
      });

      const r = buildSlots({
        schedule,
        dateStr: nextEdit.date,
        existingAppointments: Array.isArray(appts) ? appts : [],
        slotMinutesFallback: 30,
        allowAppointmentId: allowId, // allow its own time slot
      });

      setEditSlotMinutes(r.slotMinutes);

      if (r.closed) {
        setEditSlots([]);
        setEditMsg(r.note || "Closed");
        return;
      }

      setEditSlots(r.slots);
      setEditMsg(r.note || "");

      // ensure endTime matches slotMinutes if start exists
      if (nextEdit.startTime) {
        setEdit((s) => ({
          ...s,
          endTime: addMin(nextEdit.startTime, r.slotMinutes),
        }));
      }
    } catch (e) {
      console.log("EDIT AVAILABILITY ERROR:", e?.response?.data || e);
      setEditSlots([]);
      setEditMsg("Failed to load availability");
    }
  }

  useEffect(() => {
    loadCreateAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [create.barberId, create.date]);

  useEffect(() => {
    if (!editingId) return;
    loadEditAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId, edit.barberId, edit.date]);

  // ---- CRUD ----
  async function onCreate(e) {
    e.preventDefault();
    if (isPastDate(create.date)) return alert("Cannot book in the past");
    if (!create.barberId) return alert("Select barber");
    if (!create.customerName.trim()) return alert("Customer name required");
    if (!create.date) return alert("Select date");
    if (!create.startTime) return alert("Select start time");

    try {
      await createAppointment({
        barberId: create.barberId,
        customerName: create.customerName.trim(),
        phone: create.phone.trim(),
        service: create.service || "",
        notes: create.notes.trim(),
        startAt: isoFromDateTime(create.date, create.startTime),
        endAt: isoFromDateTime(
          create.date,
          create.endTime || addMin(create.startTime, createSlotMinutes),
        ),
      });

      // keep barber/date maybe? you can choose. I keep date and barber for fast work
      setCreate((s) => ({
        ...s,
        customerName: "",
        phone: "",
        service: "",
        notes: "",
      }));
      await refresh();
      await loadCreateAvailability();
    } catch (e2) {
      console.log("CREATE APPOINTMENT ERROR:", e2?.response?.data || e2);
      alert(e2?.response?.data?.message || e2?.message || "Create failed");
    }
  }

  function startEditRow(a) {
    setEditingId(a._id);
    const start = splitIsoToLocal(a.startAt);
    const end = splitIsoToLocal(a.endAt);

    setEdit({
      barberId: a.barberId?._id || a.barberId || "",
      customerName: a.customerName || "",
      phone: a.phone || "",
      service: a.service || "",
      notes: a.notes || "",
      status: a.status || "booked",
      date: start.dateStr,
      startTime: start.timeStr,
      endTime: end.timeStr,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEdit({
      barberId: "",
      customerName: "",
      phone: "",
      service: "",
      notes: "",
      status: "booked",
      date: todayYYYYMMDD(),
      startTime: "",
      endTime: "",
    });
    setEditSlots([]);
    setEditMsg("");
    setEditSlotMinutes(30);
  }

  async function saveEdit(id) {
    if (!edit.barberId) return alert("Select barber");
    if (!edit.customerName.trim()) return alert("Customer name required");
    if (!edit.date) return alert("Select date");
    if (!edit.startTime) return alert("Select start time");
    if (isPastDate(edit.date))
      return alert("Cannot move appointment to the past");
    // extra guard: if the chosen slot is not in available list, block
    if (editSlots.length && !editSlots.includes(edit.startTime)) {
      return alert(
        "This time is not available (schedule/breaks/blocked/booked). Choose another time.",
      );
    }

    try {
      await updateAppointment(id, {
        barberId: edit.barberId,
        customerName: edit.customerName.trim(),
        phone: edit.phone.trim(),
        service: edit.service || "",
        notes: edit.notes.trim(),
        status: edit.status,
        startAt: isoFromDateTime(edit.date, edit.startTime),
        endAt: isoFromDateTime(
          edit.date,
          edit.endTime || addMin(edit.startTime, editSlotMinutes),
        ),
      });

      cancelEdit();
      await refresh();
    } catch (e2) {
      console.log("UPDATE APPOINTMENT ERROR:", e2?.response?.data || e2);
      alert(e2?.response?.data?.message || e2?.message || "Update failed");
    }
  }

  async function onCancel(id) {
    if (!confirm("Cancel appointment?")) return;
    try {
      await cancelAppointment(id);
      await refresh();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Cancel failed");
    }
  }

  const barberName = (id) =>
    barbers.find((b) => String(b._id) === String(id))?.name || "—";

  // ---------- UI ----------
  return (
    <div style={page}>
      <div style={topBar}>
        <div>
          <div style={title}>Appointments</div>
          <div style={subTitle}>
            Admin can create/edit/cancel. Times are limited by schedule + breaks
            + blocked dates + existing bookings.
          </div>
        </div>

        <div style={pill}>
          <span style={{ opacity: 0.8 }}>Total</span>
          <span style={{ fontWeight: 900 }}>{count}</span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={filtersRow}>
          <label style={field}>
            <span style={label}>Date</span>
            <input
              style={input}
              type="date"
              value={date}
              //   min={todayYYYYMMDD()}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label style={field}>
            <span style={label}>Barber</span>
            <select
              style={input}
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
            >
              <option value="">All barbers</option>
              {barbers.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <button style={btn} onClick={refresh} type="button">
            Refresh
          </button>
        </div>
      </div>

      {/* Create */}
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <div style={cardTitle}>Create Appointment</div>
            <div style={cardHint}>
              Pick barber + date, then choose an available time slot.
            </div>
          </div>
        </div>

        {createMsg ? (
          <div
            style={{
              ...noteBox,
              borderColor: createSlots.length
                ? "rgba(255,255,255,0.14)"
                : "rgba(255,120,120,0.35)",
            }}
          >
            {createSlots.length ? `ℹ ${createMsg}` : `⚠ ${createMsg}`}
          </div>
        ) : null}

        <form onSubmit={onCreate} style={formGrid}>
          <label style={field}>
            <span style={label}>Barber</span>
            <select
              style={input}
              value={create.barberId}
              onChange={(e) => {
                const barberId = e.target.value;
                setCreate((s) => ({
                  ...s,
                  barberId,
                  startTime: "",
                  endTime: "",
                }));
              }}
            >
              <option value="">Select barber…</option>
              {barbers.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label style={field}>
            <span style={label}>Date</span>
            <input
              style={input}
              type="date"
              min={todayYYYYMMDD()}
              value={create.date}
              onChange={(e) =>
                setCreate((s) => ({
                  ...s,
                  date: e.target.value,
                  startTime: "",
                  endTime: "",
                }))
              }
            />
          </label>

          <label style={field}>
            <span style={label}>Start Time</span>
            <select
              style={input}
              value={create.startTime}
              disabled={
                !create.barberId || !create.date || createSlots.length === 0
              }
              onChange={(e) => {
                const startTime = e.target.value;
                setCreate((s) => ({
                  ...s,
                  startTime,
                  endTime: startTime
                    ? addMin(startTime, createSlotMinutes)
                    : "",
                }));
              }}
            >
              {createSlots.length === 0 ? (
                <option value="">
                  {create.barberId && create.date
                    ? "No available slots"
                    : "Pick barber + date"}
                </option>
              ) : (
                createSlots.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))
              )}
            </select>
          </label>

          <label style={field}>
            <span style={label}>End Time</span>
            <input style={input} type="time" value={create.endTime} readOnly />
          </label>

          <label style={field}>
            <span style={label}>Service</span>
            <select
              style={input}
              value={create.service}
              onChange={(e) =>
                setCreate((s) => ({ ...s, service: e.target.value }))
              }
            >
              {SERVICE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label style={field}>
            <span style={label}>Customer Name</span>
            <input
              style={input}
              value={create.customerName}
              onChange={(e) =>
                setCreate((s) => ({ ...s, customerName: e.target.value }))
              }
            />
          </label>

          <label style={field}>
            <span style={label}>Phone</span>
            <input
              style={input}
              value={create.phone}
              onChange={(e) =>
                setCreate((s) => ({ ...s, phone: e.target.value }))
              }
            />
          </label>

          <label style={{ ...field, gridColumn: "1 / -1" }}>
            <span style={label}>Notes</span>
            <input
              style={input}
              value={create.notes}
              onChange={(e) =>
                setCreate((s) => ({ ...s, notes: e.target.value }))
              }
            />
          </label>

          <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
            <button
              type="submit"
              style={{
                ...btn,
                ...btnPrimary,
                opacity: createSlots.length ? 1 : 0.55,
              }}
              disabled={!createSlots.length}
            >
              Create
            </button>

            <button type="button" style={btn} onClick={resetCreate}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={listWrap}>
        <div style={listScroll}>
          {loading ? (
            <div style={empty}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={empty}>No appointments for this filter.</div>
          ) : (
            items.map((a) => {
              const isEditing = editingId === a._id;
              const rowBarberId = a.barberId?._id || a.barberId;

              return (
                <div key={a._id} style={productCard}>
                  <div style={productTop}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={productNameRow}>
                        <div style={productName}>
                          {fmtTime(a.startAt)}–{fmtTime(a.endAt)} •{" "}
                          {a.customerName}
                        </div>

                        <div
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          <span style={badgeSoft}>
                            {barberName(rowBarberId)}
                          </span>
                          <span style={badgeSoft}>{a.status}</span>
                          {a.phone ? (
                            <span style={badgeSoft}>{a.phone}</span>
                          ) : null}
                          {a.service ? (
                            <span style={badgeSoft}>{a.service}</span>
                          ) : null}
                        </div>
                      </div>

                      {a.notes ? <div style={noteText}>{a.notes}</div> : null}
                    </div>

                    <div style={actions}>
                      {a.status !== "cancelled" ? (
                        <button
                          style={{ ...btn, ...btnDanger }}
                          onClick={() => onCancel(a._id)}
                          type="button"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          style={{ ...btn, ...btnDanger, opacity: 0.6 }}
                          disabled
                          type="button"
                        >
                          Cancelled
                        </button>
                      )}

                      {!isEditing ? (
                        <button
                          style={{ ...btn, ...btnPrimary }}
                          onClick={() => startEditRow(a)}
                          type="button"
                        >
                          Edit
                        </button>
                      ) : (
                        <button style={btn} onClick={cancelEdit} type="button">
                          Close
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Edit panel */}
                  {isEditing && (
                    <div style={editPanel}>
                      {editMsg ? (
                        <div style={{ ...noteBox, marginTop: 0 }}>
                          ℹ {editMsg}
                        </div>
                      ) : null}

                      <div style={editGrid}>
                        <label style={field}>
                          <span style={label}>Barber</span>
                          <select
                            style={input}
                            value={edit.barberId}
                            onChange={(e) =>
                              setEdit((s) => ({
                                ...s,
                                barberId: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select barber…</option>
                            {barbers.map((b) => (
                              <option key={b._id} value={b._id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label style={field}>
                          <span style={label}>Date</span>
                          <input
                            style={input}
                            type="date"
                            min={todayYYYYMMDD()}
                            value={edit.date}
                            onChange={(e) =>
                              setEdit((s) => ({ ...s, date: e.target.value }))
                            }
                          />
                        </label>

                        <label style={field}>
                          <span style={label}>Start Time</span>
                          <select
                            style={input}
                            value={edit.startTime}
                            disabled={
                              !edit.barberId ||
                              !edit.date ||
                              editSlots.length === 0
                            }
                            onChange={(e) => {
                              const startTime = e.target.value;
                              setEdit((s) => ({
                                ...s,
                                startTime,
                                endTime: startTime
                                  ? addMin(startTime, editSlotMinutes)
                                  : "",
                              }));
                            }}
                          >
                            {editSlots.length === 0 ? (
                              <option value="">
                                {!edit.barberId || !edit.date
                                  ? "Pick barber + date"
                                  : "No available slots"}
                              </option>
                            ) : (
                              editSlots.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))
                            )}
                          </select>
                        </label>

                        <label style={field}>
                          <span style={label}>End Time</span>
                          <input
                            style={input}
                            type="time"
                            value={edit.endTime}
                            readOnly
                          />
                        </label>

                        <label style={field}>
                          <span style={label}>Service</span>
                          <select
                            style={input}
                            value={edit.service}
                            onChange={(e) =>
                              setEdit((s) => ({
                                ...s,
                                service: e.target.value,
                              }))
                            }
                          >
                            {SERVICE_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <EditField
                          label="Customer Name"
                          value={edit.customerName}
                          onChange={(v) =>
                            setEdit((s) => ({ ...s, customerName: v }))
                          }
                        />

                        <EditField
                          label="Phone"
                          value={edit.phone}
                          onChange={(v) => setEdit((s) => ({ ...s, phone: v }))}
                        />

                        <label style={field}>
                          <span style={label}>Status</span>
                          <select
                            style={input}
                            value={edit.status}
                            onChange={(e) =>
                              setEdit((s) => ({ ...s, status: e.target.value }))
                            }
                          >
                            {STATUS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label style={{ ...field, gridColumn: "1 / -1" }}>
                          <span style={label}>Notes</span>
                          <input
                            style={input}
                            value={edit.notes}
                            onChange={(e) =>
                              setEdit((s) => ({ ...s, notes: e.target.value }))
                            }
                          />
                        </label>
                      </div>

                      <div style={editActions}>
                        <button
                          style={{
                            ...btn,
                            ...btnPrimary,
                            opacity: editSlots.length ? 1 : 0.55,
                          }}
                          onClick={() => saveEdit(a._id)}
                          type="button"
                          disabled={!editSlots.length}
                        >
                          Save changes
                        </button>
                        <button style={btn} onClick={cancelEdit} type="button">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function EditField({ label: labelText, value, onChange }) {
  return (
    <label style={field}>
      <span style={label}>{labelText}</span>
      <input
        style={input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/* ===== styles ===== */

const page = {
  maxWidth: 1100,
  margin: "26px auto",
  padding: 18,
  paddingTop: 170,
  color: "#fff",
};

const topBar = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
};

const title = { fontSize: 26, fontWeight: 950, letterSpacing: 0.5 };
const subTitle = { marginTop: 6, fontSize: 13, opacity: 0.75 };

const pill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.05)",
};

const card = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.14)",
  background:
    "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
  padding: 14,
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
};

const noteBox = {
  marginTop: 10,
  marginBottom: 12,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.22)",
  opacity: 0.95,
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 10,
};

const cardTitle = { fontSize: 15, fontWeight: 900, letterSpacing: 0.4 };
const cardHint = { fontSize: 12, opacity: 0.7 };

const filtersRow = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  alignItems: "end",
};

const formGrid = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  alignItems: "end",
};

const empty = {
  padding: 18,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  opacity: 0.85,
};

const productCard = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.22)",
  padding: 12,
  boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
};

const productTop = { display: "flex", gap: 12, alignItems: "center" };

const productNameRow = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  justifyContent: "space-between",
};

const productName = {
  fontSize: 15,
  fontWeight: 900,
  letterSpacing: 0.2,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: 520,
};

const noteText = { marginTop: 6, opacity: 0.8, fontSize: 12 };

const actions = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexShrink: 0,
};

const badgeSoft = {
  fontSize: 11,
  fontWeight: 800,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  opacity: 0.95,
};

const editPanel = {
  marginTop: 12,
  paddingTop: 12,
  borderTop: "1px solid rgba(255,255,255,0.12)",
};

const editGrid = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
};

const editActions = { display: "flex", gap: 10, marginTop: 12 };

const field = { display: "grid", gap: 6 };
const label = { fontSize: 12, opacity: 0.8 };

const input = {
  padding: "11px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  outline: "none",
};

const btn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
const listWrap = {
  marginTop: 16,
};

const listScroll = {
  display: "grid",
  gap: 12,
  maxHeight: "70vh",
  overflowY: "auto",
  paddingRight: 6,
  scrollbarWidth: "thin",
};
const btnPrimary = {
  border: "1px solid rgba(255,255,255,0.42)",
  background: "#fff",
  color: "#111",
};

const btnDanger = {
  border: "1px solid rgba(255,120,120,0.55)",
  background: "rgba(255,120,120,0.12)",
  color: "#ffd2d2",
};
