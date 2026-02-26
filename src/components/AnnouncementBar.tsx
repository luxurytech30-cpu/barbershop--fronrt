import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

const AnnouncementBar = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-foreground text-primary-foreground py-2.5 text-center fixed top-0 left-0 right-0 z-[51]">
      <p className="text-xs tracking-[0.2em] font-heading">
        {t("announcement.text")}&nbsp;&nbsp;|&nbsp;&nbsp;
        <Link to="/book" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
          {t("announcement.cta")}
        </Link>
      </p>
    </div>
  );
};

export default AnnouncementBar;
