// src/components/admin/AdminProducts.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { updateProduct } from "../../lib/products";

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // create
  const [create, setCreate] = useState({
    name: "",
    descrip: "",
    price: "",
    stock: "",
    cate: "",
    brand: "",
    isTop: false,
    isActive: true,
    imageFile: null,
  });

  // edit
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({
    name: "",
    descrip: "",
    price: "",
    stock: "",
    cate: "",
    brand: "",
    isTop: false,
    isActive: true,
    imageFile: null,
  });

  const productCount = useMemo(() => items.length, [items]);

  const setCreateField = (k, v) => setCreate((s) => ({ ...s, [k]: v }));

  async function refresh() {
    setLoading(true);
    try {
      const r = await api.get("/api/products", {
        headers: { "Cache-Control": "no-cache" },
        params: { _ts: Date.now() },
      });
      setItems(Array.isArray(r.data) ? r.data : []);
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
    if (create.price === "" || create.price == null)
      return alert("Price is required");

    const fd = new FormData();
    fd.append("name", create.name.trim());
    fd.append("descrip", create.descrip || "");
    fd.append("price", String(create.price));
    fd.append("stock", String(create.stock || 0));
    fd.append("cate", create.cate || "");
    fd.append("brand", create.brand || "");
    fd.append("isTop", String(!!create.isTop));
    fd.append("isActive", String(!!create.isActive));
    if (create.imageFile instanceof File) fd.append("image", create.imageFile);

    try {
      // IMPORTANT: don't set Content-Type manually
      await api.post("/api/products", fd);

      setCreate({
        name: "",
        descrip: "",
        price: "",
        stock: "",
        cate: "",
        brand: "",
        isTop: false,
        isActive: true,
        imageFile: null,
      });
      refresh();
    } catch (e2) {
      console.log("CREATE ERROR:", e2?.response?.data || e2);
      alert(e2?.response?.data?.message || e2?.message || "Create failed");
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete product?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      refresh();
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    }
  }

  function startEdit(p) {
    setEditingId(p._id);
    setEdit({
      name: p.name ?? "",
      descrip: p.descrip ?? "",
      price: p.price ?? "",
      stock: p.stock ?? 0,
      cate: p.cate ?? "",
      brand: p.brand ?? "",
      isTop: !!p.isTop,
      isActive: p.isActive !== false,
      imageFile: null,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEdit({
      name: "",
      descrip: "",
      price: "",
      stock: "",
      cate: "",
      brand: "",
      isTop: false,
      isActive: true,
      imageFile: null,
    });
  }

  async function saveEdit(id) {
    try {
      await updateProduct(id, {
        name: edit.name.trim(),
        descrip: edit.descrip || "",
        price: edit.price,
        stock: edit.stock || 0,
        cate: edit.cate || "",
        brand: edit.brand || "",
        isTop: !!edit.isTop,
        isActive: !!edit.isActive,
        imageFile: edit.imageFile, // File or null
      });

      cancelEdit();
      refresh();
    } catch (e) {
      console.log("UPDATE ERROR:", e?.response?.data || e);
      alert(e?.response?.data?.message || e?.message || "Update failed");
    }
  }

  return (
    <div style={page}>
      {/* Header */}
      <div style={topBar}>
        <div>
          <div style={title}>Products</div>
          <div style={subTitle}>
            Manage your store items, images, price and stock.
          </div>
        </div>

        <div style={pill}>
          <span style={{ opacity: 0.8 }}>Total</span>
          <span style={{ fontWeight: 900 }}>{productCount}</span>
        </div>
      </div>

      {/* Create card */}
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <div style={cardTitle}>Add New Product</div>
            <div style={cardHint}>
              Fill all fields • Image optional • Cloudinary
            </div>
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
            <span style={label}>Price (₪)</span>
            <input
              style={input}
              value={create.price}
              onChange={(e) => setCreateField("price", e.target.value)}
            />
          </label>

          <label style={field}>
            <span style={label}>Stock</span>
            <input
              style={input}
              value={create.stock}
              onChange={(e) => setCreateField("stock", e.target.value)}
            />
          </label>

          <label style={field}>
            <span style={label}>Category (cate)</span>
            <input
              style={input}
              value={create.cate}
              onChange={(e) => setCreateField("cate", e.target.value)}
            />
          </label>

          <label style={field}>
            <span style={label}>Brand</span>
            <input
              style={input}
              value={create.brand}
              onChange={(e) => setCreateField("brand", e.target.value)}
            />
          </label>

          <label style={{ ...field, gridColumn: "1 / -1" }}>
            <span style={label}>Description</span>
            <textarea
              style={textarea}
              value={create.descrip}
              onChange={(e) => setCreateField("descrip", e.target.value)}
            />
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

            <label style={check}>
              <input
                type="checkbox"
                checked={!!create.isTop}
                onChange={(e) => setCreateField("isTop", e.target.checked)}
              />
              <span>Top product</span>
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
              onClick={() =>
                setCreate({
                  name: "",
                  descrip: "",
                  price: "",
                  stock: "",
                  cate: "",
                  brand: "",
                  isTop: false,
                  isActive: true,
                  imageFile: null,
                })
              }
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
          <div style={empty}>No products yet.</div>
        ) : (
          items.map((p) => {
            const isEditing = editingId === p._id;
            return (
              <div key={p._id} style={productCard}>
                <div style={productTop}>
                  <div style={imgWrap}>
                    <img
                      src={p.image?.url || ""}
                      alt={p.name}
                      style={img}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={productNameRow}>
                      <div style={productName}>{p.name}</div>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {p.isTop ? (
                          <span style={{ ...badge, ...badgeTop }}>TOP</span>
                        ) : null}
                        {p.isActive === false ? (
                          <span style={{ ...badge, ...badgeOff }}>
                            INACTIVE
                          </span>
                        ) : null}
                        {p.cate ? (
                          <span style={badgeSoft}>{p.cate}</span>
                        ) : null}
                        {p.brand ? (
                          <span style={badgeSoft}>{p.brand}</span>
                        ) : null}
                      </div>
                    </div>

                    <div style={meta}>
                      <span>₪{p.price}</span>
                      <span style={dot}>•</span>
                      <span>Stock: {p.stock}</span>
                      {p.descrip ? (
                        <>
                          <span style={dot}>•</span>
                          <span
                            style={{
                              opacity: 0.8,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {p.descrip}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div style={actions}>
                    <button
                      style={{ ...btn, ...btnDanger }}
                      onClick={() => onDelete(p._id)}
                    >
                      Delete
                    </button>
                    {!isEditing ? (
                      <button
                        style={{ ...btn, ...btnPrimary }}
                        onClick={() => startEdit(p)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button style={btn} onClick={cancelEdit}>
                        Close
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit panel */}
                {isEditing && (
                  <div style={editPanel}>
                    <div style={editGrid}>
                      <EditField
                        label="Name"
                        value={edit.name}
                        onChange={(v) => setEdit((s) => ({ ...s, name: v }))}
                      />
                      <EditField
                        label="Price"
                        value={String(edit.price)}
                        onChange={(v) => setEdit((s) => ({ ...s, price: v }))}
                      />
                      <EditField
                        label="Stock"
                        value={String(edit.stock)}
                        onChange={(v) => setEdit((s) => ({ ...s, stock: v }))}
                      />
                      <EditField
                        label="Category (cate)"
                        value={edit.cate}
                        onChange={(v) => setEdit((s) => ({ ...s, cate: v }))}
                      />
                      <EditField
                        label="Brand"
                        value={edit.brand}
                        onChange={(v) => setEdit((s) => ({ ...s, brand: v }))}
                      />

                      <label style={{ ...field, gridColumn: "1 / -1" }}>
                        <span style={label}>Description</span>
                        <textarea
                          value={edit.descrip}
                          onChange={(e) =>
                            setEdit((s) => ({ ...s, descrip: e.target.value }))
                          }
                          style={textarea}
                        />
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
                            checked={!!edit.isTop}
                            onChange={(e) =>
                              setEdit((s) => ({
                                ...s,
                                isTop: e.target.checked,
                              }))
                            }
                          />
                          <span>Top product</span>
                        </label>

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
                        style={{ ...btn, ...btnPrimary }}
                        onClick={() => saveEdit(p._id)}
                      >
                        Save changes
                      </button>
                      <button style={btn} onClick={cancelEdit}>
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

/* ===== styles ===== */

const page = {
  maxWidth: 1100,
  margin: "26px auto",
  padding: 18,
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
};

const img = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
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
  maxWidth: 520,
};

const meta = {
  marginTop: 6,
  fontSize: 13,
  opacity: 0.9,
  display: "flex",
  gap: 8,
  alignItems: "center",
  flexWrap: "wrap",
};
const dot = { opacity: 0.6 };

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

const badgeTop = {
  border: "1px solid rgba(255,255,255,0.35)",
  background: "rgba(255,255,255,0.12)",
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

const textarea = {
  padding: "11px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  outline: "none",
  resize: "vertical",
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
