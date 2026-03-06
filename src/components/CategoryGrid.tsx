import haircareImg from "@/assets/haircare-category.jpg";
import academyImg from "@/assets/academy-category.jpg";
import toolsImg from "@/assets/tools-category.jpg";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const CategoryGrid = () => {
  const { t } = useLanguage();

  const categories = [
    {
      title: t("cat.book"),
      cta: t("cat.book.cta"),
      image: haircareImg,
      link: "/book",
    },
    {
      title: t("cat.academy"),
      cta: t("cat.academy.cta"),
      image: academyImg,
      link: "/academy",
    },
    {
      title: t("cat.tools"),
      cta: t("cat.tools.cta"),
      image: toolsImg,
      link: "/store",
    },
  ];

  return (
    <section id="services" className="grid grid-cols-1 md:grid-cols-3">
      {categories.map((cat) => (
        <Link
          key={cat.title}
          to={cat.link}
          className="group relative aspect-[3/4] md:aspect-auto md:h-[500px] overflow-hidden"
        >
          <img
            src={cat.image}
            alt={cat.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-background/50 group-hover:bg-background/40 transition-colors duration-500" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground">
            <p className="text-xs tracking-[0.15em] font-body text-foreground/70 mb-2">
              {cat.title}
            </p>
            <h3 className="text-lg tracking-[0.2em] font-heading font-semibold border-b border-foreground/50 pb-1 group-hover:border-foreground transition-colors">
              {cat.cta}
            </h3>
          </div>
        </Link>
      ))}
    </section>
  );
};

export default CategoryGrid;
