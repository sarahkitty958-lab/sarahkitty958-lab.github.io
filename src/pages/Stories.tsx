import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Story {
  id: string;
  story_number: number;
  title: string;
  cover_image_url: string | null;
  created_at: string;
}

const storyEmojis = ['🧸', '🐰', '🦊', '🐻', '🦁', '🐨', '🐼', '🐷', '🐸', '🦋'];
const storyColors = [
  'from-primary/20 to-secondary/20',
  'from-secondary/20 to-accent/20',
  'from-accent/20 to-primary/20',
  'from-pink-200/50 to-purple-200/50',
  'from-yellow-200/50 to-orange-200/50',
  'from-green-200/50 to-teal-200/50',
];

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('id, story_number, title, cover_image_url, created_at')
      .eq('published', true)
      .order('story_number', { ascending: true });

    if (!error && data) {
      setStories(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-20">
        <div className="text-center mb-12">
          <span className="text-5xl mb-4 block">📖</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our Stories
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Dive into magical worlds where stuffed animals come alive with friendship, courage, and adventure.
          </p>
        </div>

        {isAdmin && (
          <div className="flex justify-center mb-8">
            <Button asChild size="lg" className="gap-2">
              <Link to="/admin/stories">
                <Plus className="w-5 h-5" />
                Manage Stories
              </Link>
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-wiggle text-6xl">🧸</div>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              ✨ Stories are coming soon! Check back later for magical adventures.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, index) => (
              <Link key={story.id} to={`/stories/${story.id}`}>
                <Card 
                  className={`group cursor-pointer hover:shadow-float transition-all duration-300 border-2 border-transparent hover:border-primary/30 bg-gradient-to-br ${storyColors[index % storyColors.length]} h-full`}
                >
                  <CardHeader>
                    {story.cover_image_url ? (
                      <img 
                        src={story.cover_image_url} 
                        alt={story.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    ) : (
                      <div className="text-5xl mb-4 group-hover:animate-wiggle transition-transform text-center">
                        {storyEmojis[index % storyEmojis.length]}
                      </div>
                    )}
                    <CardTitle className="font-display text-xl">
                      Story #{story.story_number}: {story.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="ghost" 
                      className="w-full group-hover:bg-primary/10"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read Story
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
