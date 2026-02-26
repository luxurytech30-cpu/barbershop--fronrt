import { Shield, CreditCard, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const TrustBadges = () => {
  const { t } = useLanguage();

  const badges = [
    { icon: Shield, titleKey: "trust.secure.title", descKey: "trust.secure.desc" },
    { icon: CreditCard, titleKey: "trust.checkout.title", descKey: "trust.checkout.desc" },
    { icon: MessageCircle, titleKey: "trust.contact.title", descKey: "trust.contact.desc" },
  ];

  return (
    <section className="border-t border-border py-12 px-6 md:px-16 lg:px-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {badges.map((badge) => (
          <div key={badge.titleKey} className="text-center">
            <badge.icon className="mx-auto mb-3 text-foreground" size={24} strokeWidth={1} />
            <h5 className="text-xs font-heading tracking-[0.15em] text-foreground mb-1">{t(badge.titleKey)}</h5>
            <p className="text-xs text-muted-foreground font-body">{t(badge.descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustBadges;
