import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User, ArrowRightFromLine } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import AuthModal from "@/components/auth/AuthModal";
import logo from "@/assets/logo-white2.png";

type MeUser = {
  username?: string;
  name?: string;
  role?: string;
} | null;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [me, setMe] = useState<MeUser>(null);

  const { t, lang, setLang } = useLanguage();
  const { setIsOpen: setCartOpen, itemCount } = useCart();
  const location = useLocation();

  const isLogged = !!me?.username;
  const isAdmin = me?.role === "admin";

  const displayName = (me?.username || me?.name || "").trim();
  const mobileName = displayName.split(" ")[0]?.slice(0, 16) || ""; // allow longer since it's on its own row

  // Scroll shadow/background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock background scroll when menu open (mobile)
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  async function refreshMe() {
    try {
      const r = await api.get("/api/auth/me");
      setMe(r.data.user || null);
    } catch {
      setMe(null);
    }
  }

  useEffect(() => {
    refreshMe();
  }, []);

  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setMe(null);
      setIsOpen(false);
    }
  }

  const navLinks = [
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.booked"), href: "/my-appointment" },
    { label: t("nav.shop"), href: "/store" },
    { label: t("nav.academy"), href: "/academy" },
    { label: t("nav.book"), href: "/book" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  return (
    <>
      <header
        className={[
          "fixed left-0 right-0 top-[35px] z-[99] isolate",
          "transition-all duration-300",
          scrolled
            ? "bg-black/80 backdrop-blur-md shadow-2xl"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="px-4 sm:px-6 md:px-12 py-3">
          {/* ROW 1 */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            {/* LEFT */}
            <div className="flex items-center justify-start gap-2">
              {/* Auth icon only (login OR logout) */}
              {isLogged ? (
                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center border border-white/30 px-2 py-1 text-white hover:opacity-80"
                  aria-label="Logout"
                  title={lang === "he" ? "התנתק" : "Logout"}
                  type="button"
                >
                  <ArrowRightFromLine size={18} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthOpen(true);
                    setIsOpen(false);
                  }}
                  className="inline-flex items-center justify-center border border-white/30 px-2 py-1 text-white hover:opacity-80"
                  aria-label="Login"
                  title={lang === "he" ? "התחבר" : "Login"}
                  type="button"
                >
                  <User size={18} />
                </button>
              )}

              {/* Language button */}
              <button
                onClick={() => setLang(lang === "he" ? "en" : "he")}
                className="border border-white/30 px-2 py-1 text-white text-xs font-heading tracking-wider hover:opacity-80"
                aria-label="Language"
                type="button"
              >
                {t("lang.switch")}
              </button>

              {/* Cart icon */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-white hover:opacity-80"
                aria-label="Cart"
                title="Cart"
                type="button"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -end-1.5 bg-white text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* CENTER LOGO */}
            <div className="flex justify-center">
              <Link to="/" className="inline-flex items-center">
                <img
                  src={logo}
                  alt="X-UP logo"
                  className="h-10 w-auto sm:h-12 md:h-16"
                  draggable={false}
                />
              </Link>
            </div>

            {/* RIGHT */}
            <div className="flex items-center justify-end gap-2">
              {/* Desktop links */}
              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-white text-xs tracking-[0.15em] font-heading hover:opacity-70 transition-opacity"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-white text-xs tracking-[0.15em] font-heading hover:opacity-70 transition-opacity border border-white/30 px-2 py-1"
                  >
                    ADMIN
                  </Link>
                )}
              </nav>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen((v) => !v)}
                className="md:hidden text-white hover:opacity-80"
                aria-label="Toggle menu"
                type="button"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* ROW 2 (MOBILE ONLY): Hello + name */}
          {isLogged && (
            <div className="mt-2 md:hidden">
              <div className="text-white/90 text-xs tracking-wide">
                {lang === "he" ? "שלום" : "Hello"}{" "}
                <span className="font-semibold text-white">{mobileName}</span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-full flex flex-col items-center justify-center gap-8 py-16 px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-white text-2xl tracking-[0.2em] font-heading hover:opacity-70 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="text-white text-2xl tracking-[0.2em] font-heading hover:opacity-70 transition-opacity"
                >
                  ADMIN
                </Link>
              )}

              <Link
                to="/book"
                onClick={() => setIsOpen(false)}
                className="text-white text-2xl tracking-[0.2em] font-heading hover:opacity-70 transition-opacity"
              >
                {t("nav.book")}
              </Link>
              {/* Auth inside menu */}
              {isLogged ? (
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 border border-white/30 px-3 py-2 text-white hover:opacity-80"
                  aria-label="Logout"
                  type="button"
                >
                  <ArrowRightFromLine size={18} />
                  <span className="text-sm">
                    {lang === "he" ? "התנתק" : "Logout"}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthOpen(true);
                    setIsOpen(false);
                  }}
                  className="inline-flex items-center gap-2 border border-white/30 px-3 py-2 text-white hover:opacity-80"
                  aria-label="Login"
                  type="button"
                >
                  <User size={18} />
                  <span className="text-sm">
                    {lang === "he" ? "התחבר" : "Login"}
                  </span>
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 text-sm underline underline-offset-4 hover:text-white"
                type="button"
              >
                {lang === "he" ? "סגור" : "Close"}
              </button>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(user: any) => setMe(user)}
        lang={lang}
        brand="X-UP MEN SALON"
      />
    </>
  );
}
