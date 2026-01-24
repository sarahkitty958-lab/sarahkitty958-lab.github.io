import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Package, ArrowLeft, Loader2 } from 'lucide-react';
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

export default function AdminKits() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
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
      toast.success('Kit deleted successfully');
      setProducts(products.filter(p => p.id !== deleteId));
    } else {
      toast.error('Failed to delete kit');
    }
    
    setDeleting(false);
    setDeleteId(null);
  };

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
              <h1 className="font-display text-3xl font-bold">Manage Cooking Kits</h1>
              <p className="text-muted-foreground">Add, edit, and manage your cooking kits</p>
            </div>
          </div>
          <Button asChild>
            <Link to="/admin/kits/new">
              <Plus className="w-4 h-4 mr-2" />
              Add New Kit
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No cooking kits yet</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first cooking kit!</p>
              <Button asChild>
                <Link to="/admin/kits/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Kit
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
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
      </main>
      <Footer />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this kit?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the kit from your store.
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
