import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import {
  adminListServices,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
} from "@/lib/services";

const emptyForm = {
  key: "",
  name: "",
  nameHe: "",
  price: 0,
  durationMin: 30,
  isActive: true,
  sortOrder: 0,
  description: "",
};

export default function ServicesAdmin() {
  const { toast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const isEditing = Boolean(editingId);

  async function refresh() {
    setLoading(true);
    try {
      const data = await adminListServices();
      setItems(data);
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    return [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [items]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(s) {
    setEditingId(s._id);
    setForm({
      key: s.key ?? "",
      name: s.name ?? "",
      nameHe: s.nameHe ?? "",
      price: Number(s.price ?? 0),
      durationMin: Number(s.durationMin ?? 30),
      isActive: Boolean(s.isActive),
      sortOrder: Number(s.sortOrder ?? 0),
      description: s.description ?? "",
    });
  }

  function onChange(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    // basic validation
    if (!form.key.trim() || !form.name.trim()) {
      toast({
        title: "Missing fields",
        description: "key + name required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing) {
        await adminUpdateService(editingId, form);
        toast({ title: "Updated", description: "Service updated ✓" });
      } else {
        await adminCreateService(form);
        toast({ title: "Created", description: "Service created ✓" });
      }
      startCreate();
      refresh();
    } catch (e) {
      toast({
        title: "Error",
        description: e?.response?.data?.message || "Save failed",
        variant: "destructive",
      });
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this service?")) return;
    try {
      await adminDeleteService(id);
      toast({ title: "Deleted", description: "Service deleted ✓" });
      refresh();
    } catch (e) {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    }
  }

  async function toggleActive(s) {
    try {
      await adminUpdateService(s._id, { isActive: !s.isActive });
      refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update",
        variant: "destructive",
      });
    }
  }

  return (
    <Layout>
      <section className="pt-24 pb-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-heading tracking-[0.1em] text-foreground">
              Services Admin
            </h1>
            <button
              onClick={startCreate}
              className="border border-foreground px-4 py-2 text-xs font-heading tracking-[0.15em] hover:bg-foreground hover:text-primary-foreground transition-all"
            >
              + New Service
            </button>
          </div>

          {/* Table */}
          <div className="border border-border overflow-x-auto mb-10">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-3">Sort</th>
                  <th className="p-3">Key</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Name (HE)</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Active</th>
                  <th className="p-3 w-[220px]">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-4 text-muted-foreground" colSpan={8}>
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="p-4 text-muted-foreground" colSpan={8}>
                      No services yet
                    </td>
                  </tr>
                ) : (
                  rows.map((s) => (
                    <tr key={s._id} className="border-b border-border">
                      <td className="p-3">{s.sortOrder ?? 0}</td>
                      <td className="p-3">{s.key}</td>
                      <td className="p-3">{s.name}</td>
                      <td className="p-3">{s.nameHe}</td>
                      <td className="p-3">
                        ₪{Number(s.price ?? 0).toFixed(0)}
                      </td>
                      <td className="p-3">{s.durationMin} min</td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleActive(s)}
                          className={`text-xs px-3 py-1 border transition-all ${
                            s.isActive
                              ? "border-foreground bg-foreground text-primary-foreground"
                              : "border-border text-muted-foreground hover:border-foreground/50"
                          }`}
                        >
                          {s.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="border border-foreground px-3 py-1 text-xs hover:bg-foreground hover:text-primary-foreground transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(s._id)}
                          className="border border-red-500 text-red-500 px-3 py-1 text-xs hover:bg-red-500 hover:text-white transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Form */}
          <div className="border border-border p-6">
            <h2 className="text-sm font-heading tracking-[0.15em] mb-4">
              {isEditing ? "Edit Service" : "Create Service"}
            </h2>

            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="text-xs text-muted-foreground">Key</label>
                <input
                  value={form.key}
                  onChange={(e) => onChange("key", e.target.value)}
                  className="w-full border border-border bg-transparent px-3 py-2"
                  placeholder="haircut"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    onChange("sortOrder", Number(e.target.value))
                  }
                  className="w-full border border-border bg-transparent px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">
                  Name (EN)
                </label>
                <input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  className="w-full border border-border bg-transparent px-3 py-2"
                  placeholder="Haircut"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">
                  Name (HE)
                </label>
                <input
                  value={form.nameHe}
                  onChange={(e) => onChange("nameHe", e.target.value)}
                  className="w-full border border-border bg-transparent px-3 py-2"
                  placeholder="תספורת"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Price</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => onChange("price", Number(e.target.value))}
                  className="w-full border border-border bg-transparent px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={form.durationMin}
                  onChange={(e) =>
                    onChange("durationMin", Number(e.target.value))
                  }
                  className="w-full border border-border bg-transparent px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  className="w-full border border-border bg-transparent px-3 py-2 min-h-[90px]"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between gap-3 mt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => onChange("isActive", e.target.checked)}
                  />
                  Active
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={startCreate}
                    className="border border-border px-4 py-2 text-xs hover:border-foreground/50"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="border border-foreground bg-foreground text-primary-foreground px-4 py-2 text-xs hover:opacity-90"
                  >
                    {isEditing ? "Save changes" : "Create"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
