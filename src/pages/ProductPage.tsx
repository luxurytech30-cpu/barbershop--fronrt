import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { products } from "@/components/BestsellersSection";
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang, dir } = useLanguage();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);
  const related = products.filter((p) => p.id !== id).slice(0, 3);

  if (!product) {
    return (
      <Layout>
        <div className="pt-32 text-center">
          <p className="text-foreground font-heading">Product not found</p>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ id: product.id, name: product.name, nameHe: product.nameHe, price: product.price, image: product.image });
    }
  };

  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <Layout>
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <Link to="/store" className="inline-flex items-center gap-2 text-xs font-heading tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors mb-8">
            <BackIcon size={14} />
            {t("product.back")}
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square bg-secondary overflow-hidden">
              <img src={product.image} alt={lang === "he" ? product.nameHe : product.name} className="w-full h-full object-cover" />
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground tracking-[0.1em] mb-4">
                {lang === "he" ? product.nameHe : product.name}
              </h1>
              <p className="text-xl font-heading text-foreground mb-6">₪{product.price.toFixed(2)}</p>

              <div className="mb-6">
                <h3 className="text-xs font-heading tracking-[0.15em] text-foreground mb-2">{t("product.description")}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {lang === "he" ? product.descHe : product.desc}
                </p>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-2 block">{t("product.quantity")}</label>
                <div className="flex items-center border border-border w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-foreground hover:opacity-70 transition-opacity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-body text-foreground border-x border-border min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-foreground hover:opacity-70 transition-opacity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-foreground text-primary-foreground py-4 text-xs tracking-[0.2em] font-heading hover:opacity-90 transition-opacity"
              >
                {t("product.addToCart")}
              </button>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-16 md:mt-24">
              <h2 className="text-xl font-heading text-foreground tracking-[0.15em] mb-8">
                {t("product.related")}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {related.map((p) => (
                  <Link key={p.id} to={`/product/${p.id}`} className="group">
                    <div className="aspect-square overflow-hidden bg-secondary mb-3">
                      <img src={p.image} alt={lang === "he" ? p.nameHe : p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h4 className="text-xs font-heading tracking-[0.1em] text-foreground group-hover:opacity-80 transition-opacity">
                      {lang === "he" ? p.nameHe : p.name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-body mt-1">₪{p.price.toFixed(2)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ProductPage;
