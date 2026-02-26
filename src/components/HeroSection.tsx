import heroBg from "@/assets/hero-bg.jpg";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="X-UP Male Grooming" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/40" />
      </div>
      <div className="relative z-10 flex flex-col justify-end h-full pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-2xl animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground leading-[0.95] mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-foreground/80 text-base md:text-lg font-body font-light max-w-lg mb-8">
            {t("hero.subtitle")}
          </p>
          <Link
            to="/about"
            className="inline-block border border-foreground text-foreground px-10 py-3 text-xs tracking-[0.2em] font-heading hover:bg-foreground hover:text-primary-foreground transition-all duration-300"
          >
            {t("hero.cta")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
