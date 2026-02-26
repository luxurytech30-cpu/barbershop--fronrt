// import { useEffect, useMemo, useState } from "react";
// import {
//   getBarberSchedule,
//   setWeeklyHours,
//   setWeeklyBreaks,
//   blockDate,
//   overrideDate,
//   deleteOverride,
// } from "../../lib/barberSchedule";

// const DAYS = [
//   { key: "0", label: "Sunday" },
//   { key: "1", label: "Monday" },
//   { key: "2", label: "Tuesday" },
//   { key: "3", label: "Wednesday" },
//   { key: "4", label: "Thursday" },
//   { key: "5", label: "Friday" },
//   { key: "6", label: "Saturday" },
// ];

// const emptyRange = () => ({ start: "09:00", end: "17:00" });
// const emptyBreak = () => ({ start: "13:00", end: "13:30" });

// function ensureObj(m) {
//   if (!m) return {};
//   return typeof m === "object" ? m : {};
// }

// function safeArr(x) {
//   return Array.isArray(x) ? x : [];
// }

// export default function AdminBarberSchedule({ barberId }) {
//   const [loading, setLoading] = useState(true);

//   const [weeklyHours, setWeeklyHoursState] = useState({});
//   const [weeklyBreaks, setWeeklyBreaksState] = useState({});
//   const [overrides, setOverrides] = useState([]);

//   // override form
//   const [ovDate, setOvDate] = useState("");
//   const [ovIsClosed, setOvIsClosed] = useState(false);
//   const [ovNote, setOvNote] = useState("");
//   const [ovHours, setOvHours] = useState([emptyRange()]);
//   const [ovBreaks, setOvBreaks] = useState([emptyBreak()]);

//   const overridesSorted = useMemo(() => {
//     return [...(overrides || [])].sort((a, b) =>
//       String(a.date).localeCompare(String(b.date)),
//     );
//   }, [overrides]);

//   async function refresh() {
//     if (!barberId) return;
//     setLoading(true);
//     try {
//       const s = await getBarberSchedule(barberId);
//       console.log("SCHEDULE:", s);
//       setWeeklyHoursState(ensureObj(s.weeklyHours));
//       setWeeklyBreaksState(ensureObj(s.weeklyBreaks));
//       setOverrides(Array.isArray(s.overrides) ? s.overrides : []);
//     } catch (e) {
//       console.log("LOAD SCHEDULE ERROR:", e?.response?.data || e);
//       alert(
//         e?.response?.data?.error ||
//           e?.response?.data?.message ||
//           e?.message ||
//           "Load failed",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     refresh();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [barberId]);

//   // -------- weekly hours ----------
//   function addWeeklyRange(dayKey) {
//     setWeeklyHoursState((s) => {
//       const arr = safeArr(s[dayKey]).slice();
//       arr.push(emptyRange());
//       return { ...s, [dayKey]: arr };
//     });
//   }

//   function removeWeeklyRange(dayKey, idx) {
//     setWeeklyHoursState((s) => {
//       const arr = safeArr(s[dayKey]).slice();
//       arr.splice(idx, 1);
//       return { ...s, [dayKey]: arr };
//     });
//   }

//   function updateWeeklyRange(dayKey, idx, patch) {
//     setWeeklyHoursState((s) => {
//       const arr = safeArr(s[dayKey]).slice();
//       arr[idx] = { ...(arr[idx] || emptyRange()), ...patch };
//       return { ...s, [dayKey]: arr };
//     });
//   }

//   // -------- weekly breaks ----------
//   function addWeeklyBreak(dayKey) {
//     setWeeklyBreaksState((s) => {
//       const arr = safeArr(s[dayKey]).slice();
//       arr.push(emptyBreak());
//       return { ...s, [dayKey]: arr };
//     });
//   }

//   function removeWeeklyBreak(dayKey, idx) {
//     setWeeklyBreaksState((s) => {
//       const arr = safeArr(s[dayKey]).slice();
//       arr.splice(idx, 1);
//       return { ...s, [dayKey]: arr };
//     });
//   }

//   function updateWeeklyBreak(dayKey, idx, patch) {
//     setWeeklyBreaksState((s) => {
//       const arr = safeArr(s[dayKey]).slice();
//       arr[idx] = { ...(arr[idx] || emptyBreak()), ...patch };
//       return { ...s, [dayKey]: arr };
//     });
//   }

//   async function saveWeeklyAll() {
//     try {
//       await Promise.all([
//         setWeeklyHours(barberId, weeklyHours),
//         setWeeklyBreaks(barberId, weeklyBreaks),
//       ]);
//       alert("Weekly schedule saved ✅");
//       refresh();
//     } catch (e) {
//       alert(
//         e?.response?.data?.error ||
//           e?.response?.data?.message ||
//           e?.message ||
//           "Save failed",
//       );
//     }
//   }

//   // -------- overrides ----------
//   function addOvHour() {
//     setOvHours((a) => [...a, emptyRange()]);
//   }
//   function rmOvHour(i) {
//     setOvHours((a) => a.filter((_, idx) => idx !== i));
//   }
//   function updOvHour(i, patch) {
//     setOvHours((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
//   }

//   function addOvBreak() {
//     setOvBreaks((a) => [...a, emptyBreak()]);
//   }
//   function rmOvBreak(i) {
//     setOvBreaks((a) => a.filter((_, idx) => idx !== i));
//   }
//   function updOvBreak(i, patch) {
//     setOvBreaks((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
//   }

//   async function onBlockDate() {
//     if (!ovDate) return alert("Pick a date");
//     try {
//       const next = await blockDate(barberId, ovDate, ovNote);
//       setOverrides(Array.isArray(next) ? next : []);
//       alert("Date blocked ✅");
//     } catch (e) {
//       alert(
//         e?.response?.data?.error ||
//           e?.response?.data?.message ||
//           e?.message ||
//           "Block failed",
//       );
//     }
//   }

//   async function onOverrideDate() {
//     if (!ovDate) return alert("Pick a date");
//     try {
//       const payload = {
//         date: ovDate,
//         isClosed: ovIsClosed,
//         hours: ovIsClosed ? [] : ovHours,
//         breaks: ovIsClosed ? [] : ovBreaks,
//         note: ovNote,
//       };
//       const next = await overrideDate(barberId, payload);
//       setOverrides(Array.isArray(next) ? next : []);
//       alert("Override saved ✅");
//     } catch (e) {
//       alert(
//         e?.response?.data?.error ||
//           e?.response?.data?.message ||
//           e?.message ||
//           "Override failed",
//       );
//     }
//   }

//   async function onDeleteOverride(date) {
//     if (!confirm(`Delete override for ${date}?`)) return;
//     try {
//       const next = await deleteOverride(barberId, date);
//       setOverrides(Array.isArray(next) ? next : []);
//     } catch (e) {
//       alert(
//         e?.response?.data?.error ||
//           e?.response?.data?.message ||
//           e?.message ||
//           "Delete failed",
//       );
//     }
//   }

//   // UI states
//   if (!barberId) {
//     return <div style={wrap}>Pick a barber to manage schedule.</div>;
//   }

//   if (loading) {
//     return <div style={wrap}>Loading schedule…</div>;
//   }

//   return (
//     <div style={wrap}>
//       {/* responsive grid helpers */}
//       <style>{`
//         .daysGrid { display:grid; gap:12px; grid-template-columns:repeat(3,minmax(0,1fr)); }
//         @media (max-width: 980px){ .daysGrid{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
//         @media (max-width: 640px){ .daysGrid{ grid-template-columns:repeat(1,minmax(0,1fr)); } }
//       `}</style>

//       <div style={headerRow}>
//         <div>
//           <div style={h2}>Barber Schedule</div>
//           <div style={hint}>
//             Set weekly hours + breaks, and override specific dates (holiday /
//             closed / custom hours).
//           </div>
//         </div>

//         <button type="button" style={btnPrimary} onClick={saveWeeklyAll}>
//           Save Weekly (Hours + Breaks)
//         </button>
//       </div>

//       {/* WEEKLY */}
//       <div style={section}>
//         <div style={sectionTitle}>Weekly Schedule</div>

//         <div className="daysGrid">
//           {DAYS.map((d) => {
//             const hours = safeArr(weeklyHours[d.key]);
//             const breaks = safeArr(weeklyBreaks[d.key]);

//             return (
//               <div key={d.key} style={dayCard}>
//                 <div style={dayHeader}>
//                   <div style={dayTitle}>{d.label}</div>
//                   <div style={pillRow}>
//                     <span style={pill}>Hours: {hours.length}</span>
//                     <span style={pill}>Breaks: {breaks.length}</span>
//                   </div>
//                 </div>

//                 {/* HOURS */}
//                 <div style={subHeaderRow}>
//                   <div style={subHeader}>Hours</div>
//                   <button
//                     type="button"
//                     style={btn}
//                     onClick={() => addWeeklyRange(d.key)}
//                   >
//                     + Add
//                   </button>
//                 </div>

//                 {hours.length === 0 ? (
//                   <div style={muted}>Closed</div>
//                 ) : (
//                   <div style={list}>
//                     {hours.map((r, idx) => (
//                       <div key={`h-${idx}`} style={row}>
//                         <div style={field}>
//                           <div style={label}>Start</div>
//                           <input
//                             style={timeInput}
//                             type="time"
//                             value={r.start || "09:00"}
//                             onChange={(e) =>
//                               updateWeeklyRange(d.key, idx, {
//                                 start: e.target.value,
//                               })
//                             }
//                           />
//                         </div>

//                         <div style={field}>
//                           <div style={label}>End</div>
//                           <input
//                             style={timeInput}
//                             type="time"
//                             value={r.end || "17:00"}
//                             onChange={(e) =>
//                               updateWeeklyRange(d.key, idx, {
//                                 end: e.target.value,
//                               })
//                             }
//                           />
//                         </div>

//                         <button
//                           type="button"
//                           style={btnDangerSm}
//                           onClick={() => removeWeeklyRange(d.key, idx)}
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* BREAKS */}
//                 <div style={{ ...subHeaderRow, marginTop: 12 }}>
//                   <div style={subHeader}>Breaks</div>
//                   <button
//                     type="button"
//                     style={btn}
//                     onClick={() => addWeeklyBreak(d.key)}
//                   >
//                     + Add
//                   </button>
//                 </div>

//                 {breaks.length === 0 ? (
//                   <div style={muted}>No breaks</div>
//                 ) : (
//                   <div style={list}>
//                     {breaks.map((r, idx) => (
//                       <div key={`b-${idx}`} style={row}>
//                         <div style={field}>
//                           <div style={label}>Start</div>
//                           <input
//                             style={timeInput}
//                             type="time"
//                             value={r.start || "13:00"}
//                             onChange={(e) =>
//                               updateWeeklyBreak(d.key, idx, {
//                                 start: e.target.value,
//                               })
//                             }
//                           />
//                         </div>

//                         <div style={field}>
//                           <div style={label}>End</div>
//                           <input
//                             style={timeInput}
//                             type="time"
//                             value={r.end || "13:30"}
//                             onChange={(e) =>
//                               updateWeeklyBreak(d.key, idx, {
//                                 end: e.target.value,
//                               })
//                             }
//                           />
//                         </div>

//                         <button
//                           type="button"
//                           style={btnDangerSm}
//                           onClick={() => removeWeeklyBreak(d.key, idx)}
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* OVERRIDES */}
//       <div style={section}>
//         <div style={sectionTitle}>Date Overrides (Block / Custom)</div>

//         <div style={overrideCard}>
//           <div style={overrideGrid}>
//             <div style={field}>
//               <div style={label}>Date</div>
//               <input
//                 style={input}
//                 type="date"
//                 value={ovDate}
//                 onChange={(e) => setOvDate(e.target.value)}
//               />
//             </div>

//             <div style={field}>
//               <div style={label}>Note</div>
//               <input
//                 style={input}
//                 value={ovNote}
//                 onChange={(e) => setOvNote(e.target.value)}
//                 placeholder="Holiday, off, etc…"
//               />
//             </div>

//             <label style={checkRow}>
//               <input
//                 type="checkbox"
//                 checked={ovIsClosed}
//                 onChange={(e) => setOvIsClosed(e.target.checked)}
//               />
//               <span>Closed day</span>
//             </label>

//             <div style={actionsRow}>
//               <button type="button" style={btnDanger} onClick={onBlockDate}>
//                 Block date
//               </button>
//               <button type="button" style={btnPrimary} onClick={onOverrideDate}>
//                 Save override
//               </button>
//             </div>
//           </div>

//           {!ovIsClosed && (
//             <>
//               <div style={splitRow}>
//                 <div style={{ flex: 1 }}>
//                   <div style={miniTitleRow}>
//                     <div style={miniTitle}>Override Hours</div>
//                     <button type="button" style={btn} onClick={addOvHour}>
//                       + Add
//                     </button>
//                   </div>

//                   <div style={list}>
//                     {ovHours.map((r, i) => (
//                       <div key={`ovh-${i}`} style={row}>
//                         <div style={field}>
//                           <div style={label}>Start</div>
//                           <input
//                             style={timeInput}
//                             type="time"
//                             value={r.start}
//                             onChange={(e) =>
//                               updOvHour(i, { start: e.target.value })
//                             }
//                           />
//                         </div>
//                         <div style={field}>
//                           <div style={label}>End</div>
//                           <input
//                             style={timeInput}
//                             type="time"
//                             value={r.end}
//                             onChange={(e) =>
//                               updOvHour(i, { end: e.target.value })
//                             }
//                           />
//                         </div>
//                         <button
//                           type="button"
//                           style={btnDangerSm}
//                           onClick={() => rmOvHour(i)}
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div style={{ flex: 1 }}>
//                   <div style={miniTitleRow}>
//                     <div style={miniTitle}>Override Breaks</div>
//                     <button type="button" style={btn} onClick={addOvBreak}>
//                       + Add
//                     </button>
//                   </div>

//                   <div style={list}>
//                     {ovBreaks.map((r, i) => (
//                       <div key={`ovb-${i}`} style={row}>
//                         <div style={field}>
//                           <div style={label}>Start</div>
//                           <input
//                             style={timeInput}
//                             type="time"
//                             value={r.start}
//                             onChange={(e) =>
//                               updOvBreak(i, { start: e.target.value })
//                             }
//                           />
//                         </div>
//                         <div style={field}>
//                           <div style={label}>End</div>
//                           <input
//                             style={timeInput}
//                             type="time"
//                             value={r.end}
//                             onChange={(e) =>
//                               updOvBreak(i, { end: e.target.value })
//                             }
//                           />
//                         </div>
//                         <button
//                           type="button"
//                           style={btnDangerSm}
//                           onClick={() => rmOvBreak(i)}
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         <div style={{ marginTop: 14 }}>
//           <div style={sectionTitleSmall}>Existing Overrides</div>

//           {overridesSorted.length === 0 ? (
//             <div style={muted}>No overrides yet.</div>
//           ) : (
//             <div style={list}>
//               {overridesSorted.map((o) => (
//                 <div key={o.date} style={overrideRow}>
//                   <div style={{ minWidth: 0 }}>
//                     <div style={{ fontWeight: 950 }}>
//                       {o.date} {o.isClosed ? "• CLOSED" : ""}
//                     </div>
//                     {o.note ? <div style={muted}>{o.note}</div> : null}
//                   </div>

//                   <button
//                     type="button"
//                     style={btnDanger}
//                     onClick={() => onDeleteOverride(o.date)}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ===== Styles (clean + readable) ===== */

// const wrap = {
//   maxWidth: 1100,
//   margin: "20px auto",
//   padding: 16,
//   borderRadius: 16,
//   border: "1px solid rgba(255,255,255,0.12)",
//   background: "rgba(0,0,0,0.35)",
//   color: "#fff",

//   // ✅ critical: stop RTL breaking <input type="time">
//   direction: "ltr",
// };

// const headerRow = {
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "flex-end",
//   gap: 12,
//   flexWrap: "wrap",
// };

// const h2 = { fontSize: 22, fontWeight: 950 };
// const hint = { marginTop: 6, fontSize: 13, opacity: 0.75 };

// const section = {
//   marginTop: 16,
//   paddingTop: 16,
//   borderTop: "1px solid rgba(255,255,255,0.10)",
// };

// const sectionTitle = { fontSize: 16, fontWeight: 950, marginBottom: 10 };
// const sectionTitleSmall = { fontSize: 14, fontWeight: 950, marginBottom: 8 };

// const dayCard = {
//   padding: 12,
//   borderRadius: 14,
//   border: "1px solid rgba(255,255,255,0.10)",
//   background: "rgba(255,255,255,0.04)",
// };

// const dayHeader = {
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
//   gap: 10,
//   marginBottom: 10,
//   flexWrap: "wrap",
// };

// const dayTitle = { fontWeight: 950 };

// const pillRow = { display: "flex", gap: 8, flexWrap: "wrap" };

// const pill = {
//   fontSize: 11,
//   fontWeight: 900,
//   padding: "6px 10px",
//   borderRadius: 999,
//   border: "1px solid rgba(255,255,255,0.14)",
//   background: "rgba(0,0,0,0.25)",
//   opacity: 0.95,
// };

// const subHeaderRow = {
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
//   gap: 10,
// };

// const subHeader = { fontWeight: 950, opacity: 0.9 };

// const list = { display: "grid", gap: 10 };

// const row = {
//   display: "flex",
//   gap: 10,
//   alignItems: "end",
// };

// const field = { display: "grid", gap: 6, flex: 1, minWidth: 0 };

// const label = { fontSize: 12, opacity: 0.8 };

// const muted = { opacity: 0.7, fontSize: 13 };

// const input = {
//   width: "100%",
//   padding: "10px 12px",
//   borderRadius: 10,
//   border: "1px solid rgba(255,255,255,0.16)",
//   background: "rgba(0,0,0,0.35)",
//   color: "#fff",
//   outline: "none",
// };

// const timeInput = {
//   ...input,
//   // ✅ make time control readable and not squished
//   minWidth: 120,
// };

// const btn = {
//   padding: "8px 12px",
//   borderRadius: 10,
//   border: "1px solid rgba(255,255,255,0.18)",
//   background: "rgba(255,255,255,0.06)",
//   color: "#fff",
//   fontWeight: 900,
//   cursor: "pointer",
// };

// const btnPrimary = {
//   ...btn,
//   background: "#fff",
//   color: "#111",
//   border: "1px solid rgba(255,255,255,0.42)",
// };

// const btnDanger = {
//   ...btn,
//   border: "1px solid rgba(255,120,120,0.55)",
//   background: "rgba(255,120,120,0.12)",
//   color: "#ffd2d2",
// };

// const btnDangerSm = {
//   ...btnDanger,
//   width: 44,
//   padding: "10px 0",
//   textAlign: "center",
// };

// const overrideCard = {
//   padding: 12,
//   borderRadius: 14,
//   border: "1px solid rgba(255,255,255,0.10)",
//   background: "rgba(255,255,255,0.04)",
// };

// const overrideGrid = {
//   display: "grid",
//   gap: 12,
//   gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
//   alignItems: "end",
// };

// const checkRow = {
//   display: "flex",
//   gap: 10,
//   alignItems: "center",
//   padding: "10px 12px",
//   borderRadius: 10,
//   border: "1px solid rgba(255,255,255,0.12)",
//   background: "rgba(0,0,0,0.25)",
// };

// const actionsRow = {
//   display: "flex",
//   gap: 10,
//   justifyContent: "flex-end",
//   alignItems: "center",
//   flexWrap: "wrap",
// };

// const splitRow = {
//   display: "flex",
//   gap: 12,
//   marginTop: 12,
//   flexWrap: "wrap",
// };

// const miniTitleRow = {
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
//   marginBottom: 8,
//   gap: 10,
// };

// const miniTitle = { fontWeight: 950, opacity: 0.95 };

// const overrideRow = {
//   display: "flex",
//   justifyContent: "space-between",
//   alignItems: "center",
//   gap: 12,
//   padding: 10,
//   borderRadius: 12,
//   border: "1px solid rgba(255,255,255,0.10)",
//   background: "rgba(0,0,0,0.18)",
// };
import { useEffect, useMemo, useState } from "react";
import {
  getBarberSchedule,
  overrideDate,
  blockDate,
  deleteOverride,
} from "../../lib/barberSchedule";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const emptyRange = () => ({ start: "09:00", end: "17:00" });
const emptyBreak = () => ({ start: "13:00", end: "13:30" });
function todayYYYYMMDD() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function getWeekdayKey(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return null;
  // date string assumed local, good enough for admin
  const d = new Date(`${yyyy_mm_dd}T12:00:00`);
  return String(d.getDay()); // "0".."6"
}

export default function AdminBarberSchedule({ barberId }) {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);

  const [date, setDate] = useState("");
  const [editMode, setEditMode] = useState(false);

  // edit form
  const [isClosed, setIsClosed] = useState(false);
  const [note, setNote] = useState("");
  const [hours, setHours] = useState([emptyRange()]);
  const [breaks, setBreaks] = useState([emptyBreak()]);

  async function refresh() {
    if (!barberId) return;
    setLoading(true);
    try {
      const s = await getBarberSchedule(barberId);
      setSchedule(s);
    } catch (e) {
      console.log("SCHEDULE LOAD ERROR:", e?.response?.data || e);
      alert(e?.response?.data?.message || e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barberId]);

  const weekdayKey = useMemo(() => getWeekdayKey(date), [date]);

  const defaultHours = useMemo(() => {
    const w = schedule?.weeklyHours || {};
    return Array.isArray(w?.[weekdayKey]) ? w[weekdayKey] : [];
  }, [schedule, weekdayKey]);

  const defaultBreaks = useMemo(() => {
    const w = schedule?.weeklyBreaks || {};
    return Array.isArray(w?.[weekdayKey]) ? w[weekdayKey] : [];
  }, [schedule, weekdayKey]);

  const existingOverride = useMemo(() => {
    if (!date) return null;
    return (schedule?.overrides || []).find((x) => x.date === date) || null;
  }, [schedule, date]);

  // whenever date changes -> leave edit mode + load existing override into form if present
  useEffect(() => {
    setEditMode(false);

    if (!date) return;

    if (existingOverride) {
      setIsClosed(!!existingOverride.isClosed);
      setNote(existingOverride.note || "");
      setHours(
        existingOverride.hours?.length
          ? existingOverride.hours
          : [emptyRange()],
      );
      setBreaks(
        existingOverride.breaks?.length
          ? existingOverride.breaks
          : [emptyBreak()],
      );
    } else {
      // start edit with defaults (but only when user clicks "Change this date")
      setIsClosed(false);
      setNote("");
      setHours(defaultHours.length ? defaultHours : [emptyRange()]);
      setBreaks(defaultBreaks.length ? defaultBreaks : [emptyBreak()]);
    }
  }, [date, existingOverride, defaultHours, defaultBreaks]);

  function openEdit() {
    if (!date) return alert("Pick a date first");
    setEditMode(true);

    // if no override exists, start from default (already set in effect)
  }

  function cancelEdit() {
    setEditMode(false);

    // reset to override if exists, else reset to defaults view
    if (existingOverride) {
      setIsClosed(!!existingOverride.isClosed);
      setNote(existingOverride.note || "");
      setHours(
        existingOverride.hours?.length
          ? existingOverride.hours
          : [emptyRange()],
      );
      setBreaks(
        existingOverride.breaks?.length
          ? existingOverride.breaks
          : [emptyBreak()],
      );
    } else {
      setIsClosed(false);
      setNote("");
      setHours(defaultHours.length ? defaultHours : [emptyRange()]);
      setBreaks(defaultBreaks.length ? defaultBreaks : [emptyBreak()]);
    }
  }

  async function save() {
    if (!date) return alert("Pick a date");

    await overrideDate(barberId, {
      date,
      isClosed,
      note,
      hours: isClosed ? [] : hours,
      breaks: isClosed ? [] : breaks,
    });

    await refresh();
    setEditMode(false);
    alert("Saved ✅");
  }

  async function oneClickBlock() {
    if (!date) return alert("Pick a date");
    await blockDate(barberId, date, note);
    await refresh();
    setEditMode(false);
    alert("Blocked ✅");
  }

  async function removeChange() {
    if (!date) return alert("Pick a date");
    if (!confirm("Delete change and go back to default?")) return;
    await deleteOverride(barberId, date);
    await refresh();
    setEditMode(false);
    alert("Deleted ✅");
  }

  function addHour() {
    setHours((a) => [...a, emptyRange()]);
  }
  function updateHour(i, patch) {
    setHours((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function removeHour(i) {
    setHours((a) => a.filter((_, idx) => idx !== i));
  }

  function addBreak() {
    setBreaks((a) => [...a, emptyBreak()]);
  }
  function updateBreak(i, patch) {
    setBreaks((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function removeBreak(i) {
    setBreaks((a) => a.filter((_, idx) => idx !== i));
  }

  if (!barberId) return <div style={wrap}>Pick a barber first.</div>;
  if (loading) return <div style={wrap}>Loading…</div>;

  return (
    <div style={wrap}>
      <div style={header}>
        <div>
          <div style={h1}>Barber Schedule</div>
          <div style={sub}>Default weekly schedule + easy date changes.</div>
        </div>

        <label style={field}>
          <div style={label}>Pick date</div>
          <input
            style={input}
            type="date"
            min={todayYYYYMMDD()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>

      {!date ? (
        <div style={card}>Pick a date to view schedule.</div>
      ) : (
        <>
          {/* VIEW MODE */}
          {!editMode ? (
            <div style={card}>
              <div style={rowBetween}>
                <div>
                  <div style={titleRow}>
                    <span style={pill}>{DAYS[Number(weekdayKey)]}</span>
                    <span style={{ fontWeight: 950 }}>{date}</span>
                    {existingOverride ? (
                      <span style={pillOk}>Custom ✅</span>
                    ) : (
                      <span style={pillSoft}>Default</span>
                    )}
                  </div>

                  {existingOverride?.note ? (
                    <div style={muted}>{existingOverride.note}</div>
                  ) : null}
                </div>

                <div style={btnRow}>
                  <button style={btn} type="button" onClick={openEdit}>
                    Change this date
                  </button>
                  <button
                    style={btnDanger}
                    type="button"
                    onClick={oneClickBlock}
                  >
                    Block day
                  </button>
                  {existingOverride ? (
                    <button style={btn} type="button" onClick={removeChange}>
                      Delete change
                    </button>
                  ) : null}
                </div>
              </div>

              <div style={split}>
                <div>
                  <div style={secTitle}>Hours</div>
                  <ListRanges
                    ranges={
                      (existingOverride?.isClosed
                        ? []
                        : existingOverride?.hours) ?? defaultHours
                    }
                    emptyText="Closed"
                  />
                </div>
                <div>
                  <div style={secTitle}>Breaks</div>
                  <ListRanges
                    ranges={
                      (existingOverride?.isClosed
                        ? []
                        : existingOverride?.breaks) ?? defaultBreaks
                    }
                    emptyText="No breaks"
                  />
                </div>
              </div>

              {existingOverride?.isClosed ? (
                <div style={closedBox}>This date is CLOSED</div>
              ) : null}
            </div>
          ) : (
            /* EDIT MODE */
            <div style={card}>
              <div style={rowBetween}>
                <div style={{ fontWeight: 950 }}>Edit {date}</div>
                <div style={btnRow}>
                  <button style={btnPrimary} type="button" onClick={save}>
                    Save
                  </button>
                  <button style={btn} type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                <label style={field}>
                  <div style={label}>Note</div>
                  <input
                    style={input}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Holiday / special hours..."
                  />
                </label>

                <label style={checkRow}>
                  <input
                    type="checkbox"
                    checked={isClosed}
                    onChange={(e) => setIsClosed(e.target.checked)}
                  />
                  <span>Closed day</span>
                </label>

                {!isClosed ? (
                  <>
                    <div>
                      <div style={secTitleRow}>
                        <div style={secTitle}>Hours</div>
                        <button style={btn} type="button" onClick={addHour}>
                          + Add
                        </button>
                      </div>

                      {hours.map((r, i) => (
                        <div key={i} style={line}>
                          <input
                            style={time}
                            type="time"
                            value={r.start}
                            onChange={(e) =>
                              updateHour(i, { start: e.target.value })
                            }
                          />
                          <span style={{ opacity: 0.7 }}>—</span>
                          <input
                            style={time}
                            type="time"
                            value={r.end}
                            onChange={(e) =>
                              updateHour(i, { end: e.target.value })
                            }
                          />
                          <button
                            style={xBtn}
                            type="button"
                            onClick={() => removeHour(i)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div style={secTitleRow}>
                        <div style={secTitle}>Breaks</div>
                        <button style={btn} type="button" onClick={addBreak}>
                          + Add
                        </button>
                      </div>

                      {breaks.map((r, i) => (
                        <div key={i} style={line}>
                          <input
                            style={time}
                            type="time"
                            value={r.start}
                            onChange={(e) =>
                              updateBreak(i, { start: e.target.value })
                            }
                          />
                          <span style={{ opacity: 0.7 }}>—</span>
                          <input
                            style={time}
                            type="time"
                            value={r.end}
                            onChange={(e) =>
                              updateBreak(i, { end: e.target.value })
                            }
                          />
                          <button
                            style={xBtn}
                            type="button"
                            onClick={() => removeBreak(i)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={closedBox}>This date will be CLOSED</div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ListRanges({ ranges, emptyText }) {
  const list = Array.isArray(ranges) ? ranges : [];
  if (list.length === 0) return <div style={{ opacity: 0.7 }}>{emptyText}</div>;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {list.map((r, i) => (
        <div key={i} style={chip}>
          {r.start} – {r.end}
        </div>
      ))}
    </div>
  );
}

/* styles */
const wrap = {
  maxWidth: 1100,
  margin: "20px auto",
  padding: 16,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "end",
};
const h1 = { fontSize: 22, fontWeight: 950 };
const sub = { marginTop: 6, fontSize: 13, opacity: 0.75 };

const card = {
  marginTop: 12,
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
};

const field = { display: "grid", gap: 6 };
const label = { fontSize: 12, opacity: 0.8 };
const input = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  outline: "none",
};

const rowBetween = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  alignItems: "center",
};
const btnRow = { display: "flex", gap: 10, flexWrap: "wrap" };

const btn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};
const btnPrimary = { ...btn, background: "#fff", color: "#111" };
const btnDanger = {
  ...btn,
  border: "1px solid rgba(255,120,120,0.55)",
  background: "rgba(255,120,120,0.12)",
  color: "#ffd2d2",
};

const titleRow = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
};
const pill = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.25)",
  fontWeight: 900,
  fontSize: 12,
};
const pillSoft = { ...pill, opacity: 0.85 };
const pillOk = { ...pill, border: "1px solid rgba(120,255,160,0.35)" };

const muted = { opacity: 0.75, marginTop: 6 };

const split = {
  marginTop: 14,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};
const secTitle = { fontWeight: 950, marginBottom: 10 };

const secTitleRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 10,
};
const line = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
  flexWrap: "wrap",
};
const time = { ...input, width: 160 };
const xBtn = { ...btnDanger, padding: "8px 10px" };

const chip = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  fontWeight: 900,
};

const checkRow = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
};

const closedBox = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,120,120,0.55)",
  background: "rgba(255,120,120,0.12)",
  color: "#ffd2d2",
  fontWeight: 950,
};
