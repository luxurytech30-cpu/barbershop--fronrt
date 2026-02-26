import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import heroBg from "@/assets/hero-bg.jpg";
import { Award, Lightbulb, Users } from "lucide-react";

const AboutPage = () => {
  const { t } = useLanguage();

  const values = [
    { icon: Award, titleKey: "about.value1.title", descKey: "about.value1.desc" },
    { icon: Lightbulb, titleKey: "about.value2.title", descKey: "about.value2.desc" },
    { icon: Users, titleKey: "about.value3.title", descKey: "about.value3.desc" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <img src={heroBg} alt="About X-UP" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground tracking-[0.15em]">
            {t("about.title")}
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-heading text-foreground mb-8 tracking-[0.15em]">
            {t("about.story.title")}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground font-body leading-relaxed mb-6">
            {t("about.story.p1")}
          </p>
          <p className="text-sm md:text-base text-muted-foreground font-body leading-relaxed">
            {t("about.story.p2")}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-foreground text-primary-foreground py-16 md:py-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading mb-6 tracking-[0.15em]">
            {t("about.mission.title")}
          </h2>
          <p className="text-sm md:text-base text-primary-foreground/70 font-body leading-relaxed">
            {t("about.mission.desc")}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 px-6 md:px-16 lg:px-24">
        <h2 className="text-2xl md:text-3xl font-heading text-foreground text-center mb-12 tracking-[0.15em]">
          {t("about.values.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {values.map((v) => (
            <div key={v.titleKey} className="text-center">
              <v.icon className="mx-auto mb-4 text-foreground" size={32} strokeWidth={1} />
              <h3 className="text-sm font-heading tracking-[0.15em] text-foreground mb-2">{t(v.titleKey)}</h3>
              <p className="text-xs text-muted-foreground font-body">{t(v.descKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
