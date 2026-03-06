import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "react-router-dom";

const CartSidebar = () => {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    total,
    itemCount,
  } = useCart();
  const { t, lang } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-background/60 z-[60]"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed top-0 end-0 h-full w-full max-w-md bg-card z-[9999] flex flex-col border-s border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border ">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-foreground" />
            <h3 className="text-sm font-heading tracking-[0.15em] text-foreground">
              {t("cart.title")} ({itemCount})
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-foreground hover:opacity-70 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag
                size={48}
                className="text-muted-foreground mb-4"
                strokeWidth={1}
              />
              <p className="text-sm text-muted-foreground font-body">
                {t("cart.empty")}
              </p>
              <Link
                to="/store"
                onClick={() => setIsOpen(false)}
                className="mt-6 text-xs tracking-[0.15em] font-heading text-foreground border border-foreground px-6 py-2 hover:bg-foreground hover:text-primary-foreground transition-all"
              >
                {t("cart.continueShopping")}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-secondary overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={lang === "he" ? item.nameHe : item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-heading tracking-[0.1em] text-foreground truncate">
                      {lang === "he" ? item.nameHe : item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-body mt-1">
                      ₪{item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-body text-foreground w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-muted-foreground hover:text-foreground font-body transition-colors self-start"
                  >
                    {t("cart.remove")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-heading tracking-[0.15em] text-foreground">
                {t("cart.total")}
              </span>
              <span className="text-sm font-heading text-foreground">
                ₪{total.toFixed(2)}
              </span>
            </div>
            <button className="w-full bg-foreground text-primary-foreground py-3 text-xs tracking-[0.2em] font-heading hover:opacity-90 transition-opacity">
              {t("cart.checkout")}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
