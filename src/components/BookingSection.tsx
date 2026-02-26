import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const BookingSection = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-foreground text-primary-foreground py-16 md:py-24 px-6 md:px-16 lg:px-24">
      <div className="max-w-3xl mx-auto text-center">
        <h3 className="text-sm tracking-[0.2em] font-heading mb-6">{t("booking.title")}</h3>
        <p className="text-primary-foreground/70 text-sm md:text-base font-body leading-relaxed mb-8 max-w-2xl mx-auto">
          {t("booking.desc")}
        </p>
        <Link
          to="/book"
          className="inline-block border border-primary-foreground text-primary-foreground px-10 py-3 text-xs tracking-[0.2em] font-heading hover:bg-primary-foreground hover:text-foreground transition-all duration-300"
        >
          {t("booking.cta")}
        </Link>
      </div>
    </section>
  );
};

export default BookingSection;
