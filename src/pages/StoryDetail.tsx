import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CommentsSection } from '@/components/CommentsSection';

interface Story {
  id: string;
  story_number: number;
  title: string;
  content: string;
  cover_image_url: string | null;
  created_at: string;
}

interface StoryMedia {
  id: string;
  media_type: 'image' | 'video';
  url: string;
  caption: string | null;
  position: number;
}

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [media, setMedia] = useState<StoryMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStory();
    }
  }, [id]);

  const fetchStory = async () => {
    const { data: storyData, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!storyError && storyData) {
      setStory(storyData);

      const { data: mediaData } = await supabase
        .from('story_media')
        .select('*')
        .eq('story_id', id)
        .order('position', { ascending: true });

      if (mediaData) {
        setMedia(mediaData as StoryMedia[]);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-20 flex justify-center">
          <div className="animate-wiggle text-6xl">🧸</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-20 text-center">
          <span className="text-6xl block mb-4">😢</span>
          <h1 className="font-display text-3xl mb-4">Story Not Found</h1>
          <Button asChild>
            <Link to="/stories">Back to Stories</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Parse content for embedded media markers and render
  const renderContent = () => {
    const paragraphs = story.content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a media marker like [media:0] or [media:1]
      const mediaMatch = paragraph.match(/^\[media:(\d+)\]$/);
      if (mediaMatch) {
        const mediaIndex = parseInt(mediaMatch[1]);
        const mediaItem = media[mediaIndex];
        if (mediaItem) {
          return (
            <div key={index} className="my-8">
              {mediaItem.media_type === 'image' ? (
                <img 
                  src={mediaItem.url} 
                  alt={mediaItem.caption || 'Story illustration'}
                  className="w-full max-w-2xl mx-auto rounded-xl shadow-lg"
                />
              ) : (
                <video 
                  src={mediaItem.url} 
                  controls
                  className="w-full max-w-2xl mx-auto rounded-xl shadow-lg"
                />
              )}
              {mediaItem.caption && (
                <p className="text-center text-muted-foreground mt-2 italic">
                  {mediaItem.caption}
                </p>
              )}
            </div>
          );
        }
      }
      
      return (
        <p key={index} className="text-lg leading-relaxed mb-4">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-20">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/stories">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Link>
        </Button>

        <article className="max-w-3xl mx-auto">
          {story.cover_image_url && (
            <img 
              src={story.cover_image_url} 
              alt={story.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8 shadow-float"
            />
          )}

          <header className="text-center mb-12">
            <span className="text-sm text-muted-foreground font-medium">
              Story #{story.story_number}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">
              {story.title}
            </h1>
          </header>

          <div className="prose prose-lg max-w-none">
            {renderContent()}
          </div>
        </article>

        <div className="max-w-3xl mx-auto mt-16">
          <CommentsSection storyId={story.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
