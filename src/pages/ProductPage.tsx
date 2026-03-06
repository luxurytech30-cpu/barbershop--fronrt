import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { listProducts } from "@/lib/products";

type UIProduct = {
  id: string;
  name: string;
  nameHe?: string;
  desc: string;
  descHe?: string;
  image: string;
  price: number;
  stock: number;
  category: string;
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
    desc: String(p?.descrip ?? ""), // ✅ descrip
    descHe: String(p?.descripHe ?? p?.descrip ?? ""),
    image: String(p?.image?.url ?? ""), // ✅ image.url
    price: Number(p?.price ?? 0),
    stock,
    category, // ✅ cate
    isOut: stock <= 0,
    isLow: stock > 0 && stock <= LOW_STOCK_THRESHOLD,
  };
}

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang, dir } = useLanguage();
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const data = await listProducts();
        const normalized = (Array.isArray(data) ? data : []).map(
          normalizeProduct,
        );

        if (!alive) return;
        setItems(normalized);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load product");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  const product = useMemo(
    () => items.find((p) => String(p.id) === String(id)),
    [items, id],
  );

  const related = useMemo(() => {
    if (!product) return [];
    return items
      .filter((p) => p.id !== product.id)
      .filter((p) => p.category && p.category === product.category)
      .slice(0, 3);
  }, [items, product]);

  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <Layout>
        <div className="pt-32 text-center">
          <p className="text-muted-foreground font-heading">
            {t("common.loading") ?? "Loading..."}
          </p>
        </div>
      </Layout>
    );
  }

  if (err) {
    return (
      <Layout>
        <div className="pt-32 text-center">
          <p className="text-red-500 font-heading">{err}</p>
          <div className="mt-6">
            <Link to="/store" className="underline text-sm text-foreground">
              {t("product.back") ?? "Back"}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="pt-32 text-center">
          <p className="text-foreground font-heading">Product not found</p>
          <div className="mt-6">
            <Link to="/store" className="underline text-sm text-foreground">
              {t("product.back") ?? "Back"}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const maxQty = Math.max(0, Number(product.stock || 0));

  const dec = () => setQuantity((q) => Math.max(1, q - 1));
  const inc = () => setQuantity((q) => Math.min(maxQty, q + 1));

  const handleAddToCart = () => {
    if (product.isOut) return;
    const qty = Math.max(1, Math.min(quantity, maxQty));
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        nameHe: product.nameHe,
        price: product.price,
        image: product.image,
      });
    }
  };

  return (
    <Layout>
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-xs font-heading tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <BackIcon size={14} />
            {t("product.back")}
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square bg-secondary overflow-hidden relative">
              <img
                src={product.image}
                alt={lang === "he" ? product.nameHe : product.name}
                className="w-full h-full object-cover"
              />

              {product.isOut && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-xs font-heading tracking-[0.15em]">
                    {t("product.outOfStock") ?? "OUT OF STOCK"}
                  </span>
                </div>
              )}

              {product.isLow && !product.isOut && (
                <div className="absolute top-2 end-2 bg-foreground text-primary-foreground px-2 py-1 text-[10px] flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {t("product.lowStockShort") ?? "LOW"}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground tracking-[0.1em] mb-3">
                {lang === "he" ? product.nameHe : product.name}
              </h1>

              {/* Price + Stock status */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <p className="text-xl font-heading text-foreground">
                  ₪{Number(product.price || 0).toFixed(2)}
                </p>

                {product.isOut ? (
                  <span className="text-xs font-heading tracking-[0.15em] text-red-500">
                    {t("product.outOfStock") ?? "OUT OF STOCK"}
                  </span>
                ) : product.isLow ? (
                  <span className="text-xs font-heading tracking-[0.15em] text-foreground flex items-center gap-1">
                    {/* <AlertTriangle size={14} /> */}
                    {/* {t("product.lowStock") ?? "LOW STOCK"} ({product.stock}) */}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {/* {t("product.inStock") ?? "In stock"}: {product.stock} */}
                  </span>
                )}

                {/* Category (cate) */}
                {product.category && (
                  <span className="text-xs text-muted-foreground">
                    {t("product.category") ?? "Category"}: {product.category}
                  </span>
                )}
              </div>

              {/* Description (descrip) */}
              <div className="mb-6">
                <h3 className="text-xs font-heading tracking-[0.15em] text-foreground mb-2">
                  {t("product.description")}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {lang === "he" ? product.descHe : product.desc}
                </p>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="text-xs font-heading tracking-[0.1em] text-foreground mb-2 block">
                  {t("product.quantity")}
                </label>

                <div className="flex items-center border border-border w-fit">
                  <button
                    onClick={dec}
                    disabled={product.isOut || quantity <= 1}
                    className={`px-3 py-2 transition-opacity ${
                      product.isOut || quantity <= 1
                        ? "opacity-40 cursor-not-allowed"
                        : "text-foreground hover:opacity-70"
                    }`}
                  >
                    <Minus size={14} />
                  </button>

                  <span className="px-4 py-2 text-sm font-body text-foreground border-x border-border min-w-[40px] text-center">
                    {product.isOut ? 0 : quantity}
                  </span>

                  <button
                    onClick={inc}
                    disabled={product.isOut || quantity >= maxQty}
                    className={`px-3 py-2 transition-opacity ${
                      product.isOut || quantity >= maxQty
                        ? "opacity-40 cursor-not-allowed"
                        : "text-foreground hover:opacity-70"
                    }`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {!product.isOut && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("product.max") ?? "Max"}: {maxQty}
                  </p>
                )}
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.isOut}
                className={`w-full py-4 text-xs tracking-[0.2em] font-heading transition-opacity ${
                  product.isOut
                    ? "bg-border text-muted-foreground cursor-not-allowed"
                    : "bg-foreground text-primary-foreground hover:opacity-90"
                }`}
              >
                {product.isOut
                  ? (t("product.outOfStock") ?? "OUT OF STOCK")
                  : t("product.addToCart")}
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
                    <div className="aspect-square overflow-hidden bg-secondary mb-3 relative">
                      <img
                        src={p.image}
                        alt={lang === "he" ? p.nameHe : p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {p.isOut && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-[10px] font-heading tracking-[0.15em]">
                            {t("product.outOfStock") ?? "OUT"}
                          </span>
                        </div>
                      )}

                      {p.isLow && !p.isOut && (
                        <div className="absolute top-2 end-2 bg-foreground text-primary-foreground px-2 py-1 text-[10px] flex items-center gap-1">
                          <AlertTriangle size={12} />
                          {t("product.lowStockShort") ?? "LOW"}
                        </div>
                      )}
                    </div>

                    <h4 className="text-xs font-heading tracking-[0.1em] text-foreground group-hover:opacity-80 transition-opacity">
                      {lang === "he" ? p.nameHe : p.name}
                    </h4>

                    <p className="text-xs text-muted-foreground font-body mt-1">
                      ₪{Number(p.price || 0).toFixed(2)}
                    </p>
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
