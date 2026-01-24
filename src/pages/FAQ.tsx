import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthModal } from '@/components/AuthModal';

interface PublishedQuestion {
  id: string;
  question: string;
  answer: string;
  asked_by_name: string | null;
}

export default function FAQ() {
  const [questions, setQuestions] = useState<PublishedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    // Pre-fill name from profile
    if (user) {
      supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.display_name) {
            setName(data.display_name);
          }
        });
    }
  }, [user]);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('id, question, answer, asked_by_name')
      .eq('is_published', true)
      .not('answer', 'is', null)
      .order('answered_at', { ascending: false });

    if (!error) {
      setQuestions(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!newQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('questions')
      .insert({
        question: newQuestion.trim(),
        asked_by: user.id,
        asked_by_name: name.trim() || null
      });

    if (error) {
      toast.error('Failed to submit question');
    } else {
      toast.success('Question submitted! We\'ll answer it soon. 🎉');
      setNewQuestion('');
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-secondary/20 to-background">
          <div className="container text-center">
            <span className="text-5xl mb-4 block">❓</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Questions & Answers
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have a question? Ask us anything! We love hearing from our community.
            </p>
          </div>
        </section>

        <div className="container py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Ask a Question */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Ask a Question
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name (optional)"
                      />
                    </div>
                    <div>
                      <Textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="What would you like to know?"
                        rows={4}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {user ? 'Submit Question' : 'Sign in to Ask'}
                    </Button>
                    {!user && (
                      <p className="text-xs text-muted-foreground text-center">
                        You need to be signed in to ask a question
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Answered Questions */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-semibold mb-6">
                Frequently Asked Questions
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : questions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <span className="text-4xl mb-4 block">🤔</span>
                    <p className="text-muted-foreground">
                      No questions yet! Be the first to ask something.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="single" collapsible className="space-y-4">
                  {questions.map((q) => (
                    <AccordionItem
                      key={q.id}
                      value={q.id}
                      className="bg-card rounded-xl border px-6 data-[state=open]:shadow-soft"
                    >
                      <AccordionTrigger className="text-left font-medium hover:no-underline">
                        {q.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        <p>{q.answer}</p>
                        {q.asked_by_name && (
                          <p className="text-xs mt-3 text-muted-foreground/70">
                            Asked by {q.asked_by_name}
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}