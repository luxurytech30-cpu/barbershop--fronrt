import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { listServices } from "@/lib/services";
import { listBarbers } from "@/lib/barbers";
import { getAvailability } from "@/lib/availability";
import {
  getPublicAppointment,
  updatePublicAppointment,
  cancelPublicAppointment,
} from "@/lib/appointments";

type Service = {
  _id: string;
  key: string;
  name: string;
  nameHe?: string;
  price: number;
  durationMin: number;
  isActive: boolean;
  sortOrder?: number;
};

type Barber = {
  _id: string;
  name: string;
};

type SavedAppointment = {
  appointmentId?: string;
  bookingCode?: string;
  manageToken: string;
};

type AppointmentData = {
  _id: string;
  barberId:
    | string
    | {
        _id: string;
        name: string;
      };
  startAt: string;
  endAt: string;
  customerName: string;
  phone: string;
  service: string;
  notes: string;
  status: string;
  bookingCode?: string;
  canManage: boolean;
  cutoffMinutes?: number;
};

function storageKey() {
  return "latestAppointment";
}

function getSavedAppointment(): SavedAppointment | null {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSavedAppointment(data: SavedAppointment) {
  localStorage.setItem(storageKey(), JSON.stringify(data));
}

function clearSavedAppointment() {
  localStorage.removeItem(storageKey());
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatHm(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function isoToDateInput(iso: string) {
  const d = new Date(iso);
  return formatYmd(d);
}

function isoToTimeInput(iso: string) {
  const d = new Date(iso);
  return formatHm(d);
}

function timeToMin(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

function addMinutesToDate(dateYmd: string, timeHHmm: string, addMin: number) {
  const start = new Date(`${dateYmd}T${timeHHmm}:00`);
  const end = new Date(start.getTime() + addMin * 60000);
  return { start, end };
}

function extractSlots(data: any): string[] {
  const rawSlots = Array.isArray(data?.slots)
    ? data.slots
    : Array.isArray(data)
      ? data
      : Array.isArray(data?.availableSlots)
        ? data.availableSlots
        : Array.isArray(data?.data)
          ? data.data
          : [];

  return rawSlots
    .map((slot: any) => {
      if (typeof slot === "string") return slot;
      if (slot && typeof slot.start === "string") return slot.start;
      if (slot && typeof slot.time === "string") return slot.time;
      if (slot && typeof slot.value === "string") return slot.value;
      return "";
    })
    .filter(Boolean)
    .sort((a: string, b: string) => timeToMin(a) - timeToMin(b));
}

function serviceDurationFromKey(services: Service[], serviceKey: string) {
  return services.find((s) => s.key === serviceKey)?._id
    ? services.find((s) => s.key === serviceKey)?.durationMin || 30
    : 30;
}

function barberIdValue(barber: AppointmentData["barberId"]) {
  return typeof barber === "string" ? barber : barber?._id || "";
}

function barberNameValue(
  barber: AppointmentData["barberId"],
  barbers: Barber[],
) {
  if (typeof barber !== "string") return barber?.name || "";
  return barbers.find((b) => b._id === barber)?.name || "";
}

export default function MyAppointmentPage() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();

  const [saved, setSaved] = useState<SavedAppointment | null>(null);
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [slots, setSlots] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    service: "",
    notes: "",
    barberId: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    const local = getSavedAppointment();
    setSaved(local);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [servicesData, barbersData] = await Promise.all([
          listServices(),
          listBarbers(),
        ]);

        setServices(
          (Array.isArray(servicesData) ? servicesData : [])
            .filter((s) => s.isActive !== false)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        );

        setBarbers(Array.isArray(barbersData) ? barbersData : []);
      } catch (e) {
        console.log("LOAD MY APPOINTMENT DATA ERROR:", e);
      }
    })();
  }, []);

  async function loadAppointment(tokenArg?: string) {
    const token = tokenArg || saved?.manageToken;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getPublicAppointment(token);
      setAppointment(data);

      setForm({
        customerName: data.customerName || "",
        phone: data.phone || "",
        service: data.service || "",
        notes: data.notes || "",
        barberId: barberIdValue(data.barberId),
        date: isoToDateInput(data.startAt),
        time: isoToTimeInput(data.startAt),
      });
    } catch (e: any) {
      console.log("LOAD PUBLIC APPOINTMENT ERROR:", e?.response?.data || e);
      setAppointment(null);
      toast({
        title: lang === "he" ? "לא נמצא תור" : "Appointment not found",
        description:
          lang === "he"
            ? "לא הצלחנו לטעון את התור השמור"
            : "We could not load the saved appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (saved?.manageToken) {
      loadAppointment(saved.manageToken);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.manageToken]);

  const selectedService = useMemo(
    () => services.find((s) => s.key === form.service),
    [services, form.service],
  );

  const selectedDuration = useMemo(
    () =>
      selectedService?.durationMin ||
      serviceDurationFromKey(services, form.service),
    [selectedService, services, form.service],
  );

  useEffect(() => {
    if (!isEditing) return;
    if (!form.barberId || !form.date || !selectedDuration) {
      setSlots([]);
      return;
    }

    (async () => {
      try {
        setLoadingSlots(true);

        const data = await getAvailability(
          form.barberId,
          form.date,
          selectedDuration,
        );

        const normalized = extractSlots(data);
        setSlots(normalized);
      } catch (e) {
        console.log("MY APPOINTMENT AVAILABILITY ERROR:", e);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [isEditing, form.barberId, form.date, selectedDuration]);

  async function handleSave() {
    if (!saved?.manageToken || !appointment) return;

    if (!form.customerName.trim()) {
      toast({
        title: lang === "he" ? "חסר שם" : "Missing name",
        description:
          lang === "he" ? "יש למלא שם מלא" : "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (!form.phone.trim()) {
      toast({
        title: lang === "he" ? "חסר טלפון" : "Missing phone",
        description:
          lang === "he"
            ? "יש למלא מספר טלפון"
            : "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (!form.barberId || !form.date || !form.time) {
      toast({
        title: lang === "he" ? "חסר מידע" : "Missing data",
        description:
          lang === "he"
            ? "יש לבחור ספר, תאריך ושעה"
            : "Please select barber, date, and time",
        variant: "destructive",
      });
      return;
    }

    if (!form.service) {
      toast({
        title: lang === "he" ? "חסר שירות" : "Missing service",
        description:
          lang === "he" ? "יש לבחור שירות" : "Please select a service",
        variant: "destructive",
      });
      return;
    }

    if (slots.length > 0 && !slots.includes(form.time)) {
      toast({
        title: lang === "he" ? "השעה לא זמינה" : "Time not available",
        description:
          lang === "he"
            ? "יש לבחור שעה זמינה"
            : "Please choose an available time",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const { start, end } = addMinutesToDate(
        form.date,
        form.time,
        selectedDuration,
      );

      await updatePublicAppointment(saved.manageToken, {
        barberId: form.barberId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        service: form.service,
        notes: form.notes.trim(),
      });

      toast({
        title: lang === "he" ? "התור עודכן" : "Appointment updated",
        description:
          lang === "he"
            ? "השינויים נשמרו בהצלחה"
            : "Your changes were saved successfully",
      });

      setIsEditing(false);
      await loadAppointment(saved.manageToken);
    } catch (e: any) {
      console.log("UPDATE PUBLIC APPOINTMENT ERROR:", e?.response?.data || e);
      toast({
        title: lang === "he" ? "העדכון נכשל" : "Update failed",
        description:
          e?.response?.data?.message ||
          (lang === "he"
            ? "לא הצלחנו לעדכן את התור"
            : "We could not update the appointment"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!saved?.manageToken || !appointment) return;

    const ok = window.confirm(
      lang === "he"
        ? "לבטל את התור?"
        : "Are you sure you want to cancel the appointment?",
    );
    if (!ok) return;

    try {
      setCancelling(true);
      await cancelPublicAppointment(saved.manageToken);

      toast({
        title: lang === "he" ? "התור בוטל" : "Appointment cancelled",
        description:
          lang === "he" ? "התור בוטל בהצלחה" : "Your appointment was cancelled",
      });

      await loadAppointment(saved.manageToken);
    } catch (e: any) {
      console.log("CANCEL PUBLIC APPOINTMENT ERROR:", e?.response?.data || e);
      toast({
        title: lang === "he" ? "הביטול נכשל" : "Cancel failed",
        description:
          e?.response?.data?.message ||
          (lang === "he"
            ? "לא הצלחנו לבטל את התור"
            : "We could not cancel the appointment"),
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  }

  function handleClearSaved() {
    clearSavedAppointment();
    setSaved(null);
    setAppointment(null);
    setIsEditing(false);

    toast({
      title: lang === "he" ? "השמירה נוקתה" : "Saved appointment cleared",
      description:
        lang === "he"
          ? "הסרנו את התור השמור מהמכשיר הזה"
          : "We removed the saved appointment from this browser",
    });
  }

  if (loading) {
    return (
      <Layout>
        <section className="px-6 pb-16 pt-24 md:px-16 md:pb-24 md:pt-32 lg:px-24">
          <div className="mx-auto max-w-4xl text-sm text-muted-foreground">
            {t("common.loading") || "Loading..."}
          </div>
        </section>
      </Layout>
    );
  }

  if (!saved?.manageToken) {
    return (
      <Layout>
        <section className="px-6 pb-16 pt-24 md:px-16 md:pb-24 md:pt-32 lg:px-24">
          <div className="mx-auto max-w-4xl border border-border p-6">
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-5xl">
              {lang === "he" ? "התור שלי" : "My Appointment"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lang === "he"
                ? "לא נמצא תור שמור בדפדפן הזה."
                : "No saved appointment was found in this browser."}
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout>
        <section className="px-6 pb-16 pt-24 md:px-16 md:pb-24 md:pt-32 lg:px-24">
          <div className="mx-auto max-w-4xl border border-border p-6">
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-5xl">
              {lang === "he" ? "התור שלי" : "My Appointment"}
            </h1>
            <p className="mb-4 text-sm text-muted-foreground">
              {lang === "he"
                ? "לא הצלחנו לטעון את התור השמור."
                : "We could not load the saved appointment."}
            </p>

            <button
              type="button"
              onClick={handleClearSaved}
              className="border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground/50"
            >
              {lang === "he" ? "נקה תור שמור" : "Clear saved appointment"}
            </button>
          </div>
        </section>
      </Layout>
    );
  }

  const canManage =
    !!appointment.canManage && appointment.status !== "cancelled";
  const currentBarberName = barberNameValue(appointment.barberId, barbers);

  return (
    <Layout>
      <section className="px-6 pb-16 pt-24 md:px-16 md:pb-24 md:pt-32 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 text-center text-3xl font-bold tracking-[0.15em] text-foreground md:text-5xl">
            {lang === "he" ? "התור שלי" : "My Appointment"}
          </h1>

          <p className="mb-10 text-center text-sm text-muted-foreground">
            {lang === "he"
              ? "אפשר לצפות, לערוך או לבטל את התור עד שעתיים לפני המועד."
              : "You can view, edit, or cancel your appointment up to 2 hours before the appointment time."}
          </p>

          <div className="mb-8 border border-border p-5 text-sm">
            <div className="mb-2">
              <span className="text-muted-foreground">
                {lang === "he" ? "קוד הזמנה: " : "Booking code: "}
              </span>
              <span className="font-medium text-foreground">
                {appointment.bookingCode || saved.bookingCode || "-"}
              </span>
            </div>

            <div className="mb-2">
              <span className="text-muted-foreground">
                {lang === "he" ? "סטטוס: " : "Status: "}
              </span>
              <span className="font-medium text-foreground">
                {appointment.status}
              </span>
            </div>

            {!canManage ? (
              <div className="mt-3 text-sm text-muted-foreground">
                {appointment.status === "cancelled"
                  ? lang === "he"
                    ? "התור כבר בוטל."
                    : "This appointment has already been cancelled."
                  : lang === "he"
                    ? "אי אפשר לערוך או לבטל פחות משעתיים לפני התור."
                    : "You can no longer edit or cancel less than 2 hours before the appointment."}
              </div>
            ) : null}
          </div>

          <div className="border border-border p-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InfoRow
                    label={lang === "he" ? "שם מלא" : "Full name"}
                    value={appointment.customerName}
                  />
                  <InfoRow
                    label={lang === "he" ? "טלפון" : "Phone"}
                    value={appointment.phone || "-"}
                  />
                  <InfoRow
                    label={lang === "he" ? "שירות" : "Service"}
                    value={appointment.service || "-"}
                  />
                  <InfoRow
                    label={lang === "he" ? "ספר" : "Barber"}
                    value={currentBarberName || "-"}
                  />
                  <InfoRow
                    label={lang === "he" ? "תאריך" : "Date"}
                    value={isoToDateInput(appointment.startAt)}
                  />
                  <InfoRow
                    label={lang === "he" ? "שעה" : "Time"}
                    value={`${isoToTimeInput(appointment.startAt)} - ${isoToTimeInput(
                      appointment.endAt,
                    )}`}
                  />
                </div>

                <InfoRow
                  label={lang === "he" ? "הערות" : "Notes"}
                  value={appointment.notes || "-"}
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    disabled={!canManage}
                    className={`border px-5 py-3 text-xs tracking-[0.12em] transition-all ${
                      !canManage
                        ? "cursor-not-allowed border-border text-muted-foreground opacity-60"
                        : "border-foreground bg-foreground text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {lang === "he" ? "ערוך תור" : "Edit Appointment"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={!canManage || cancelling}
                    className={`border px-5 py-3 text-xs tracking-[0.12em] transition-all ${
                      !canManage || cancelling
                        ? "cursor-not-allowed border-border text-muted-foreground opacity-60"
                        : "border-foreground text-foreground hover:bg-foreground hover:text-primary-foreground"
                    }`}
                  >
                    {cancelling
                      ? lang === "he"
                        ? "מבטל..."
                        : "Cancelling..."
                      : lang === "he"
                        ? "בטל תור"
                        : "Cancel Appointment"}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearSaved}
                    className="border border-border px-5 py-3 text-xs tracking-[0.12em] text-foreground transition-colors hover:border-foreground/50"
                  >
                    {lang === "he" ? "נקה שמירה" : "Clear Saved Appointment"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-xs tracking-[0.1em]">
                  {lang === "he" ? "עריכת תור" : "Edit Appointment"}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs tracking-[0.1em] text-foreground">
                      {lang === "he" ? "שם מלא" : "Full Name"}
                    </label>
                    <input
                      type="text"
                      value={form.customerName}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, customerName: e.target.value }))
                      }
                      className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs tracking-[0.1em] text-foreground">
                      {lang === "he" ? "טלפון" : "Phone"}
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, phone: e.target.value }))
                      }
                      className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs tracking-[0.1em] text-foreground">
                      {lang === "he" ? "שירות" : "Service"}
                    </label>
                    <select
                      value={form.time}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, time: e.target.value }))
                      }
                      className="w-full border border-border bg-black text-white px-4 py-3 text-sm transition-colors focus:border-foreground focus:outline-none"
                    >
                      <option value="" className="bg-black text-white">
                        {lang === "he" ? "בחר שעה" : "Select time"}
                      </option>

                      {slots.map((time) => (
                        <option
                          key={time}
                          value={time}
                          className="bg-black text-white"
                        >
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs tracking-[0.1em] text-foreground">
                      {lang === "he" ? "ספר" : "Barber"}
                    </label>
                    <select
                      value={form.barberId}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          barberId: e.target.value,
                          time: "",
                        }))
                      }
                      className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
                    >
                      <option value="" className="bg-black">
                        {lang === "he" ? "בחר ספר" : "Select barber"}
                      </option>
                      {barbers.map((b) => (
                        <option key={b._id} value={b._id} className="bg-black">
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs tracking-[0.1em] text-foreground">
                      {lang === "he" ? "תאריך" : "Date"}
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      min={formatYmd(new Date())}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          date: e.target.value,
                          time: "",
                        }))
                      }
                      className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs tracking-[0.1em] text-foreground">
                      {lang === "he" ? "שעה" : "Time"}
                    </label>

                    {loadingSlots ? (
                      <div className="border border-border px-4 py-3 text-sm text-muted-foreground">
                        {t("common.loading") || "Loading..."}
                      </div>
                    ) : (
                      <select
                        value={form.time}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, time: e.target.value }))
                        }
                        className="w-full  border border-border bg-transparent px-4 py-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
                      >
                        <option value="" className="bg-black">
                          {lang === "he" ? "בחר שעה" : "Select time"}
                        </option>
                        {slots.map((time) => (
                          <option key={time} value={time} className="bg-black">
                            {time}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs tracking-[0.1em] text-foreground">
                    {lang === "he" ? "הערות" : "Notes"}
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, notes: e.target.value }))
                    }
                    rows={4}
                    className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={`border px-5 py-3 text-xs tracking-[0.12em] transition-all ${
                      saving
                        ? "cursor-not-allowed border-border text-muted-foreground opacity-60"
                        : "border-foreground bg-foreground text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {saving
                      ? lang === "he"
                        ? "שומר..."
                        : "Saving..."
                      : lang === "he"
                        ? "שמור שינויים"
                        : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (appointment) {
                        setForm({
                          customerName: appointment.customerName || "",
                          phone: appointment.phone || "",
                          service: appointment.service || "",
                          notes: appointment.notes || "",
                          barberId: barberIdValue(appointment.barberId),
                          date: isoToDateInput(appointment.startAt),
                          time: isoToTimeInput(appointment.startAt),
                        });
                      }
                      setIsEditing(false);
                    }}
                    className="border border-border px-5 py-3 text-xs tracking-[0.12em] text-foreground transition-colors hover:border-foreground/50"
                  >
                    {lang === "he" ? "בטל" : "Cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-4 text-sm">
      <div className="mb-1 text-xs tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div className="text-foreground">{value}</div>
    </div>
  );
}
