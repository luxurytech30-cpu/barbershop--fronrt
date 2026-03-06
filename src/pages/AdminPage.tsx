import { useEffect, useState } from "react";
import { useMe } from "../hooks/useMe";
import Layout from "@/components/Layout";

import AdminProducts from "../components/admin/AdminProducts";
import AdminBarbers from "../components/admin/AdminBarbers";
import AdminCourses from "../components/admin/AdminCourses";
import AdminAppointments from "../components/admin/AdminAppointments";
import AdminBarberSchedule from "../components/admin/AdminBarberSchedule";
import AdminServices from "../components/admin/ServicesAdmin"; // ✅ NEW

import { listBarbers } from "../lib/barbers";

export default function AdminPage() {
  const { isAdmin, loading } = useMe();
  const [tab, setTab] = useState("products");

  // ✅ schedule tab needs barber picker
  const [barbers, setBarbers] = useState([]);
  const [selectedBarberId, setSelectedBarberId] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    listBarbers({ all: true })
      .then((data) => setBarbers(Array.isArray(data) ? data : []))
      .catch((e) => {
        console.log("LOAD BARBERS ERROR:", e?.response?.data || e);
        setBarbers([]);
      });
  }, [isAdmin]);

  if (loading) return <div style={wrap}>Loading...</div>;
  if (!isAdmin) return <div style={wrap}>Admin access only ❌</div>;

  return (
    <Layout>
      <div style={wrap}>
        <h1>Admin Control Panel</h1>

        <div style={tabs}>
          <Tab label="Products" value="products" tab={tab} setTab={setTab} />
          <Tab
            label="Services"
            value="services"
            tab={tab}
            setTab={setTab}
          />{" "}
          {/* ✅ NEW */}
          <Tab label="Barbers" value="barbers" tab={tab} setTab={setTab} />
          <Tab label="Courses" value="courses" tab={tab} setTab={setTab} />
          <Tab
            label="Appointments"
            value="appointments"
            tab={tab}
            setTab={setTab}
          />
          <Tab
            label="Barber Schedule"
            value="barberSchedule"
            tab={tab}
            setTab={setTab}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          {tab === "products" && <AdminProducts />}
          {tab === "services" && <AdminServices />} {/* ✅ NEW */}
          {tab === "barbers" && <AdminBarbers />}
          {tab === "courses" && <AdminCourses />}
          {tab === "appointments" && <AdminAppointments />}
          {tab === "barberSchedule" && (
            <div>
              <div style={pickerRow}>
                <div style={{ fontWeight: 900 }}>Pick Barber:</div>

                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  style={pickerSelect}
                >
                  <option value="">-- Choose --</option>
                  {barbers.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBarberId ? (
                <AdminBarberSchedule barberId={selectedBarberId} />
              ) : (
                <div style={{ marginTop: 12, opacity: 0.8 }}>
                  Select a barber to edit schedule.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Tab({ label, value, tab, setTab }) {
  const active = tab === value;
  return (
    <button
      onClick={() => setTab(value)}
      style={{
        ...tabBtn,
        background: active ? "#111" : "#fff",
        color: active ? "#fff" : "#111",
      }}
    >
      {label}
    </button>
  );
}

const wrap = {
  maxWidth: 1100,
  margin: "120px auto 40px",
  padding: 20,
};

const tabs = { display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" };

const tabBtn = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #111",
  cursor: "pointer",
  fontWeight: 900,
};

const pickerRow = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  marginBottom: 12,
};

const pickerSelect = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #111",
  minWidth: 220,
  color: "black",
};
