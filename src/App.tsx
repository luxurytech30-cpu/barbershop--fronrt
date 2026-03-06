import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BookPage from "./pages/BookPage";
import AcademyPage from "./pages/AcademyPage";
import StorePage from "./pages/StorePage";
import ProductPage from "./pages/ProductPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import AdminBarberSchedulePage from "./pages/AdminBarberSchedulePage";
import ScrollToTop from "@/components/ScrollToTop";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/book" element={<BookPage />} />
              <Route path="/academy" element={<AcademyPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route
                path="/admin/barbers/:id/schedule"
                element={<AdminBarberSchedulePage />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
