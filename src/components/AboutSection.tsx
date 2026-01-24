import { Heart, Sparkles, Users } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <span className="text-5xl mb-4 block">💝</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            About Stuffed Adventures
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Where imagination meets creation, and every stuffed friend has a story to tell.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Made with Love</h3>
            <p className="text-muted-foreground">
              Every story and kit is crafted with care and attention to detail, designed to spark joy and creativity.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Inspiring Creativity</h3>
            <p className="text-muted-foreground">
              Our kits encourage hands-on creativity, helping children (and adults!) bring their favorite characters to life.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Family Bonding</h3>
            <p className="text-muted-foreground">
              Reading together and crafting creates precious memories. These adventures are made to be shared.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-8 md:p-12 border shadow-soft text-center">
          <h3 className="font-display text-2xl font-bold mb-4">Our Mission</h3>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            At Stuffed Adventures, we believe every child deserves magical stories that inspire wonder and 
            creativity. We're on a mission to bring families closer together through storytelling and the 
            joy of making something beautiful with your own hands. Each stuffed friend you create becomes 
            a companion for adventures yet to come.
          </p>
          <div className="mt-8 flex justify-center gap-4 text-4xl">
            <span className="animate-wiggle">🧸</span>
            <span className="animate-bounce-slow">🐰</span>
            <span className="animate-float">🦊</span>
            <span className="animate-wiggle" style={{ animationDelay: '0.5s' }}>🐻</span>
            <span className="animate-bounce-slow" style={{ animationDelay: '0.3s' }}>🐼</span>
          </div>
        </div>
      </div>
    </section>
  );
};
