import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Heart, CheckCircle } from 'lucide-react';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
  requireRead?: boolean;
}

export function TermsModal({ open, onOpenChange, onAccept, requireRead = false }: TermsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    onAccept?.();
    onOpenChange(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset scroll state when closing without accepting
      if (!hasScrolledToBottom) {
        setHasScrolledToBottom(false);
      }
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
        
        <ScrollArea className="h-[350px] pr-4" onScrollCapture={handleScroll}>
          <div ref={scrollRef} className="space-y-6 text-sm">
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
                <li>You must be 7 or older to have an account</li>
                <li>If you're under 18, you need a parent or guardian's permission</li>
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

        {requireRead && (
          <div className="space-y-3 pt-2">
            {!hasScrolledToBottom && (
              <p className="text-xs text-center text-muted-foreground animate-pulse">
                📜 Please scroll down to read all the terms...
              </p>
            )}
            <Button 
              onClick={handleAccept} 
              disabled={!hasScrolledToBottom}
              className="w-full"
            >
              {hasScrolledToBottom ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I've Read & Accept the Terms
                </>
              ) : (
                'Please read the terms first...'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
