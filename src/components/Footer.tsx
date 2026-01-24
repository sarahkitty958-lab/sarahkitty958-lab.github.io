import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Footer = () => {
  const { data: content } = useSiteContent("footer");
  
  const c = content?.content as Record<string, string> | undefined;
  const brandName = c?.brand_name ?? "Stuffed Adventures";
  const tagline = c?.tagline ?? "Made with ❤️ for little dreamers";
  const copyright = (c?.copyright ?? "© {year} Stuffed Adventures. All rights reserved.")
    .replace("{year}", new Date().getFullYear().toString());

  return (
    <footer className="bg-muted/50 border-t py-12">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧸</span>
            <span className="font-display text-lg font-bold">{brandName}</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/#stories" className="hover:text-foreground transition-colors">Stories</Link>
            <Link to="/#shop" className="hover:text-foreground transition-colors">Shop</Link>
            <Link to="/#faq" className="hover:text-foreground transition-colors">Q&A</Link>
            <Link to="/#about" className="hover:text-foreground transition-colors">About</Link>
          </nav>
          
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {tagline}
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          {copyright}
        </div>
      </div>
    </footer>
  );
};
