import { useLanguage } from "@/context/LanguageContext";

const TestimonialsSection = () => {
  const { t } = useLanguage();

  const testimonials = [
    { quoteKey: "testimonial1.quote", nameKey: "testimonial1.name" },
    { quoteKey: "testimonial2.quote", nameKey: "testimonial2.name" },
  ];

  return (
    <section className="bg-secondary py-16 md:py-24 px-6 md:px-16 lg:px-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {testimonials.map((tm) => (
          <div key={tm.nameKey} className="text-center">
            <blockquote className="text-foreground/90 text-sm md:text-base font-body italic leading-relaxed mb-6">
              "{t(tm.quoteKey)}"
            </blockquote>
            <p className="text-xs font-heading tracking-[0.15em] text-foreground font-semibold">
              {t(tm.nameKey)}
            </p>
            <p className="text-xs text-muted-foreground font-body">{t("testimonial.role")}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
