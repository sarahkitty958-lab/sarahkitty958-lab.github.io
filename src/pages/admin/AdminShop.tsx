import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, ArrowLeft, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { fetchAllAdminProducts, deleteAdminProduct, type AdminProduct } from '@/lib/shopify-admin';

type ShopCategory = "kits" | "merch" | "books-maps";

const categoryConfig = {
  kits: {
    icon: "🎨",
    title: "Cooking Kits",
    description: "Manage your adventure cooking kits",
    emptyIcon: Package,
    emptyTitle: "No kits yet",
    emptyDescription: "Start by adding your first cooking kit!",
    addLabel: "Add New Kit",
    productType: "kit"
  },
  merch: {
    icon: "👕",
    title: "Merch & Gear",
    description: "Manage t-shirts, plushies, stickers, and more",
    emptyIcon: Sparkles,
    emptyTitle: "No merch yet",
    emptyDescription: "Start by adding your first merch item!",
    addLabel: "Add New Merch",
    productType: "merch"
  },
  "books-maps": {
    icon: "📚",
    title: "Books & Maps",
    description: "Manage storybooks, adventure maps, and prints",
    emptyIcon: BookOpen,
    emptyTitle: "No books or maps yet",
    emptyDescription: "Start by adding your first book or map!",
    addLabel: "Add New Book/Map",
    productType: "book"
  }
};

export default function AdminShop() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("kits");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      toast.error('Admin access required');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAdminProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    
    const success = await deleteAdminProduct(deleteId);
    if (success) {
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.id !== deleteId));
    } else {
      toast.error('Failed to delete product');
    }
    
    setDeleting(false);
    setDeleteId(null);
  };

  // Filter products by category
  const getFilteredProducts = (category: ShopCategory) => {
    return products.filter(product => {
      const productType = product.productType?.toLowerCase() || "";
      const tags = product.tags?.map(t => t.toLowerCase()) || [];
      const title = product.title.toLowerCase();
      
      switch (category) {
        case "kits":
          return productType.includes("kit") || tags.some(t => t.includes("kit")) || title.includes("kit");
        case "merch":
          return productType.includes("merch") || productType.includes("apparel") || 
                 tags.some(t => t.includes("merch") || t.includes("apparel") || t.includes("clothing")) ||
                 title.includes("shirt") || title.includes("hoodie") || title.includes("plush") ||
                 title.includes("sticker");
        case "books-maps":
          return productType.includes("book") || productType.includes("map") || 
                 tags.some(t => t.includes("book") || t.includes("map")) ||
                 title.includes("book") || title.includes("map") || title.includes("story");
        default:
          return true;
      }
    });
  };

  const config = categoryConfig[activeCategory];
  const filteredProducts = getFilteredProducts(activeCategory);
  const EmptyIcon = config.emptyIcon;

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-display text-3xl font-bold">Manage Shop 🛍️</h1>
              <p className="text-muted-foreground">Add, edit, and manage all your products</p>
            </div>
          </div>
        </div>

        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as ShopCategory)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="kits" className="gap-2">
              <Package className="w-4 h-4 hidden sm:inline" />
              Kits
            </TabsTrigger>
            <TabsTrigger value="merch" className="gap-2">
              <Sparkles className="w-4 h-4 hidden sm:inline" />
              Merch
            </TabsTrigger>
            <TabsTrigger value="books-maps" className="gap-2">
              <BookOpen className="w-4 h-4 hidden sm:inline" />
              Books & Maps
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                  <span>{config.icon}</span>
                  {config.title}
                </h2>
                <p className="text-muted-foreground">{config.description}</p>
              </div>
              <Button asChild>
                <Link to={`/admin/kits/new?type=${activeCategory}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  {config.addLabel}
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <EmptyIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">{config.emptyTitle}</h3>
                  <p className="text-muted-foreground mb-4">{config.emptyDescription}</p>
                  <Button asChild>
                    <Link to={`/admin/kits/new?type=${activeCategory}`}>
                      <Plus className="w-4 h-4 mr-2" />
                      {config.addLabel}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        {product.images[0] && (
                          <img
                            src={product.images[0].src}
                            alt={product.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-semibold">{product.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description || 'No description'}
                          </p>
                          <p className="text-primary font-semibold mt-1">
                            ${product.variants[0]?.price || '0.00'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/kits/${product.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
