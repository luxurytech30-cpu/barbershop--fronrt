import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { listServices } from "@/lib/services";
import { listBarbers } from "@/lib/barbers";
import { getAvailability } from "@/lib/availability";
import { api } from "@/lib/api";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

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

type Step = 1 | 2 | 3 | 4;

function todayYmd() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function timeToMin(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function saveLatestAppointmentToStorage(data: {
  appointmentId: string;
  bookingCode: string;
  manageToken: string;
}) {
  localStorage.setItem("latestAppointment", JSON.stringify(data));
}

function getLatestAppointmentFromStorage() {
  try {
    const raw = localStorage.getItem("latestAppointment");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearLatestAppointmentFromStorage() {
  localStorage.removeItem("latestAppointment");
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

export default function BookPage() {
  const { t, lang, dir } = useLanguage();
  const { toast } = useToast();

  const isRtl = dir === "rtl" || lang === "he";

  const [step, setStep] = useState<Step>(1);

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [slots, setSlots] = useState<string[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayYmd());
  const [selectedTime, setSelectedTime] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [bookingResult, setBookingResult] = useState<null | {
    appointmentId: string;
    bookingCode: string;
    manageToken: string;
  }>(null);

  const selectedService = useMemo(
    () => services.find((s) => s._id === selectedServiceId),
    [services, selectedServiceId],
  );

  const selectedBarber = useMemo(
    () => barbers.find((b) => b._id === selectedBarberId),
    [barbers, selectedBarberId],
  );

  const minDate = todayYmd();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);
  useEffect(() => {
    const saved = getLatestAppointmentFromStorage();
    if (saved?.manageToken) {
      setBookingResult(saved);
    }
  }, []);
  useEffect(() => {
    (async () => {
      try {
        setLoadingServices(true);
        const data = await listServices();

        console.log("SERVICES RESPONSE:", data);

        setServices(
          (Array.isArray(data) ? data : [])
            .filter((s) => s.isActive !== false)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        );
      } catch (e) {
        console.log("LOAD SERVICES ERROR:", e);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    })();

    (async () => {
      try {
        setLoadingBarbers(true);
        const data = await listBarbers();

        console.log("BARBERS RESPONSE:", data);

        setBarbers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.log("LOAD BARBERS ERROR:", e);
        setBarbers([]);
      } finally {
        setLoadingBarbers(false);
      }
    })();
  }, []);

  useEffect(() => {
    setSelectedTime("");
    setSlots([]);
  }, [selectedServiceId, selectedBarberId, selectedDate]);

  useEffect(() => {
    if (step !== 3) return;
    if (!selectedService || !selectedBarberId || !selectedDate) return;

    (async () => {
      try {
        setLoadingSlots(true);

        console.log("AVAILABILITY REQUEST:", {
          barberId: selectedBarberId,
          date: selectedDate,
          duration: selectedService.durationMin,
          serviceId: selectedService._id,
          serviceKey: selectedService.key,
        });

        const data = await getAvailability(
          selectedBarberId,
          selectedDate,
          selectedService.durationMin,
        );

        console.log("AVAILABILITY RESPONSE:", data);

        const normalized = extractSlots(data);

        console.log("NORMALIZED SLOTS BEFORE FILTER:", normalized);

        const isToday = selectedDate === todayYmd();

        const filtered = isToday
          ? normalized.filter((time: string) => timeToMin(time) > nowMinutes())
          : normalized;

        console.log("IS TODAY:", isToday);
        console.log("NOW MINUTES:", nowMinutes());
        console.log("FILTERED SLOTS:", filtered);

        setSlots(filtered);
      } catch (e) {
        console.log("AVAILABILITY ERROR:", e);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [step, selectedBarberId, selectedDate, selectedService]);

  async function confirmBooking() {
    if (
      !selectedService ||
      !selectedBarberId ||
      !selectedDate ||
      !selectedTime
    ) {
      toast({
        title: lang === "he" ? "חסר מידע" : "Missing selection",
        description:
          lang === "he"
            ? "יש להשלים את כל פרטי התור"
            : "Please complete the booking details",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim() || !phone.trim()) {
      toast({
        title: lang === "he" ? "חסרים פרטים" : "Missing details",
        description:
          lang === "he"
            ? "יש למלא שם וטלפון"
            : "Please enter your name and phone",
        variant: "destructive",
      });
      return;
    }

    const { start, end } = addMinutesToDate(
      selectedDate,
      selectedTime,
      selectedService.durationMin,
    );

    console.log("BOOKING PAYLOAD:", {
      barberId: selectedBarberId,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      customerName: name.trim(),
      phone: phone.trim(),
      service: selectedService.key,
      selectedDate,
      selectedTime,
      durationMin: selectedService.durationMin,
    });

    try {
      setSubmitting(true);

      const res = await api.post("/api/appointments", {
        barberId: selectedBarberId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        customerName: name.trim(),
        phone: phone.trim(),
        service: selectedService.key,
        notes: "",
      });

      const result = {
        appointmentId: res?.data?.appointmentId || "",
        bookingCode: res?.data?.bookingCode || "",
        manageToken: res?.data?.manageToken || "",
      };

      setBookingResult(result);
      saveLatestAppointmentToStorage(result);

      toast({
        title: lang === "he" ? "התור נקבע בהצלחה" : "Appointment booked",
      });

      setStep(1);
      setSelectedServiceId("");
      setSelectedBarberId("");
      setSelectedDate(todayYmd());
      setSelectedTime("");
      setName("");
      setPhone("");
      setSlots([]);
    } catch (err: any) {
      console.log("BOOKING ERROR FULL:", err);
      console.log("BOOKING ERROR RESPONSE:", err?.response);
      console.log("BOOKING ERROR DATA:", err?.response?.data);

      toast({
        title: lang === "he" ? "קביעת התור נכשלה" : "Booking failed",
        description:
          err?.response?.data?.message ||
          (lang === "he"
            ? "ייתכן שהשעה הזו כבר נתפסה"
            : "This time may already be booked"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <section className="px-6 pb-16 pt-24 md:px-16 md:pb-24 md:pt-32 lg:px-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 text-center text-3xl font-bold tracking-[0.15em] text-foreground md:text-5xl">
            {t("book.title")}
          </h1>

          <p className="mb-10 text-center text-sm text-muted-foreground">
            {t("book.subtitle")}
          </p>

          {bookingResult?.manageToken ? (
            <div className="mb-8 border border-border p-5 text-sm">
              <div className="mb-2 font-semibold text-foreground">
                {lang === "he"
                  ? "התור נקבע בהצלחה"
                  : "Appointment booked successfully"}
              </div>

              <div className="mb-2 text-muted-foreground">
                {lang === "he"
                  ? "שמרנו את פרטי התור בדפדפן הזה. אפשר לצפות, לערוך או לבטל עד שעתיים לפני המועד."
                  : "We saved your appointment on this browser. You can view, edit, or cancel it up to 2 hours before the appointment."}
              </div>

              <div className="mb-4">
                <span className="text-muted-foreground">
                  {lang === "he" ? "קוד הזמנה: " : "Booking code: "}
                </span>
                <span className="font-medium text-foreground">
                  {bookingResult.bookingCode || "-"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/my-appointment";
                  }}
                  className="border border-foreground bg-foreground px-4 py-2 text-xs text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {lang === "he" ? "צפה בתור שלי" : "View My Appointment"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearLatestAppointmentFromStorage();
                    setBookingResult(null);
                  }}
                  className="border border-border px-4 py-2 text-xs text-foreground transition-colors hover:border-foreground/50"
                >
                  {lang === "he" ? "נקה שמירה" : "Clear saved appointment"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="mb-8 border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {[
                { n: 1, label: t("book.service") || "Service" },
                { n: 2, label: t("book.barber") || "Barber" },
                { n: 3, label: t("book.dateTime") || "Date & Time" },
                { n: 4, label: t("product.details") || "Details" },
              ].map((s) => {
                const active = step === s.n;
                const done = step > s.n;

                return (
                  <div key={s.n} className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                        done
                          ? "border-foreground bg-foreground text-primary-foreground"
                          : active
                            ? "border-foreground text-foreground"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      {done ? <Check size={14} /> : s.n}
                    </div>

                    <div
                      className={`text-xs tracking-[0.12em] ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-border p-6">
            {step === 1 && (
              <div>
                <div className="mb-4 text-xs tracking-[0.1em]">
                  {t("book.service") || "Service"}
                </div>

                {loadingServices ? (
                  <div className="text-sm text-muted-foreground">
                    {t("common.loading") || "Loading..."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {services.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => {
                          console.log("SERVICE CLICKED:", s);
                          setBookingResult(null);
                          setSelectedServiceId(s._id);
                          setStep(2);
                        }}
                        className={`border px-4 py-4 text-start transition-all ${
                          selectedServiceId === s._id
                            ? "border-foreground bg-foreground text-primary-foreground"
                            : "border-border text-foreground hover:border-foreground/50"
                        }`}
                      >
                        <span className="block text-xs tracking-[0.1em]">
                          {lang === "he" ? s.nameHe || s.name : s.name}
                        </span>
                        <span className="mt-1 block text-xs opacity-70">
                          ₪{s.price} · {s.durationMin} min
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-4 text-xs tracking-[0.1em]">
                  {t("book.barber") || "Barber"}
                </div>

                {loadingBarbers ? (
                  <div className="text-sm text-muted-foreground">
                    {t("common.loading") || "Loading..."}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {barbers.map((b) => (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => {
                          console.log("BARBER CLICKED:", b);
                          setSelectedBarberId(b._id);
                          setStep(3);
                        }}
                        className={`border px-6 py-3 text-xs tracking-[0.1em] transition-all ${
                          selectedBarberId === b._id
                            ? "border-foreground bg-foreground text-primary-foreground"
                            : "border-border text-foreground hover:border-foreground/50"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs tracking-[0.1em] text-foreground">
                    {t("book.date") || "Date"}
                  </label>

                  <input
                    type="date"
                    required
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => {
                      console.log("DATE CHANGED:", e.target.value);
                      setSelectedDate(e.target.value);
                    }}
                    className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-4 block text-xs tracking-[0.1em] text-foreground">
                    {t("book.time") || "Time"}
                  </label>

                  {loadingSlots ? (
                    <div className="text-sm text-muted-foreground">
                      {t("common.loading") || "Loading..."}
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>
                        {lang === "he"
                          ? "אין שעות פנויות"
                          : "No available times"}
                      </div>

                      <div className="text-xs opacity-80">
                        {lang === "he"
                          ? "בדוק ב-Console את AVAILABILITY REQUEST / RESPONSE / FILTERED SLOTS"
                          : "Check Console: AVAILABILITY REQUEST / RESPONSE / FILTERED SLOTS"}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            console.log("TIME CLICKED:", time);
                            setSelectedTime(time);
                            setStep(4);
                          }}
                          className={`border px-4 py-2 text-xs transition-all ${
                            selectedTime === time
                              ? "border-foreground bg-foreground text-primary-foreground"
                              : "border-border text-foreground hover:border-foreground/50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-xs tracking-[0.1em]">
                  {t("product.details") || "Details"}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs tracking-[0.1em] text-foreground">
                      {t("book.name") || "Full Name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs tracking-[0.1em] text-foreground">
                      {t("book.phone") || "Phone"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border border-border p-5 text-sm">
                  <div className="mb-2 flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("book.service") || "Service"}
                    </span>
                    <span className="text-foreground">
                      {selectedService
                        ? lang === "he"
                          ? selectedService.nameHe || selectedService.name
                          : selectedService.name
                        : "-"}
                    </span>
                  </div>

                  <div className="mb-2 flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("book.barber") || "Barber"}
                    </span>
                    <span className="text-foreground">
                      {selectedBarber?.name || "-"}
                    </span>
                  </div>

                  <div className="mb-2 flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("book.date") || "Date"}
                    </span>
                    <span className="text-foreground">
                      {selectedDate || "-"}
                    </span>
                  </div>

                  <div className="mb-2 flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("book.time") || "Time"}
                    </span>
                    <span className="text-foreground">
                      {selectedTime || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {t("book.price") || "Total"}
                    </span>
                    <span className="text-foreground">
                      ₪{selectedService?.price ?? 0}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={confirmBooking}
                  disabled={
                    !name.trim() || !phone.trim() || !selectedTime || submitting
                  }
                  className={`w-full py-4 text-xs tracking-[0.2em] transition-opacity ${
                    !name.trim() || !phone.trim() || !selectedTime || submitting
                      ? "cursor-not-allowed bg-border text-muted-foreground"
                      : "bg-foreground text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {submitting
                    ? t("common.loading") || "Loading..."
                    : t("book.submit") || "Book Appointment"}
                </button>
              </div>
            )}
          </div>

          <div
            className={`mt-8 flex ${isRtl ? "justify-end" : "justify-start"}`}
          >
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(1, prev - 1) as Step)}
              disabled={step === 1}
              className={`inline-flex items-center gap-2 border px-5 py-3 text-xs tracking-[0.12em] transition-all ${
                step === 1
                  ? "cursor-not-allowed border-border text-muted-foreground opacity-60"
                  : "border-foreground text-foreground hover:bg-foreground hover:text-primary-foreground"
              }`}
            >
              {isRtl ? (
                <>
                  <ArrowRight size={15} />
                  <span>{t("common.back") || "חזרה"}</span>
                </>
              ) : (
                <>
                  <ArrowLeft size={15} />
                  <span>{t("common.back") || "Back"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
