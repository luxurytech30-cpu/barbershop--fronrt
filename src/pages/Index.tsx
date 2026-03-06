import Layout from "@/components/Layout";
import HeroSection from "@/components/HeroSection";
import BookingSection from "@/components/BookingSection";
import CategoryGrid from "@/components/CategoryGrid";
import BestsellersSection from "@/components/BestsellersSection";
import AcademySection from "@/components/AcademySection";
import NewsSection from "@/components/NewsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import TrustBadges from "@/components/TrustBadges";
import AdminPage from "./AdminPage";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <BookingSection />
      <CategoryGrid />
      <BestsellersSection />
      <AcademySection />
      {/* <NewsSection /> */}
      <TestimonialsSection />
      <TrustBadges />
    </Layout>
  );
};

export default Index;
