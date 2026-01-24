import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, UserPlus, Shield, Trash2, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  email?: string;
  display_name?: string;
}

export default function AdminUsers() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      toast.error('Admin access required');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    
    // Get all admin roles with profile info
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('id, user_id, role')
      .eq('role', 'admin');

    if (error) {
      toast.error('Failed to load admins');
      setLoading(false);
      return;
    }

    // Get profile info for each admin
    const adminList: AdminUser[] = [];
    for (const role of roles || []) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', role.user_id)
        .maybeSingle();

      adminList.push({
        ...role,
        display_name: profile?.display_name || 'Unknown',
      });
    }

    setAdmins(adminList);
    setLoading(false);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter an email');
      return;
    }

    setAdding(true);

    // First, find the user by looking up their profile
    // We need to search profiles for the email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, display_name');

    if (profileError) {
      toast.error('Failed to search for user');
      setAdding(false);
      return;
    }

    // Since we can't query auth.users directly, we'll try to find by checking if a user exists
    // We'll use a workaround - try to add by email match in profiles display_name or search auth
    
    // For now, let's use a simpler approach - admin enters the user ID or we search by display name
    const matchingProfile = profiles?.find(p => 
      p.display_name?.toLowerCase().includes(email.toLowerCase())
    );

    if (!matchingProfile) {
      // Try to see if the email matches a pattern - we need the user to have signed up
      toast.error('User not found. Make sure they have signed up first, then search by their display name.');
      setAdding(false);
      return;
    }

    // Check if already admin
    const existingAdmin = admins.find(a => a.user_id === matchingProfile.user_id);
    if (existingAdmin) {
      toast.error('This user is already an admin');
      setAdding(false);
      return;
    }

    // Add admin role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: matchingProfile.user_id,
        role: 'admin'
      });

    if (error) {
      toast.error('Failed to add admin: ' + error.message);
    } else {
      toast.success('Admin added successfully! 🎉');
      setEmail('');
      loadAdmins();
    }

    setAdding(false);
  };

  const handleRemoveAdmin = async () => {
    if (!removeId) return;

    // Don't allow removing yourself
    const adminToRemove = admins.find(a => a.id === removeId);
    if (adminToRemove?.user_id === user?.id) {
      toast.error("You can't remove yourself as admin");
      setRemoveId(null);
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', removeId);

    if (error) {
      toast.error('Failed to remove admin');
    } else {
      toast.success('Admin removed');
      loadAdmins();
    }
    setRemoveId(null);
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold">Manage Admins</h1>
            <p className="text-muted-foreground">Add or remove admin access</p>
          </div>
        </div>

        {/* Add New Admin */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add New Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">User Display Name or Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter their display name..."
                />
                <p className="text-xs text-muted-foreground">
                  The user must have signed up first. Search by their display name.
                </p>
              </div>
              <Button type="submit" disabled={adding}>
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Grant Admin Access
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Admins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Current Admins ({admins.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : admins.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No admins found
              </p>
            ) : (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{admin.display_name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Admin</Badge>
                          {admin.user_id === user?.id && (
                            <Badge variant="outline">You</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {admin.user_id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRemoveId(admin.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />

      <AlertDialog open={!!removeId} onOpenChange={() => setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin access?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will no longer be able to manage stories, kits, or Q&A.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveAdmin}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}