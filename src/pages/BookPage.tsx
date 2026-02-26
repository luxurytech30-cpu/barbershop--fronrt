import { useState } from "react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

const services = [
  { id: "haircut", price: 120, duration: "45 min" },
  { id: "beard", price: 60, duration: "20 min" },
  { id: "combo", price: 160, duration: "60 min" },
  { id: "deluxe", price: 220, duration: "90 min" },
];

const barbers = ["Daniel", "Yoav", "Eitan", "Nir"];

const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const BookPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState("");
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: t("booking.cta"), description: "✓" });
  };

  return (
    <Layout>
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground tracking-[0.15em] mb-4 text-center">
            {t("book.title")}
          </h1>
          <p className="text-sm text-muted-foreground font-body text-center mb-12">
            {t("book.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Service */}
            <div>
              <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-4 block">{t("book.service")}</label>
              <div className="grid grid-cols-2 gap-3">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedService(s.id)}
                    className={`border px-4 py-4 text-start transition-all ${
                      selectedService === s.id
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border text-foreground hover:border-foreground/50"
                    }`}
                  >
                    <span className="text-xs font-heading tracking-[0.1em] block">
                      {t(`book.service.${s.id}`)}
                    </span>
                    <span className="text-xs font-body opacity-70 mt-1 block">
                      ₪{s.price} · {s.duration}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Barber */}
            <div>
              <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-4 block">{t("book.barber")}</label>
              <div className="flex flex-wrap gap-3">
                {barbers.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBarber(b)}
                    className={`border px-6 py-3 text-xs font-heading tracking-[0.1em] transition-all ${
                      selectedBarber === b
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border text-foreground hover:border-foreground/50"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-2 block">{t("book.date")}</label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-transparent border border-border px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
              />
            </div>

            {/* Time */}
            <div>
              <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-4 block">{t("book.time")}</label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`border px-4 py-2 text-xs font-body transition-all ${
                      selectedTime === time
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-border text-foreground hover:border-foreground/50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-2 block">{t("book.name")}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-2 block">{t("book.phone")}</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </div>

            {/* Summary & Submit */}
            {selectedServiceData && (
              <div className="border border-border p-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-heading tracking-[0.1em] text-foreground">{t("book.price")}</span>
                  <span className="text-lg font-heading text-foreground">₪{selectedServiceData.price}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-foreground text-primary-foreground py-4 text-xs tracking-[0.2em] font-heading hover:opacity-90 transition-opacity"
            >
              {t("book.submit")}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default BookPage;
