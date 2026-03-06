import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "he" | "en";

type Translations = {
  [key: string]: { he: string; en: string };
};

const translations: Translations = {
  // Announcement
  "announcement.text": {
    he: "להזמנת תור באחד הסלונים שלנו",
    en: "TO BOOK A HAIRCUT AT ONE OF OUR SALONS",
  },
  "announcement.cta": { he: "לחצו כאן", en: "CLICK HERE" },

  // Nav
  "nav.about": { he: "אודות", en: "ABOUT" },
  "nav.services": { he: "שירותים", en: "SERVICES" },
  "nav.shop": { he: "חנות", en: "SHOP" },
  "nav.academy": { he: "אקדמיה", en: "ACADEMY" },
  "nav.contact": { he: "צור קשר", en: "CONTACT" },
  "nav.book": { he: "הזמן תור", en: "BOOK NOW" },

  // Hero
  "hero.title": {
    he: "טיפוח גברי עטור פרסים",
    en: "Award Winning Male Grooming",
  },
  "hero.subtitle": {
    he: "המעבר המהפכני בין ספרות מדויקת לעיצוב שיער עכשווי.",
    en: "The revolutionary transition between precision barbering and contemporary hairdressing.",
  },
  "hero.cta": { he: "למידע נוסף", en: "LEARN MORE" },

  // Booking
  "booking.title": { he: "הזמנת תור", en: "BOOK AN APPOINTMENT" },
  "booking.desc": {
    he: "אנו גאים להציע שירות באיכות גבוהה וזה מתחיל בהזמנת תורים. המערכת המקוונת שלנו מאפשרת לכם לבחור ספר וזמן נוחים, ואם אינכם יכולים להגיע תוכלו לשנות את התור עד 24 שעות לפני.",
    en: "We pride ourselves in offering a high quality of service and that begins with appointment based bookings. Our online system allows you to pick a stylist and time that's convenient for you, and if you can't make it you can reschedule within 24 hours of your appointment.",
  },
  "booking.cta": { he: "הזמן עכשיו", en: "BOOK NOW" },
  "book.dateTime": { he: "תאריך ושעה", en: "Date & Time" },
  "common.back": { he: "חזרה", en: "Back" },
  "common.loading": { he: "טוען...", en: "Loading..." },
  // Categories
  "cat.book": { he: "הזמן תור", en: "BOOK AN APPOINTMENT FOR HAIRCUT" },
  "cat.book.cta": { he: "הזמן תור לתספורת", en: "Book A Haircut" },
  "cat.academy": { he: "קורסים באקדמיה", en: "Academy Courses" },
  "cat.academy.cta": { he: "להרשמה לקורס", en: "BOOK A COURSE" },
  "cat.tools": { he: "כלים", en: "Tools" },
  "cat.tools.cta": { he: "לחנות הכלים", en: "SHOP TOOLS" },

  // Bestsellers
  "bestsellers.title": { he: "המוצרים הנמכרים ביותר", en: "OUR BESTSELLERS" },
  "bestsellers.addToCart": { he: "הוסף לסל", en: "ADD TO CART" },

  // Academy
  "academy.title": { he: "אקדמיה", en: "ACADEMY" },
  "academy.subtitle": {
    he: "חינוך ספרות עטור פרסים",
    en: "Award Winning Barbering Education",
  },
  "academy.soldOut": { he: "אזל", en: "Sold Out" },

  // News
  "news.title": { he: "חדשות", en: "NEWS" },
  "news.readMore": { he: "קרא עוד ←", en: "Read more →" },
  "news.article1.title": {
    he: "פרויקט הקהילה של X-UP",
    en: "X-UP Community Project",
  },
  "news.article1.excerpt": {
    he: "קידום ותיעוד העבודה הקהילתית שלנו ברשתות החברתיות הוביל אותנו לחיבורים מדהימים והשפעה קהילתית...",
    en: "Promoting and capturing our charity work on our social platforms led us to incredible connections and community impact...",
  },
  "news.article2.title": {
    he: "להיות מחנך באקדמיית X-UP",
    en: "Being an Educator at the X-UP Academy",
  },
  "news.article2.excerpt": {
    he: "אני גאה להיות מחנך באקדמיית X-UP. הניסיון שלי בהוראת מתחילים התחיל לפני 6 שנים וזו הייתה מסע מדהים...",
    en: "I'm proud to be an educator at X-UP Academy. My experience teaching beginners started 6 years ago and it has been an incredible journey...",
  },
  "news.article3.title": {
    he: "התחילו קריירה בספרות",
    en: "Start a Career in Barbering",
  },
  "news.article3.excerpt": {
    he: "חשבתם פעם להיות ספר? אולי אתם מכירים מישהו שיכול להיות ספר מעולה...",
    en: "Have you ever considered becoming a Barber? Perhaps you know someone who you think would make a great Barber...",
  },

  // Testimonials
  "testimonial1.quote": {
    he: "אין דבר כזה לא יכול, לא רוצה או לא עושה בפילוסופיית הגזירה שלנו. אומרים שהלקוח תמיד צודק ואנחנו אומרים שהספר ממש מאחוריו, מוכן לספק את הייעוץ המקצועי שלו.",
    en: "There is no such thing as can't do, won't do or don't do within our cutting philosophy. They say the customer is always right & we say the stylist is right behind them, on hand to deliver their expert advice.",
  },
  "testimonial1.name": { he: "אלכס מורגן", en: "Alex Morgan" },
  "testimonial2.quote": {
    he: "התמקדות באיכות ולא בכמות היא נוהל מרכזי כאן ב-X-UP. חשוב לנו מאוד שהאיכות בכל החברה תישאר עקבית ככל שאנחנו ממשיכים לצמוח.",
    en: "Focussing on quality over quantity is a major procedure here at X-UP. It is very important to us that the quality throughout the company remains consistent as we continue to grow.",
  },
  "testimonial2.name": { he: "ג'יימס קרטר", en: "James Carter" },
  "testimonial.role": { he: "שותף מייסד", en: "Co-Founder" },

  // Trust
  "trust.secure.title": { he: "עסקאות מאובטחות", en: "Secure transactions" },
  "trust.secure.desc": {
    he: "העסקאות מטופלות באבטחה ברמה בנקאית",
    en: "Transactions are handled with bank-grade security",
  },
  "trust.checkout.title": { he: "תשלום פשוט", en: "Simple checkout" },
  "trust.checkout.desc": {
    he: "התשלום המאובטח שלנו מהיר וקל לשימוש.",
    en: "Our secure checkout is quick and easy to use.",
  },
  "trust.contact.title": { he: "צרו קשר", en: "Get in touch" },
  "trust.contact.desc": {
    he: "יש שאלות? צרו איתנו קשר בכל עת.",
    en: "Have questions? Get in touch with us at any time.",
  },

  // Footer
  "footer.desc": {
    he: "סלונים ואקדמיה לשיער | טיפוח גברי וחינוך שיער",
    en: "Salons & Hair Academy | Male Grooming & Hair Education",
  },
  "footer.shop": { he: "חנות", en: "SHOP" },
  "footer.haircare": { he: "טיפוח שיער", en: "Hair Care" },
  "footer.tools": { he: "כלים", en: "Tools" },
  "footer.accessories": { he: "אביזרים", en: "Accessories" },
  "footer.company": { he: "חברה", en: "COMPANY" },
  "footer.aboutUs": { he: "אודותינו", en: "About Us" },
  "footer.academy": { he: "אקדמיה", en: "Academy" },
  "footer.careers": { he: "קריירות", en: "Careers" },
  "footer.connect": { he: "התחברו", en: "CONNECT" },
  "footer.rights": {
    he: "© 2026 X-UP. כל הזכויות שמורות.",
    en: "© 2026 X-UP. All rights reserved.",
  },

  // Cart
  "cart.title": { he: "סל הקניות", en: "YOUR CART" },
  "cart.empty": { he: "הסל שלך ריק", en: "Your cart is empty" },
  "cart.total": { he: "סה״כ", en: "TOTAL" },
  "cart.checkout": { he: "לתשלום", en: "CHECKOUT" },
  "cart.continueShopping": { he: "המשך קניות", en: "Continue Shopping" },
  "cart.remove": { he: "הסר", en: "Remove" },

  // About page
  "about.title": { he: "אודותינו", en: "ABOUT US" },
  "about.story.title": { he: "הסיפור שלנו", en: "OUR STORY" },
  "about.story.p1": {
    he: "X-UP הוקמה מתוך תשוקה לטיפוח גברי ורצון לשנות את הדרך שבה גברים חווים את הספרות. אנחנו מאמינים שכל גבר ראוי לחוויה יוצאת דופן.",
    en: "X-UP was founded from a passion for male grooming and a desire to change the way men experience barbering. We believe every man deserves an exceptional experience.",
  },
  "about.story.p2": {
    he: "השילוב הייחודי שלנו של ספרות מדויקת ועיצוב שיער עכשווי יצר תנועה שמשנה את התעשייה. הצוות שלנו מורכב מהספרים הטובים ביותר, כל אחד מומחה בתחומו.",
    en: "Our unique blend of precision barbering and contemporary hairdressing has created a movement that is changing the industry. Our team is made up of the best barbers, each an expert in their field.",
  },
  "about.mission.title": { he: "המשימה שלנו", en: "OUR MISSION" },
  "about.mission.desc": {
    he: "להעצים גברים להרגיש הכי טוב שאפשר דרך שירותי טיפוח יוצאי דופן, חינוך, ומוצרים באיכות הגבוהה ביותר.",
    en: "To empower men to feel their best through exceptional grooming services, education, and the highest quality products.",
  },
  "about.values.title": { he: "הערכים שלנו", en: "OUR VALUES" },
  "about.value1.title": { he: "מצוינות", en: "EXCELLENCE" },
  "about.value1.desc": {
    he: "אנחנו שואפים למצוינות בכל מה שאנחנו עושים",
    en: "We strive for excellence in everything we do",
  },
  "about.value2.title": { he: "חדשנות", en: "INNOVATION" },
  "about.value2.desc": {
    he: "אנחנו תמיד בחזית הטרנדים והטכניקות",
    en: "We are always at the forefront of trends and techniques",
  },
  "about.value3.title": { he: "קהילה", en: "COMMUNITY" },
  "about.value3.desc": {
    he: "אנחנו בונים קהילה חזקה של ספרים ולקוחות",
    en: "We build a strong community of barbers and clients",
  },

  // Contact page
  "contact.title": { he: "צור קשר", en: "CONTACT US" },
  "contact.subtitle": {
    he: "נשמח לשמוע ממכם",
    en: "We'd love to hear from you",
  },
  "contact.name": { he: "שם מלא", en: "Full Name" },
  "contact.email": { he: "אימייל", en: "Email" },
  "contact.phone": { he: "טלפון", en: "Phone" },
  "contact.message": { he: "הודעה", en: "Message" },
  "contact.send": { he: "שלח הודעה", en: "SEND MESSAGE" },
  "contact.info.title": { he: "פרטי התקשרות", en: "CONTACT INFO" },
  "contact.address": { he: "יפעת", en: "yafaat" },
  "contact.emailAddr": { he: "info@x-up.com", en: "info@x-up.com" },
  "contact.phoneNum": { he: "+972-5-555-5555", en: "+972-5-555-5555" },
  "contact.hours": { he: "שעות פעילות", en: "OPENING HOURS" },
  "contact.hours.weekdays": {
    he: "ראשון - חמישי: 09:00 - 20:00",
    en: "Sun - Thu: 09:00 - 20:00",
  },
  "contact.hours.friday": {
    he: "שישי: 09:00 - 14:00",
    en: "Fri: 09:00 - 14:00",
  },
  "contact.hours.saturday": { he: "שבת: סגור", en: "Sat: Closed" },

  // Book page
  "book.title": { he: "הזמנת תור", en: "BOOK AN APPOINTMENT" },
  "book.subtitle": {
    he: "בחרו את השירות, הספר והזמן המועדפים עליכם",
    en: "Choose your preferred service, barber and time",
  },
  "book.service": { he: "שירות", en: "Service" },
  "book.service.haircut": { he: "תספורת", en: "Haircut" },
  "book.service.beard": { he: "עיצוב זקן", en: "Beard Trim" },
  "book.service.combo": { he: "תספורת + זקן", en: "Haircut + Beard" },
  "book.service.deluxe": { he: "חבילת דלוקס", en: "Deluxe Package" },
  "book.barber": { he: "ספר", en: "Barber" },
  "book.date": { he: "תאריך", en: "Date" },
  "book.time": { he: "שעה", en: "Time" },
  "book.name": { he: "שם מלא", en: "Full Name" },
  "book.phone": { he: "טלפון", en: "Phone" },
  "book.submit": { he: "אישור הזמנה", en: "CONFIRM BOOKING" },
  "book.price": { he: "מחיר", en: "Price" },

  // Academy page
  "academy.page.title": { he: "האקדמיה שלנו", en: "OUR ACADEMY" },
  "academy.page.subtitle": {
    he: "חינוך ספרות ברמה הגבוהה ביותר",
    en: "Barbering education at the highest level",
  },
  "academy.page.desc": {
    he: "האקדמיה של X-UP מציעה קורסים מקיפים לכל הרמות, ממתחילים ועד מקצועיים. הקורסים שלנו מלמדים טכניקות חיתוך מתקדמות, עיצוב שיער עכשווי ועוד.",
    en: "The X-UP Academy offers comprehensive courses for all levels, from beginners to professionals. Our courses teach advanced cutting techniques, contemporary hair styling and more.",
  },
  "academy.why.title": { he: "למה האקדמיה שלנו?", en: "WHY OUR ACADEMY?" },
  "academy.why1": {
    he: "מדריכים עטורי פרסים",
    en: "Award-winning instructors",
  },
  "academy.why2": {
    he: "ניסיון מעשי מהיום הראשון",
    en: "Hands-on experience from day one",
  },
  "academy.why3": {
    he: "ציוד וכלים מקצועיים",
    en: "Professional equipment and tools",
  },
  "academy.why4": {
    he: "תעודה מוכרת בסיום",
    en: "Recognized certification upon completion",
  },
  "academy.courses": { he: "הקורסים שלנו", en: "OUR COURSES" },
  "academy.enroll": { he: "הרשמה", en: "ENROLL" },

  // Store page
  "store.title": { he: "החנות", en: "THE STORE" },
  "store.subtitle": {
    he: "מוצרים וכלים מקצועיים",
    en: "Professional products & tools",
  },
  "store.all": { he: "הכל", en: "All" },
  "store.haircare": { he: "טיפוח", en: "Hair Care" },
  "store.tools": { he: "כלים", en: "Tools" },
  "store.accessories": { he: "אביזרים", en: "Accessories" },
  "store.addToCart": { he: "הוסף לסל", en: "ADD TO CART" },
  "store.search": { he: "חיפוש מוצר...", en: "Search products..." },
  "store.results": { he: "תוצאות", en: "Results" },
  "store.noResults": { he: "לא נמצאו מוצרים.", en: "No products found." },
  "common.clear": { he: "נקה", en: "Clear" },
  // Product page
  "product.addToCart": { he: "הוסף לסל", en: "ADD TO CART" },
  "product.description": { he: "תיאור", en: "DESCRIPTION" },
  "product.details": { he: "פרטים", en: "DETAILS" },
  "product.related": { he: "מוצרים נוספים", en: "RELATED PRODUCTS" },
  "product.quantity": { he: "כמות", en: "Quantity" },
  "product.back": { he: "חזרה לחנות", en: "Back to Store" },

  // Stock / inventory
  "product.outOfStock": { he: "אזל מהמלאי", en: "OUT OF STOCK" },
  "product.lowStock": { he: "מלאי נמוך", en: "LOW STOCK" },
  "product.lowStockShort": { he: "מעט במלאי", en: "LOW STOCK" },
  "product.inStock": { he: "במלאי", en: "In stock" },
  "product.max": { he: "מקסימום", en: "Max" },

  // Product info
  "product.category": { he: "קטגוריה", en: "Category" },

  // Common
  "common.loading": { he: "טוען...", en: "Loading..." },

  // Language
  "lang.switch": { he: "EN", en: "עב" },
};

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("he");

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      <div dir={dir} className={lang === "he" ? "font-body" : ""}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
