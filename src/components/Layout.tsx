import { ReactNode } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <CartSidebar />
      <main className="pt-[42px]">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
