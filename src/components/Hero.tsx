import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Hero = () => {
  const { data: content } = useSiteContent("hero");
  
  const c = content?.content as Record<string, string> | undefined;
  const badge = c?.badge ?? "Fun Stories & Cooking Kits";
  const titleLine1 = c?.title_line1 ?? "Welcome to";
  const titleLine2 = c?.title_line2 ?? "Stuffed Adventures";
  const description = c?.description ?? "Discover heartwarming tales of cuddly companions and bring their adventures to life with our magical cooking kits!";
  const buttonStories = c?.button_stories ?? "📚 Read Stories";
  const buttonShop = c?.button_shop ?? "🎨 Shop Kits";

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 gradient-hero opacity-30" />
      <div className="absolute top-20 left-10 text-6xl animate-float opacity-60">⭐</div>
      <div className="absolute top-40 right-20 text-5xl animate-bounce-slow opacity-60">🌈</div>
      <div className="absolute bottom-40 left-20 text-4xl animate-wiggle opacity-60">☁️</div>
      <div className="absolute bottom-20 right-10 text-5xl animate-float opacity-60">✨</div>
      
      <div className="container relative z-10 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-secondary-foreground mb-6 animate-bounce-slow">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">{badge}</span>
        </div>
        
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="block">{titleLine1}</span>
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            {titleLine2}
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow hover:shadow-float transition-all duration-300 text-lg px-8"
            onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {buttonStories}
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-accent text-accent-foreground hover:bg-accent/10 text-lg px-8"
            onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {buttonShop}
          </Button>
        </div>
        
        <div className="mt-16 animate-bounce">
          <ArrowDown className="w-6 h-6 mx-auto text-muted-foreground" />
        </div>
      </div>
      
      {/* Floating stuffed animals */}
      <div className="absolute bottom-10 left-1/4 text-7xl animate-float" style={{ animationDelay: '0.5s' }}>🧸</div>
      <div className="absolute bottom-20 right-1/4 text-6xl animate-bounce-slow" style={{ animationDelay: '1s' }}>🐰</div>
    </section>
  );
};
