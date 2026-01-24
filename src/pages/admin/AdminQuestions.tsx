import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, MessageSquare, Check, Trash2, Eye, EyeOff } from 'lucide-react';
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

interface Question {
  id: string;
  question: string;
  asked_by_name: string | null;
  answer: string | null;
  is_published: boolean;
  created_at: string;
  answered_at: string | null;
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      toast.error('Admin access required');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load questions');
    } else {
      setQuestions(data || []);
    }
    setLoading(false);
  };

  const handleAnswer = async (questionId: string) => {
    if (!answerText.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('questions')
      .update({
        answer: answerText.trim(),
        answered_at: new Date().toISOString(),
        is_published: true
      })
      .eq('id', questionId);

    if (error) {
      toast.error('Failed to save answer');
    } else {
      toast.success('Answer published! 🎉');
      setAnsweringId(null);
      setAnswerText('');
      loadQuestions();
    }
    setSaving(false);
  };

  const togglePublish = async (question: Question) => {
    const { error } = await supabase
      .from('questions')
      .update({ is_published: !question.is_published })
      .eq('id', question.id);

    if (error) {
      toast.error('Failed to update');
    } else {
      toast.success(question.is_published ? 'Question hidden' : 'Question published');
      loadQuestions();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Question deleted');
      loadQuestions();
    }
    setDeleteId(null);
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  const unanswered = questions.filter(q => !q.answer);
  const answered = questions.filter(q => q.answer);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold">Manage Q&A</h1>
            <p className="text-muted-foreground">Answer user questions</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Unanswered Questions */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Unanswered Questions ({unanswered.length})
              </h2>
              {unanswered.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No unanswered questions! 🎉
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {unanswered.map((q) => (
                    <Card key={q.id}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium mb-1">{q.question}</p>
                            <p className="text-sm text-muted-foreground">
                              Asked by {q.asked_by_name || 'Anonymous'} • {new Date(q.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setAnsweringId(q.id);
                                setAnswerText('');
                              }}
                            >
                              Answer
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteId(q.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {answeringId === q.id && (
                          <div className="mt-4 space-y-3">
                            <Textarea
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              placeholder="Type your answer..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAnswer(q.id)}
                                disabled={saving}
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                                Publish Answer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAnsweringId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Answered Questions */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Answered Questions ({answered.length})
              </h2>
              {answered.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No answered questions yet
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {answered.map((q) => (
                    <Card key={q.id}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{q.question}</p>
                              <Badge variant={q.is_published ? 'default' : 'secondary'}>
                                {q.is_published ? 'Published' : 'Hidden'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Asked by {q.asked_by_name || 'Anonymous'}
                            </p>
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm">{q.answer}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePublish(q)}
                            >
                              {q.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteId(q.id)}
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
            </div>
          </div>
        )}
      </main>
      <Footer />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}