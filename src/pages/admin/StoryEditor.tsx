import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Image, Video, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface StoryMedia {
  id?: string;
  media_type: 'image' | 'video';
  url: string;
  caption: string;
  position: number;
  file?: File;
}

export default function StoryEditor() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isNew = location.pathname.endsWith('/new') || id === 'new';
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [published, setPublished] = useState(false);
  const [media, setMedia] = useState<StoryMedia[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    // Only redirect if auth is fully loaded AND user is not admin
    if (!authLoading && !isAdmin && user !== undefined) {
      console.log('Access denied - not admin', { authLoading, isAdmin, user: user?.id });
      navigate('/');
      toast.error('Access denied');
    }
  }, [isAdmin, authLoading, navigate, user]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    if (!isNew && id && !authLoading && isAdmin) {
      setLoading(true);
      fetchStory();
    }
  }, [id, isNew, isAdmin, authLoading]);

  const fetchStory = async () => {
    if (!id) {
      toast.error('Story not found');
      navigate('/admin/stories');
      setLoading(false);
      return;
    }

    const { data: storyData, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !storyData) {
      toast.error('Story not found');
      navigate('/admin/stories');
      return;
    }

    setTitle(storyData.title);
    setContent(storyData.content);
    setCoverImageUrl(storyData.cover_image_url || '');
    setPublished(storyData.published);

    const { data: mediaData } = await supabase
      .from('story_media')
      .select('*')
      .eq('story_id', id)
      .order('position', { ascending: true });

    if (mediaData) {
      setMedia(mediaData.map(m => ({
        id: m.id,
        media_type: m.media_type as 'image' | 'video',
        url: m.url,
        caption: m.caption || '',
        position: m.position
      })));
    }

    setLoading(false);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `stories/${fileName}`;

    const { error } = await supabase.storage
      .from('story-media')
      .upload(filePath, file);

    if (error) {
      toast.error('Failed to upload file');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('story-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'media') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    const url = await uploadFile(file);
    
    if (url) {
      if (type === 'cover') {
        setCoverImageUrl(url);
      } else {
        const isVideo = file.type.startsWith('video/');
        setMedia([...media, {
          media_type: isVideo ? 'video' : 'image',
          url,
          caption: '',
          position: media.length
        }]);
      }
      toast.success('File uploaded! 📸');
    }
    
    setUploadingMedia(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const updateMediaCaption = (index: number, caption: string) => {
    const updated = [...media];
    updated[index].caption = caption;
    setMedia(updated);
  };

  const insertMediaMarker = (index: number) => {
    const marker = `[media:${index}]`;
    setContent(content + `\n\n${marker}\n\n`);
    toast.success('Media marker added to content');
  };

  const handleSave = async () => {
    console.log('handleSave called', { title, content, user: user?.id });
    
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);

    try {
      let storyId = id;

      if (isNew) {
        console.log('Creating new story...');
        const { data, error } = await supabase
          .from('stories')
          .insert({
            title: title.trim(),
            content: content.trim(),
            cover_image_url: coverImageUrl || null,
            published,
            created_by: user?.id
          })
          .select('id')
          .single();

        console.log('Insert result:', { data, error });
        if (error) throw error;
        storyId = data.id;
      } else {
        const { error } = await supabase
          .from('stories')
          .update({
            title: title.trim(),
            content: content.trim(),
            cover_image_url: coverImageUrl || null,
            published
          })
          .eq('id', id);

        if (error) throw error;

        // Delete existing media
        await supabase
          .from('story_media')
          .delete()
          .eq('story_id', id);
      }

      // Insert media
      if (media.length > 0 && storyId) {
        const mediaToInsert = media.map((m, index) => ({
          story_id: storyId,
          media_type: m.media_type,
          url: m.url,
          caption: m.caption || null,
          position: index
        }));

        const { error } = await supabase
          .from('story_media')
          .insert(mediaToInsert);

        if (error) throw error;
      }

      toast.success(isNew ? 'Story created! 🎉' : 'Story saved! ✅');
      navigate('/admin/stories');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save story');
    }

    setSaving(false);
  };

  // Show loading only while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-bounce text-6xl">📝</div>
      </div>
    );
  }

  // If not admin after auth loaded, the useEffect will redirect
  if (!isAdmin) {
    return null;
  }

  // Show loading while fetching existing story data
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-bounce text-6xl">📖</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-20">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="ghost">
            <Link to="/admin/stories">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="font-display text-3xl font-bold">
            {isNew ? '✨ New Story' : '✏️ Edit Story'}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Story Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter story title..."
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Story Content</Label>
              <p className="text-sm text-muted-foreground">
                Use [media:0], [media:1], etc. to insert images/videos
              </p>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your story here..."
                className="min-h-[400px] font-mono"
              />
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published">Published</Label>
                  <Switch
                    id="published"
                    checked={published}
                    onCheckedChange={setPublished}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  {coverImageUrl ? (
                    <div className="relative">
                      <img 
                        src={coverImageUrl} 
                        alt="Cover" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setCoverImageUrl('')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="cover-upload"
                        onChange={(e) => handleFileSelect(e, 'cover')}
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('cover-upload')?.click()}
                        disabled={uploadingMedia}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingMedia ? 'Uploading...' : 'Upload Cover'}
                      </Button>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Story'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'media')}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingMedia ? 'Uploading...' : 'Add Image/Video'}
                </Button>

                {media.length > 0 && (
                  <div className="space-y-3">
                    {media.map((item, index) => (
                      <div key={index} className="border rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-2">
                          {item.media_type === 'image' ? (
                            <Image className="w-4 h-4" />
                          ) : (
                            <Video className="w-4 h-4" />
                          )}
                          <span className="text-sm font-mono">[media:{index}]</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => insertMediaMarker(index)}
                            className="ml-auto text-xs"
                          >
                            Insert
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMedia(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        {item.media_type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt="" 
                            className="w-full h-20 object-cover rounded"
                          />
                        ) : (
                          <video 
                            src={item.url} 
                            className="w-full h-20 object-cover rounded"
                          />
                        )}
                        <Input
                          placeholder="Caption (optional)"
                          value={item.caption}
                          onChange={(e) => updateMediaCaption(index, e.target.value)}
                          className="mt-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
