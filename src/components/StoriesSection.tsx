import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

// Placeholder stories - will be replaced with actual content
const placeholderStories = [
  {
    id: "1",
    title: "Coming Soon",
    excerpt: "A new adventure awaits! Stay tuned for heartwarming stories featuring your favorite stuffed friends.",
    emoji: "🧸",
    color: "from-primary/20 to-secondary/20"
  },
  {
    id: "2", 
    title: "Coming Soon",
    excerpt: "More magical tales are on their way. Each story brings a new journey of friendship and wonder.",
    emoji: "🐰",
    color: "from-secondary/20 to-accent/20"
  },
  {
    id: "3",
    title: "Coming Soon",
    excerpt: "The adventure continues with lovable characters and life lessons wrapped in cozy storytelling.",
    emoji: "🦊",
    color: "from-accent/20 to-primary/20"
  }
];

export const StoriesSection = () => {
  const { data: content } = useSiteContent("stories_section");
  
  const c = content?.content as Record<string, string> | undefined;
  const emoji = c?.emoji ?? "📖";
  const title = c?.title ?? "Our Stories";
  const description = c?.description ?? "Dive into magical worlds where stuffed animals come alive with friendship, courage, and adventure.";

  return (
    <section id="stories" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <span className="text-5xl mb-4 block">{emoji}</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderStories.map((story) => (
            <Card 
              key={story.id} 
              className={`group cursor-pointer hover:shadow-float transition-all duration-300 border-2 border-transparent hover:border-primary/30 bg-gradient-to-br ${story.color}`}
            >
              <CardHeader>
                <div className="text-5xl mb-4 group-hover:animate-wiggle transition-transform">
                  {story.emoji}
                </div>
                <CardTitle className="font-display text-xl">{story.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{story.excerpt}</p>
                <Button 
                  variant="ghost" 
                  className="w-full group-hover:bg-primary/10"
                  disabled
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-muted-foreground italic">
            ✨ Share your stories in the chat to see them here!
          </p>
        </div>
      </div>
    </section>
  );
};
