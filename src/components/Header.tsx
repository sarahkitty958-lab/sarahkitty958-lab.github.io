import { Link } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";
import { Book, ShoppingBag, HelpCircle, Info, Home, User, Settings, Package } from "lucide-react";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, isAdmin, loading } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl animate-wiggle">🧸</span>
          <span className="font-display text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Stuffed Adventures
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/stories" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Stories
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/shop" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Shop
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Q&A
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/about" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              About
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <Button variant="outline" size="sm" disabled className="gap-2">
              <User className="w-4 h-4" />
              ...
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-muted-foreground text-sm">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/stories" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Manage Stories
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/kits" className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Manage Kits
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setAuthModalOpen(true)} size="sm">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
          <CartDrawer />
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  );
};
