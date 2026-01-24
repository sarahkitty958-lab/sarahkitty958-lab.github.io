import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, ImagePlus, X, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchAdminProductById, 
  createAdminProduct, 
  updateAdminProduct 
} from '@/lib/shopify-admin';

export default function KitEditor() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [productType, setProductType] = useState('Cooking Kit');
  const [tags, setTags] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [animalName, setAnimalName] = useState('');
  const [storyName, setStoryName] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      toast.error('Admin access required');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isEditing && id) {
      loadProduct(id);
    }
  }, [id, isEditing]);

  const loadProduct = async (productId: string) => {
    setLoading(true);
    try {
      const product = await fetchAdminProductById(productId);
      if (product) {
        setTitle(product.title);
        setDescription(product.description || '');
        setPrice(product.variants[0]?.price || '');
        setImages(product.images.map(img => img.src));
        setProductType(product.productType || 'Cooking Kit');
        
        // Parse tags to extract custom fields
        const tagList = product.tags || [];
        const difficultyTag = tagList.find(t => t.startsWith('difficulty:'));
        const animalTag = tagList.find(t => t.startsWith('animal:'));
        const storyTag = tagList.find(t => t.startsWith('story:'));
        
        if (difficultyTag) setDifficulty(difficultyTag.replace('difficulty:', ''));
        if (animalTag) setAnimalName(animalTag.replace('animal:', ''));
        if (storyTag) setStoryName(storyTag.replace('story:', ''));
        
        // Set remaining tags
        const otherTags = tagList.filter(t => 
          !t.startsWith('difficulty:') && 
          !t.startsWith('animal:') && 
          !t.startsWith('story:')
        );
        setTags(otherTags.join(', '));
      }
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/admin/kits');
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('kit-images')
          .upload(fileName, file);

        if (error) {
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('kit-images')
          .getPublicUrl(fileName);

        setImages(prev => [...prev, urlData.publicUrl]);
        toast.success(`Uploaded ${file.name}`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);

    // Build tags including custom fields
    const allTags = [];
    if (tags.trim()) {
      allTags.push(...tags.split(',').map(t => t.trim()));
    }
    if (difficulty) allTags.push(`difficulty:${difficulty}`);
    if (animalName.trim()) allTags.push(`animal:${animalName.trim()}`);
    if (storyName.trim()) allTags.push(`story:${storyName.trim()}`);

    const productData = {
      title: title.trim(),
      body: description.trim(),
      product_type: productType,
      tags: allTags.join(', '),
      variants: [{ price }],
      images: images.map(src => ({ file_path: src }))
    };

    try {
      if (isEditing && id) {
        const success = await updateAdminProduct(id, productData);
        if (success) {
          toast.success('Kit updated successfully! 🎉');
          navigate('/admin/kits');
        } else {
          toast.error('Failed to update kit');
        }
      } else {
        const success = await createAdminProduct(productData);
        if (success) {
          toast.success('Kit created successfully! 🎉');
          navigate('/admin/kits');
        } else {
          toast.error('Failed to create kit');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }

    setSaving(false);
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/kits">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold">
              {isEditing ? 'Edit Cooking Kit' : 'Add New Cooking Kit'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update your cooking kit details' : 'Create a new cooking kit for your store'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Kit Name *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Lucky's Mac and Cheese Parfait"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="animalName">Animal Character</Label>
                  <Input
                    id="animalName"
                    value={animalName}
                    onChange={(e) => setAnimalName(e.target.value)}
                    placeholder="e.g., Lucky (Cat)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">🟢 Easy</SelectItem>
                      <SelectItem value="Medium">🟡 Medium</SelectItem>
                      <SelectItem value="Hard">🔴 Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storyName">Related Story</Label>
                <Input
                  id="storyName"
                  value={storyName}
                  onChange={(e) => setStoryName(e.target.value)}
                  placeholder="e.g., Lucky's Food Invention"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what's included in this cooking kit..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="29.99"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type</Label>
                  <Input
                    id="productType"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    placeholder="Cooking Kit"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Additional Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="kids, cooking, desserts"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
                  </span>
                </label>
              </div>

              {/* Or add by URL */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addImageUrl}>
                  <ImagePlus className="w-4 h-4 mr-2" />
                  Add URL
                </Button>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/kits">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Kit' : 'Create Kit'}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}