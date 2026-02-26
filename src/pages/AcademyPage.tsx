import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { courses } from "@/components/AcademySection";
import academyImg from "@/assets/academy-category.jpg";
import { Check } from "lucide-react";

const AcademyPage = () => {
  const { t, lang } = useLanguage();

  const whyPoints = ["academy.why1", "academy.why2", "academy.why3", "academy.why4"];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <img src={academyImg} alt="X-UP Academy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground tracking-[0.15em] mb-4">
            {t("academy.page.title")}
          </h1>
          <p className="text-sm md:text-base text-foreground/80 font-body max-w-lg">
            {t("academy.page.subtitle")}
          </p>
        </div>
      </section>

      {/* About Academy */}
      <section className="py-16 md:py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm md:text-base text-muted-foreground font-body leading-relaxed">
            {t("academy.page.desc")}
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="bg-foreground text-primary-foreground py-16 md:py-24 px-6 md:px-16 lg:px-24">
        <h2 className="text-2xl md:text-3xl font-heading text-center mb-12 tracking-[0.15em]">
          {t("academy.why.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {whyPoints.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <Check size={16} className="flex-shrink-0" />
              <p className="text-sm font-body">{t(key)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 md:py-24 px-6 md:px-16 lg:px-24">
        <h2 className="text-2xl md:text-3xl font-heading text-foreground text-center mb-12 tracking-[0.15em]">
          {t("academy.courses")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {courses.map((course) => (
            <div key={course.id} className="border border-border">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={course.image} alt={lang === "he" ? course.nameHe : course.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-sm font-heading tracking-[0.1em] text-foreground mb-2">
                  {lang === "he" ? course.nameHe : course.name}
                </h3>
                <p className="text-xs text-muted-foreground font-body mb-4 leading-relaxed">
                  {lang === "he" ? course.descHe : course.desc}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-heading ${course.soldOut ? "text-destructive" : "text-foreground"}`}>
                    {course.soldOut ? t("academy.soldOut") : `₪${course.price.toFixed(2)}`}
                  </span>
                  {!course.soldOut && (
                    <button className="border border-foreground text-foreground px-4 py-2 text-xs tracking-[0.15em] font-heading hover:bg-foreground hover:text-primary-foreground transition-all">
                      {t("academy.enroll")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default AcademyPage;
