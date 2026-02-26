import courseImg from "@/assets/course-1.jpg";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export const courses = [
  { id: "core-1day", name: "CORE OF X-UP - 1 Day Course", nameHe: "הליבה של X-UP - קורס יום אחד", price: 299.99, soldOut: false, image: courseImg, desc: "An intensive 1-day course covering the core techniques of X-UP barbering.", descHe: "קורס אינטנסיבי של יום אחד המכסה את הטכניקות הליבתיות של ספרות X-UP." },
  { id: "foundations-12w", name: "FOUNDATIONS - 12 WEEK COURSE", nameHe: "יסודות - קורס 12 שבועות", price: 5799, soldOut: false, image: courseImg, desc: "A comprehensive 12-week course for complete beginners wanting to start a career in barbering.", descHe: "קורס מקיף של 12 שבועות למתחילים שרוצים להתחיל קריירה בספרות." },
  { id: "core-shapes-4d", name: "CORE SHAPES - 4 Day Course", nameHe: "צורות ליבה - קורס 4 ימים", price: 999, soldOut: true, image: courseImg, desc: "Advanced 4-day course focusing on core shape techniques.", descHe: "קורס מתקדם של 4 ימים המתמקד בטכניקות צורות ליבה." },
];

const AcademySection = () => {
  const { t, lang } = useLanguage();

  return (
    <section id="academy" className="bg-secondary py-16 md:py-24 px-6 md:px-16 lg:px-24">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-2xl md:text-3xl font-heading text-foreground tracking-[0.15em]">
          {t("academy.title")}
        </h2>
        <p className="text-xs text-muted-foreground tracking-[0.1em] font-heading">
          {t("academy.subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link key={course.id} to="/academy" className="group">
            <div className="aspect-[4/5] overflow-hidden mb-4">
              <img src={course.image} alt={lang === "he" ? course.nameHe : course.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <h4 className="text-sm font-heading tracking-[0.1em] text-foreground group-hover:opacity-80 transition-opacity">
              {lang === "he" ? course.nameHe : course.name}
            </h4>
            <p className={`text-xs font-body mt-1 ${course.soldOut ? "text-destructive" : "text-muted-foreground"}`}>
              {course.soldOut ? t("academy.soldOut") : `₪${course.price.toFixed(2)}`}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AcademySection;
