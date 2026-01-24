import { Header } from "@/components/Header";
import { ShopSection } from "@/components/ShopSection";
import { Footer } from "@/components/Footer";

const Shop = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ShopSection />
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
