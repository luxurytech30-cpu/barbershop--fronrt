import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { listProducts } from "@/lib/products";

type UIProduct = {
  id: string;
  name: string;
  nameHe?: string;
  price: number;
  image: string;
};

function normalizeProduct(p: any): UIProduct {
  return {
    id: String(p?._id ?? p?.id ?? ""),
    name: String(p?.name ?? ""),
    nameHe: String(p?.nameHe ?? p?.name ?? ""),
    price: Number(p?.price ?? 0),
    image: String(p?.image?.url ?? ""),
  };
}

const BestsellersSection = () => {
  const { t, lang } = useLanguage();

  const [products, setProducts] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await listProducts();

        const topProducts = (Array.isArray(data) ? data : [])
          .filter((p) => p.isTop) // ✅ only top products
          .slice(0, 5) // show max 5
          .map(normalizeProduct);

        if (!alive) return;
        setProducts(topProducts);
      } catch {
        if (!alive) return;
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section id="shop" className="py-16 md:py-24 px-6 md:px-16 lg:px-24">
      <h2 className="text-2xl md:text-3xl font-heading text-center text-foreground mb-12 tracking-[0.15em]">
        {t("bestsellers.title")}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group"
          >
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

            <p className="text-xs text-muted-foreground font-body mt-1">
              ₪{product.price.toFixed(2)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BestsellersSection;
