import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";
import { useLanguage } from "@/context/LanguageContext";

const NewsSection = () => {
  const { t } = useLanguage();

  const articles = [
    { titleKey: "news.article1.title", excerptKey: "news.article1.excerpt", image: news1 },
    { titleKey: "news.article2.title", excerptKey: "news.article2.excerpt", image: news2 },
    { titleKey: "news.article3.title", excerptKey: "news.article3.excerpt", image: news3 },
  ];

  return (
    <section id="news" className="py-16 md:py-24 px-6 md:px-16 lg:px-24">
      <h2 className="text-2xl md:text-3xl font-heading text-foreground mb-12 tracking-[0.15em]">
        {t("news.title")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((article) => (
          <a key={article.titleKey} href="#" className="group">
            <div className="aspect-[4/3] overflow-hidden mb-4">
              <img src={article.image} alt={t(article.titleKey)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <h3 className="text-sm font-heading tracking-[0.1em] text-foreground mb-2 group-hover:opacity-80 transition-opacity">
              {t(article.titleKey)}
            </h3>
            <p className="text-xs text-muted-foreground font-body leading-relaxed mb-3">
              {t(article.excerptKey)}
            </p>
            <span className="text-xs text-foreground font-body hover:opacity-70 transition-opacity">
              {t("news.readMore")}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default NewsSection;
