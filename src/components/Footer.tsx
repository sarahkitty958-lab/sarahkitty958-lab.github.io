import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t py-12">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧸</span>
            <span className="font-display text-lg font-bold">Stuffed Adventures</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/#stories" className="hover:text-foreground transition-colors">Stories</Link>
            <Link to="/#shop" className="hover:text-foreground transition-colors">Shop</Link>
            <Link to="/#faq" className="hover:text-foreground transition-colors">Q&A</Link>
            <Link to="/#about" className="hover:text-foreground transition-colors">About</Link>
          </nav>
          
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-secondary fill-secondary" /> for little dreamers
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Stuffed Adventures. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
