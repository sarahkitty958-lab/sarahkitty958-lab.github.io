import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import AdminStories from "./pages/admin/AdminStories";
import StoryEditor from "./pages/admin/StoryEditor";
import AdminKits from "./pages/admin/AdminKits";
import KitEditor from "./pages/admin/KitEditor";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminUsers from "./pages/admin/AdminUsers";
import Shop from "./pages/Shop";
import FAQ from "./pages/FAQ";
import About from "./pages/About";

const queryClient = new QueryClient();

function AppContent() {
  useCartSync();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/product/:handle" element={<ProductDetail />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:id" element={<StoryDetail />} />
        <Route path="/admin/stories" element={<AdminStories />} />
        <Route path="/admin/stories/new" element={<StoryEditor />} />
        <Route path="/admin/stories/:id/edit" element={<StoryEditor />} />
        <Route path="/admin/kits" element={<AdminKits />} />
        <Route path="/admin/kits/new" element={<KitEditor />} />
        <Route path="/admin/kits/:id/edit" element={<KitEditor />} />
        <Route path="/admin/questions" element={<AdminQuestions />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
