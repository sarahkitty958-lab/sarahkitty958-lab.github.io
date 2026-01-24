import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { StoriesSection } from "@/components/StoriesSection";
import { ShopSection } from "@/components/ShopSection";
import { FAQSection } from "@/components/FAQSection";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <StoriesSection />
        <ShopSection />
        <FAQSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
