import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Sparkles } from 'lucide-react';

interface CharacterAvatar {
  id: string;
  name: string;
  image_url: string;
  created_at: string;
}

export default function AdminAvatars() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatars, setAvatars] = useState<CharacterAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/');
        return;
      }
      fetchAvatars();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchAvatars = async () => {
    const { data, error } = await supabase
      .from('character_avatars')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching avatars:', error);
    } else {
      setAvatars(data || []);
    }
    setLoading(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    
    if (!newName.trim()) {
      toast.error('Please enter a character name first! 🏷️');
      return;
    }
    
    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `characters/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file);
    
    if (uploadError) {
      toast.error('Failed to upload image 😢');
      setUploading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);
    
    const { error: insertError } = await supabase
      .from('character_avatars')
      .insert({
        name: newName.trim(),
        image_url: publicUrl,
        created_by: user.id
      });
    
    if (insertError) {
      toast.error('Failed to save character 😢');
    } else {
      toast.success(`${newName} added! 🎉`);
      setNewName('');
      fetchAvatars();
    }
    
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (avatar: CharacterAvatar) => {
    if (!confirm(`Delete ${avatar.name}? 😢`)) return;
    
    const { error } = await supabase
      .from('character_avatars')
      .delete()
      .eq('id', avatar.id);
    
    if (error) {
      toast.error('Failed to delete character');
    } else {
      toast.success(`${avatar.name} removed`);
      fetchAvatars();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-bounce">🎨</span>
          <p className="mt-2 text-muted-foreground">Loading characters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Character Avatars 🎨</h1>
          <p className="text-muted-foreground">Add fun characters for users to use as profile pictures!</p>
        </div>
        
        {/* Add New Character */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Character
            </CardTitle>
            <CardDescription>Upload a cute character for users to choose!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="characterName">Character Name</Label>
                <Input
                  id="characterName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Lucky the Bear"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !newName.trim()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Character Grid */}
        {avatars.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No characters yet! Add your first one above 🎭</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {avatars.map((avatar) => (
              <Card key={avatar.id} className="group relative overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm text-center truncate">{avatar.name}</p>
                </CardContent>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(avatar)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
