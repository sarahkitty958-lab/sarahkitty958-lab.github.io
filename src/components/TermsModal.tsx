import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart } from 'lucide-react';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center flex items-center justify-center gap-2">
            <span>🧸</span>
            Our Promises to Each Other
            <span>✨</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            The legal stuff, but make it cozy!
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-display font-semibold text-lg mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Welcome to the Stuffed Adventures Family!
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                By joining our cozy corner of the internet, you're agreeing to be part of a 
                friendly community that loves cooking, crafts, and cute stuffed animals! 🌟
              </p>
            </section>
            
            <section>
              <h3 className="font-display font-semibold text-lg mb-2">🍳 Your Account</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 leading-relaxed">
                <li>Keep your password secret (like a special recipe!)</li>
                <li>Be yourself - one account per person please</li>
                <li>You must be 13+ to have an account (with parental permission if under 18)</li>
              </ul>
            </section>
            
            <section>
              <h3 className="font-display font-semibold text-lg mb-2">💬 Being a Good Friend</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 leading-relaxed">
                <li>Be kind in comments - spread joy, not negativity! 🌈</li>
                <li>No sharing others' personal information</li>
                <li>Keep it family-friendly - this is a cozy space for all ages</li>
              </ul>
            </section>
            
            <section>
              <h3 className="font-display font-semibold text-lg mb-2">🛒 Shopping & Orders</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 leading-relaxed">
                <li>Prices are shown in USD</li>
                <li>We'll always confirm your order via email</li>
                <li>Shipping times may vary (good things take time!)</li>
              </ul>
            </section>
            
            <section>
              <h3 className="font-display font-semibold text-lg mb-2">📸 Your Content</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 leading-relaxed">
                <li>Photos and comments you share remain yours</li>
                <li>By posting, you let us feature your awesome creations</li>
                <li>Don't share anything you don't have rights to</li>
              </ul>
            </section>
            
            <section>
              <h3 className="font-display font-semibold text-lg mb-2">🔔 Notifications</h3>
              <p className="text-muted-foreground leading-relaxed">
                We might send you emails about new stories, products, and special offers. 
                You can always adjust this in your account settings!
              </p>
            </section>
            
            <section>
              <h3 className="font-display font-semibold text-lg mb-2">🤝 Our Promise</h3>
              <p className="text-muted-foreground leading-relaxed">
                We'll always treat your information with care, keep this space safe and fun, 
                and continue creating delightful adventures for you and your little ones!
              </p>
            </section>
            
            <div className="pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Last updated: January 2026 • Questions? Reach out anytime! 💌
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
