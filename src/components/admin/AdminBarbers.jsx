// src/components/admin/AdminBarbers.jsx
import { useEffect, useMemo, useState } from "react";
import {
  listBarbers,
  createBarber,
  updateBarber,
  deleteBarber,
} from "../../lib/barbers";

const DEFAULT_TZ = "Asia/Jerusalem";
const DEFAULT_SLOT = 30;

const emptyCreate = () => ({
  name: "",
  phone: "",
  isActive: true,
  timezone: DEFAULT_TZ,
  slotMinutes: DEFAULT_SLOT,
  imageFile: null,
});

const emptyEdit = () => ({
  name: "",
  phone: "",
  isActive: true,
  timezone: DEFAULT_TZ,
  slotMinutes: DEFAULT_SLOT,
  imageFile: null,
});

export default function AdminBarbers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [create, setCreate] = useState(emptyCreate());
  const [edit, setEdit] = useState(emptyEdit());
  const [editingId, setEditingId] = useState(null);

  const barberCount = useMemo(() => items.length, [items]);

  const setCreateField = (k, v) => setCreate((s) => ({ ...s, [k]: v }));

  async function refresh() {
    setLoading(true);
    try {
      const data = await listBarbers({ all: true });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("LIST BARBERS ERROR:", e?.response?.data || e);
      alert(
        e?.response?.data?.message || e?.message || "Failed to load barbers",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!create.name.trim()) return alert("Name is required");

    try {
      await createBarber({
        name: create.name.trim(),
        phone: create.phone.trim(),
        isActive: !!create.isActive,
        timezone: create.timezone || DEFAULT_TZ,
        slotMinutes: Number(create.slotMinutes || DEFAULT_SLOT),
        imageFile: create.imageFile,
      });

      setCreate(emptyCreate());
      await refresh();
    } catch (e2) {
      console.log("CREATE BARBER ERROR:", e2?.response?.data || e2);
      alert(e2?.response?.data?.message || e2?.message || "Create failed");
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete barber?")) return;
    try {
      await deleteBarber(id);
      await refresh();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Delete failed");
    }
  }

  function startEdit(b) {
    setEditingId(b._id);
    setEdit({
      name: b.name ?? "",
      phone: b.phone ?? "",
      isActive: b.isActive !== false,
      timezone: b.timezone || DEFAULT_TZ,
      slotMinutes: Number(b.slotMinutes || DEFAULT_SLOT),
      imageFile: null,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEdit(emptyEdit());
  }

  async function saveEdit(id) {
    if (!edit.name.trim()) return alert("Name is required");

    try {
      await updateBarber(id, {
        name: edit.name.trim(),
        phone: edit.phone.trim(),
        isActive: !!edit.isActive,
        timezone: edit.timezone || DEFAULT_TZ,
        slotMinutes: Number(edit.slotMinutes || DEFAULT_SLOT),
        imageFile: edit.imageFile,
      });

      cancelEdit();
      await refresh();
    } catch (e) {
      console.log("UPDATE BARBER ERROR:", e?.response?.data || e);
      alert(e?.response?.data?.message || e?.message || "Update failed");
    }
  }

  return (
    <div style={page}>
      <div style={topBar}>
        <div>
          <div style={title}>Barbers</div>
          <div style={subTitle}>
            Manage barbers list, phone, active state, timezone, slot minutes and
            images.
          </div>
        </div>

        <div style={pill}>
          <span style={{ opacity: 0.8 }}>Total</span>
          <span style={{ fontWeight: 900 }}>{barberCount}</span>
        </div>
      </div>

      {/* Create card */}
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <div style={cardTitle}>Add New Barber</div>
            <div style={cardHint}>Image optional • Cloudinary</div>
          </div>
        </div>

        <form onSubmit={onCreate} style={formGrid}>
          <label style={field}>
            <span style={label}>Name</span>
            <input
              style={input}
              value={create.name}
              onChange={(e) => setCreateField("name", e.target.value)}
            />
          </label>

          <label style={field}>
            <span style={label}>Phone</span>
            <input
              style={input}
              value={create.phone}
              onChange={(e) => setCreateField("phone", e.target.value)}
            />
          </label>

          <label style={field}>
            <span style={label}>Timezone</span>
            <select
              style={input}
              value={create.timezone}
              onChange={(e) => setCreateField("timezone", e.target.value)}
            >
              <option value="Asia/Jerusalem">Asia/Jerusalem</option>
              <option value="UTC">UTC</option>
            </select>
          </label>

          <label style={field}>
            <span style={label}>Slot Minutes</span>
            <select
              style={input}
              value={String(create.slotMinutes)}
              onChange={(e) =>
                setCreateField("slotMinutes", Number(e.target.value))
              }
            >
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
            </select>
          </label>

          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label style={check}>
              <input
                type="checkbox"
                checked={!!create.isActive}
                onChange={(e) => setCreateField("isActive", e.target.checked)}
              />
              <span>Active</span>
            </label>
          </div>

          <label style={{ ...field, gridColumn: "1 / -1" }}>
            <span style={label}>Image</span>
            <input
              style={inputFile}
              type="file"
              accept="image/*"
              onChange={(e) =>
                setCreateField("imageFile", e.target.files?.[0] || null)
              }
            />
          </label>

          <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
            <button type="submit" style={{ ...btn, ...btnPrimary }}>
              Create
            </button>
            <button
              type="button"
              style={btn}
              onClick={() => setCreate(emptyCreate())}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {loading ? (
          <div style={empty}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={empty}>No barbers yet.</div>
        ) : (
          items.map((b) => {
            const isEditing = editingId === b._id;
            const imgUrl = b.image?.url || "";

            return (
              <div key={b._id} style={productCard}>
                <div style={productTop}>
                  <div style={imgWrap}>
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={b.name}
                        style={img}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={imgPlaceholder}>
                        {String(b.name || "?")
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={productNameRow}>
                      <div style={productName}>{b.name}</div>

                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {b.isActive === false ? (
                          <span style={{ ...badge, ...badgeOff }}>
                            INACTIVE
                          </span>
                        ) : (
                          <span style={badgeSoft}>ACTIVE</span>
                        )}

                        {b.phone ? (
                          <span style={badgeSoft}>{b.phone}</span>
                        ) : null}
                        <span style={badgeSoft}>
                          {b.timezone || DEFAULT_TZ}
                        </span>
                        <span style={badgeSoft}>
                          Slot: {Number(b.slotMinutes || DEFAULT_SLOT)}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={actions}>
                    <button
                      type="button"
                      style={{ ...btn, ...btnDanger }}
                      onClick={() => onDelete(b._id)}
                    >
                      Delete
                    </button>

                    {!isEditing ? (
                      <button
                        type="button"
                        style={{ ...btn, ...btnPrimary }}
                        onClick={() => startEdit(b)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button type="button" style={btn} onClick={cancelEdit}>
                        Close
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div style={editPanel}>
                    <div style={editGrid}>
                      <EditField
                        label="Name"
                        value={edit.name}
                        onChange={(v) => setEdit((s) => ({ ...s, name: v }))}
                      />
                      <EditField
                        label="Phone"
                        value={edit.phone}
                        onChange={(v) => setEdit((s) => ({ ...s, phone: v }))}
                      />

                      <label style={field}>
                        <span style={label}>Timezone</span>
                        <select
                          style={input}
                          value={edit.timezone}
                          onChange={(e) =>
                            setEdit((s) => ({ ...s, timezone: e.target.value }))
                          }
                        >
                          <option value="Asia/Jerusalem">Asia/Jerusalem</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </label>

                      <label style={field}>
                        <span style={label}>Slot Minutes</span>
                        <select
                          style={input}
                          value={String(edit.slotMinutes)}
                          onChange={(e) =>
                            setEdit((s) => ({
                              ...s,
                              slotMinutes: Number(e.target.value),
                            }))
                          }
                        >
                          <option value="15">15</option>
                          <option value="20">20</option>
                          <option value="30">30</option>
                          <option value="45">45</option>
                          <option value="60">60</option>
                        </select>
                      </label>

                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <label style={check}>
                          <input
                            type="checkbox"
                            checked={!!edit.isActive}
                            onChange={(e) =>
                              setEdit((s) => ({
                                ...s,
                                isActive: e.target.checked,
                              }))
                            }
                          />
                          <span>Active</span>
                        </label>
                      </div>

                      <label style={{ ...field, gridColumn: "1 / -1" }}>
                        <span style={label}>Replace image (optional)</span>
                        <input
                          style={inputFile}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setEdit((s) => ({
                              ...s,
                              imageFile: e.target.files?.[0] || null,
                            }))
                          }
                        />
                      </label>
                    </div>

                    <div style={editActions}>
                      <button
                        type="button"
                        style={{ ...btn, ...btnPrimary }}
                        onClick={() => saveEdit(b._id)}
                      >
                        Save changes
                      </button>
                      <button type="button" style={btn} onClick={cancelEdit}>
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

/* ===== styles (unchanged) ===== */
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
const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 10,
};
const cardTitle = { fontSize: 15, fontWeight: 900, letterSpacing: 0.4 };
const cardHint = { fontSize: 12, opacity: 0.7 };
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
const imgWrap = {
  width: 62,
  height: 62,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  overflow: "hidden",
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
};
const img = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};
const imgPlaceholder = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
  fontSize: 18,
  opacity: 0.9,
};
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
  maxWidth: 420,
};
const actions = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexShrink: 0,
};
const badge = {
  fontSize: 11,
  fontWeight: 900,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.06)",
};
const badgeOff = {
  border: "1px solid rgba(255,120,120,0.45)",
  background: "rgba(255,120,120,0.10)",
  color: "#ffd2d2",
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
const inputFile = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
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
const check = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
};
