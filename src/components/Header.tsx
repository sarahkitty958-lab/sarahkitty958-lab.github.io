import { Link } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { Book, ShoppingBag, HelpCircle, Info } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl animate-wiggle">🧸</span>
          <span className="font-display text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Stuffed Adventures
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/#stories" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
            <Book className="w-4 h-4" />
            Stories
          </Link>
          <Link to="/#shop" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
            <ShoppingBag className="w-4 h-4" />
            Shop
          </Link>
          <Link to="/#faq" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
            <HelpCircle className="w-4 h-4" />
            Q&A
          </Link>
          <Link to="/#about" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
            <Info className="w-4 h-4" />
            About
          </Link>
        </nav>

        <CartDrawer />
      </div>
    </header>
  );
};
