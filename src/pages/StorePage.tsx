import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { listProducts } from "@/lib/products";
import { AlertTriangle, Search } from "lucide-react";

type UIProduct = {
  id: string;
  name: string;
  nameHe?: string;
  desc: string;
  descHe?: string;
  image: string;
  price: number;
  stock: number;
  category: string; // cate
  isOut: boolean;
  isLow: boolean;
};

const LOW_STOCK_THRESHOLD = 3;

function normalizeProduct(p: any): UIProduct {
  const stock = Number(p?.stock ?? 0);
  const category = String(p?.cate ?? "")
    .toLowerCase()
    .trim();

  return {
    id: String(p?._id ?? p?.id ?? ""),
    name: String(p?.name ?? ""),
    nameHe: String(p?.nameHe ?? p?.name ?? ""),
    desc: String(p?.descrip ?? ""),
    descHe: String(p?.descripHe ?? p?.descrip ?? ""),
    image: String(p?.image?.url ?? ""),
    price: Number(p?.price ?? 0),
    stock,
    category,
    isOut: stock <= 0,
    isLow: stock > 0 && stock <= LOW_STOCK_THRESHOLD,
  };
}

const StorePage = () => {
  const { t, lang, dir } = useLanguage();
  const { addItem } = useCart();

  const [items, setItems] = useState<UIProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState(""); // ✅ search query
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const data = await listProducts(); // GET /api/products
        const normalized = (Array.isArray(data) ? data : []).map(
          normalizeProduct,
        );

        if (!alive) return;
        setItems(normalized);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load products");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ Dynamic categories based on DB "cate"
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["all", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items
      .filter((p) =>
        activeCategory === "all" ? true : p.category === activeCategory,
      )
      .filter((p) => {
        if (!q) return true;

        const haystack = [
          p.name,
          p.nameHe ?? "",
          p.desc,
          p.descHe ?? "",
          p.category,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      });
  }, [activeCategory, items, query]);

  const inputDir = dir ?? (lang === "he" ? "rtl" : "ltr");

  return (
    <Layout>
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground tracking-[0.15em] mb-4 text-center">
            {t("store.title")}
          </h1>
          <p className="text-sm text-muted-foreground font-body text-center mb-10">
            {t("store.subtitle")}
          </p>

          {/* ✅ Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <span className="absolute top-1/2 -translate-y-1/2 left-3 text-muted-foreground">
                <Search size={16} />
              </span>

              <input
                dir={inputDir}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("store.search") ?? "Search products..."}
                className="w-full border border-border bg-background text-foreground pl-10 pr-3 py-3 text-sm font-body outline-none focus:border-foreground/60"
              />

              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("common.clear") ?? "Clear"}
                </button>
              )}
            </div>

            {!loading && !err && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t("store.results") ?? "Results"}: {filtered.length}
              </p>
            )}
          </div>

          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
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
                {cat === "all" ? t("store.all") : cat}
              </button>
            ))}
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="text-center text-sm text-muted-foreground">
              {t("common.loading") ?? "Loading..."}
            </div>
          )}

          {err && !loading && (
            <div className="text-center text-sm text-red-500">{err}</div>
          )}

          {/* Grid */}
          {!loading && !err && (
            <>
              {filtered.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">
                  {t("store.noResults") ?? "No products found."}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filtered.map((product) => (
                    <div key={product.id} className="group">
                      <Link to={`/product/${product.id}`}>
                        <div className="aspect-square overflow-hidden bg-secondary mb-3 relative">
                          <img
                            src={product.image}
                            alt={lang === "he" ? product.nameHe : product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* OUT overlay */}
                          {product.isOut && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-white text-xs font-heading tracking-[0.15em]">
                                {t("product.outOfStock") ?? "OUT OF STOCK"}
                              </span>
                            </div>
                          )}

                          {/* LOW badge */}
                          {product.isLow && !product.isOut && (
                            <div className="absolute top-2 end-2 bg-foreground text-primary-foreground px-2 py-1 text-[10px] flex items-center gap-1">
                              <AlertTriangle size={12} />
                              {t("product.lowStockShort") ?? "LOW"}
                            </div>
                          )}
                        </div>

                        <h4 className="text-xs md:text-sm font-heading tracking-[0.1em] text-foreground group-hover:opacity-80 transition-opacity">
                          {lang === "he" ? product.nameHe : product.name}
                        </h4>

                        <p className="text-xs text-muted-foreground font-body mt-1">
                          ₪{Number(product.price || 0).toFixed(2)}
                        </p>
                      </Link>

                      <button
                        disabled={product.isOut}
                        onClick={() =>
                          addItem({
                            id: product.id,
                            name: product.name,
                            nameHe: product.nameHe,
                            price: product.price,
                            image: product.image,
                          })
                        }
                        className={`mt-3 w-full border py-2 text-xs tracking-[0.15em] font-heading transition-all
                          ${
                            product.isOut
                              ? "border-border text-muted-foreground cursor-not-allowed opacity-60"
                              : "border-foreground text-foreground hover:bg-foreground hover:text-primary-foreground"
                          }`}
                      >
                        {product.isOut
                          ? (t("product.outOfStock") ?? "Out of stock")
                          : t("store.addToCart")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default StorePage;
