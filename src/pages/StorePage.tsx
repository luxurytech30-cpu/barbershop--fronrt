import { useState } from "react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { products } from "@/components/BestsellersSection";
import { Link } from "react-router-dom";

const categories = ["all", "haircare", "tools", "accessories"];
const categoryKeys: Record<string, string> = {
  all: "store.all",
  haircare: "store.haircare",
  tools: "store.tools",
  accessories: "store.accessories",
};

const StorePage = () => {
  const { t, lang } = useLanguage();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <Layout>
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground tracking-[0.15em] mb-4 text-center">
            {t("store.title")}
          </h1>
          <p className="text-sm text-muted-foreground font-body text-center mb-12">
            {t("store.subtitle")}
          </p>

          {/* Filter */}
          <div className="flex justify-center gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-heading tracking-[0.15em] px-4 py-2 border transition-all ${
                  activeCategory === cat
                    ? "border-foreground bg-foreground text-primary-foreground"
                    : "border-border text-foreground hover:border-foreground/50"
                }`}
              >
                {t(categoryKeys[cat])}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product.id} className="group">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square overflow-hidden bg-secondary mb-3">
                    <img
                      src={product.image}
                      alt={lang === "he" ? product.nameHe : product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="text-xs md:text-sm font-heading tracking-[0.1em] text-foreground group-hover:opacity-80 transition-opacity">
                    {lang === "he" ? product.nameHe : product.name}
                  </h4>
                  <p className="text-xs text-muted-foreground font-body mt-1">₪{product.price.toFixed(2)}</p>
                </Link>
                <button
                  onClick={() => addItem({ id: product.id, name: product.name, nameHe: product.nameHe, price: product.price, image: product.image })}
                  className="mt-3 w-full border border-foreground text-foreground py-2 text-xs tracking-[0.15em] font-heading hover:bg-foreground hover:text-primary-foreground transition-all"
                >
                  {t("store.addToCart")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StorePage;
