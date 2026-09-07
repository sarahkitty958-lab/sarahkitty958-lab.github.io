import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TermsModal } from './TermsModal';
import { CheckCircle, Circle } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup' && !termsAccepted) {
      toast.error('Please read and accept the terms & conditions! 📜');
      return;
    }
    
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Welcome back! 🎉');
        onOpenChange(false);
        resetForm();
      }
    } else if (mode === 'signup') {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Welcome to Stuffed Adventures! 🧸');
        onOpenChange(false);
        resetForm();
      }
    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password reset email sent! Check your inbox 📬');
        setResetSent(true);
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setTermsAccepted(false);
    setHasReadTerms(false);
    setResetSent(false);
    setMode('login');
  };

  const handleOpenTerms = () => {
    setTermsOpen(true);
  };

  const handleTermsAccepted = () => {
    setHasReadTerms(true);
    setTermsAccepted(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center">
              {mode === 'login'
                ? '🧸 Welcome Back!'
                : mode === 'signup'
                ? '✨ Join the Adventure!'
                : '🔐 Reset Password'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ricie SA Crew"
                  required={mode === 'signup'}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. RicieSACrew@MewMew.com"
                required
              />
            </div>
            
            {mode !== 'reset' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required={mode !== 'reset'}
                  minLength={6}
                />
              </div>
            )}
            
            {mode === 'signup' && (
              <div className="space-y-3">
                <div 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    termsAccepted 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-muted/50 border-dashed border-primary/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {termsAccepted ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 text-sm leading-relaxed">
                      {termsAccepted ? (
                        <p className="text-foreground">
                          ✅ You've read and accepted the{' '}
                          <button
                            type="button"
                            onClick={handleOpenTerms}
                            className="text-primary hover:underline font-medium"
                          >
                            Terms & Conditions
                          </button>
                          ! 🎉
                        </p>
                      ) : (
                        <p className="text-muted-foreground">
                          Before joining, please read our{' '}
                          <button
                            type="button"
                            onClick={handleOpenTerms}
                            className="text-primary hover:underline font-medium"
                          >
                            Terms & Conditions
                          </button>
                          {' '}to become part of the Stuffed Adventures family! 📜
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {!termsAccepted && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleOpenTerms}
                    className="w-full"
                  >
                    📖 Read Terms & Conditions
                  </Button>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (mode === 'signup' && !termsAccepted)}
            >
              {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
            
            {mode === 'signup' && !termsAccepted && (
              <p className="text-xs text-center text-muted-foreground">
                You must read and accept the terms to create an account
              </p>
            )}
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <TermsModal 
        open={termsOpen} 
        onOpenChange={setTermsOpen}
        onAccept={handleTermsAccepted}
        requireRead={true}
      />
    </>
  );
}
