import { useState } from "react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ContactPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: t("contact.send"), description: "✓" });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <Layout>
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground tracking-[0.15em] mb-4 text-center">
            {t("contact.title")}
          </h1>
          <p className="text-sm text-muted-foreground font-body text-center mb-12">
            {t("contact.subtitle")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-2 block">{t("contact.name")}</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-2 block">{t("contact.email")}</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-2 block">{t("contact.phone")}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-2 block">{t("contact.message")}</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-foreground text-primary-foreground py-3 text-xs tracking-[0.2em] font-heading hover:opacity-90 transition-opacity"
              >
                {t("contact.send")}
              </button>
            </form>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-heading tracking-[0.15em] text-foreground mb-4">{t("contact.info.title")}</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground font-body">{t("contact.address")}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground font-body">{t("contact.emailAddr")}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground font-body">{t("contact.phoneNum")}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-heading tracking-[0.15em] text-foreground mb-4 flex items-center gap-2">
                  <Clock size={16} />
                  {t("contact.hours")}
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-body">{t("contact.hours.weekdays")}</p>
                  <p className="text-sm text-muted-foreground font-body">{t("contact.hours.friday")}</p>
                  <p className="text-sm text-muted-foreground font-body">{t("contact.hours.saturday")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
