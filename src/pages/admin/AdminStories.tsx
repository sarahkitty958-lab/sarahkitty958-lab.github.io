import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Story {
  id: string;
  story_number: number;
  title: string;
  published: boolean;
  created_at: string;
}

export default function AdminStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      toast.error('Access denied');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStories();
    }
  }, [isAdmin]);

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('id, story_number, title, published, created_at')
      .order('story_number', { ascending: true });

    if (!error && data) {
      setStories(data);
    }
    setLoading(false);
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('stories')
      .update({ published: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update story');
    } else {
      toast.success(currentStatus ? 'Story unpublished' : 'Story published! 🎉');
      fetchStories();
    }
  };

  const deleteStory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete story');
    } else {
      toast.success('Story deleted');
      fetchStories();
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-wiggle text-6xl">🔐</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-20">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost">
            <Link to="/stories">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">📝 Manage Stories</h1>
            <p className="text-muted-foreground">Add, edit, and manage your story collection</p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link to="/admin/stories/new">
              <Plus className="w-5 h-5" />
              Add Story
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-wiggle text-6xl">📚</div>
          </div>
        ) : stories.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg mb-4">
                No stories yet. Create your first story!
              </p>
              <Button asChild>
                <Link to="/admin/stories/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Story
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <Card key={story.id}>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-primary">
                      #{story.story_number}
                    </span>
                    <div>
                      <CardTitle className="text-lg">{story.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {story.published ? '✅ Published' : '📝 Draft'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublished(story.id, story.published)}
                      title={story.published ? 'Unpublish' : 'Publish'}
                    >
                      {story.published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/admin/stories/${story.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteStory(story.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
