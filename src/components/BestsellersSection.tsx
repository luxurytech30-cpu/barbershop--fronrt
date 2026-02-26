import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export const products = [
  { id: "styling-pomade", name: "The Styling Pomade", nameHe: "משחת עיצוב", price: 14.99, image: product1, category: "haircare", desc: "Premium styling pomade for a strong, flexible hold with a natural finish.", descHe: "משחת עיצוב פרימיום לאחיזה חזקה וגמישה עם מראה טבעי." },
  { id: "water-spray", name: "X-UP Water Spray", nameHe: "ספריי מים X-UP", price: 9.99, image: product2, category: "tools", desc: "Fine mist water spray for precision styling and cutting.", descHe: "ספריי מים דק לעיצוב וחיתוך מדויק." },
  { id: "pro-trimmer", name: "The Pro Trimmer", nameHe: "מכונת תספורת מקצועית", price: 199.99, image: product3, category: "tools", desc: "Professional-grade trimmer with precision blades and long battery life.", descHe: "מכונת תספורת מקצועית עם להבים מדויקים וסוללה ארוכה." },
  { id: "comb-set", name: "Precision Comb Set", nameHe: "סט מסרקים", price: 9.99, image: product4, category: "accessories", desc: "Set of professional combs for precision barbering.", descHe: "סט מסרקים מקצועיים לספרות מדויקת." },
  { id: "master-shears", name: "Master Shears", nameHe: "מספריים מקצועיות", price: 89.99, image: product5, category: "tools", desc: "Hand-crafted professional shears with ergonomic design.", descHe: "מספריים מקצועיות בעבודת יד עם עיצוב ארגונומי." },
];

const BestsellersSection = () => {
  const { t, lang } = useLanguage();

  return (
    <section id="shop" className="py-16 md:py-24 px-6 md:px-16 lg:px-24">
      <h2 className="text-2xl md:text-3xl font-heading text-center text-foreground mb-12 tracking-[0.15em]">
        {t("bestsellers.title")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`} className="group">
            <div className="aspect-square overflow-hidden bg-secondary mb-3">
              <img src={product.image} alt={lang === "he" ? product.nameHe : product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <h4 className="text-xs md:text-sm font-heading tracking-[0.1em] text-foreground group-hover:opacity-80 transition-opacity">
              {lang === "he" ? product.nameHe : product.name}
            </h4>
            <p className="text-xs text-muted-foreground font-body mt-1">₪{product.price.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BestsellersSection;
