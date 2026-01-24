import { Header } from "@/components/Header";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
