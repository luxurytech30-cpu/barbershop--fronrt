import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border py-12 px-6 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-lg font-heading font-bold tracking-[0.15em] text-foreground mb-4">X-UP</h4>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">{t("footer.desc")}</p>
          </div>
          <div>
            <h5 className="text-xs font-heading tracking-[0.15em] text-foreground mb-4">{t("footer.shop")}</h5>
            <ul className="space-y-2">
              <li><Link to="/store" className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">{t("footer.haircare")}</Link></li>
              <li><Link to="/store" className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">{t("footer.tools")}</Link></li>
              <li><Link to="/store" className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">{t("footer.accessories")}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-heading tracking-[0.15em] text-foreground mb-4">{t("footer.company")}</h5>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/academy" className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">{t("footer.academy")}</Link></li>
              <li><Link to="/contact" className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">{t("footer.careers")}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-heading tracking-[0.15em] text-foreground mb-4">{t("footer.connect")}</h5>
            <ul className="space-y-2">
              <li><a href="#" className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">Instagram</a></li>
              <li><a href="#" className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">Facebook</a></li>
              <li><a href="#" className="text-xs text-muted-foreground font-body hover:text-foreground transition-colors">TikTok</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground font-body">{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
