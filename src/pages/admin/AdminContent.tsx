import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAllSiteContent, useUpdateSiteContent } from "@/hooks/useSiteContent";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sectionLabels: Record<string, string> = {
  hero: "🏠 Hero Section",
  stories_section: "📖 Stories Section",
  shop_section: "🎨 Shop Section",
  faq_section: "❓ Q&A Section",
  about_section: "💝 About Section",
  footer: "📌 Footer",
};

const fieldLabels: Record<string, string> = {
  badge: "Badge Text",
  title_line1: "Title Line 1",
  title_line2: "Title Line 2",
  title: "Section Title",
  description: "Description",
  button_stories: "Stories Button Text",
  button_shop: "Shop Button Text",
  emoji: "Section Emoji",
  mission_title: "Mission Title",
  mission_text: "Mission Text",
  card1_title: "Card 1 Title",
  card1_text: "Card 1 Text",
  card2_title: "Card 2 Title",
  card2_text: "Card 2 Text",
  card3_title: "Card 3 Title",
  card3_text: "Card 3 Text",
  brand_name: "Brand Name",
  tagline: "Tagline",
  copyright: "Copyright Text",
};

export default function AdminContent() {
  const { data: allContent, isLoading } = useAllSiteContent();
  const updateContent = useUpdateSiteContent();
  const [editedContent, setEditedContent] = useState<Record<string, Record<string, string>>>({});

  const handleFieldChange = (sectionKey: string, fieldKey: string, value: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [fieldKey]: value,
      },
    }));
  };

  const getFieldValue = (sectionKey: string, fieldKey: string, originalValue: string) => {
    return editedContent[sectionKey]?.[fieldKey] ?? originalValue;
  };

  const handleSave = async (sectionKey: string, originalContent: Record<string, string>) => {
    const updatedContent = {
      ...originalContent,
      ...(editedContent[sectionKey] || {}),
    };

    try {
      await updateContent.mutateAsync({ sectionKey, content: updatedContent });
      toast.success("Content saved successfully!");
      // Clear edited state for this section
      setEditedContent((prev) => {
        const newState = { ...prev };
        delete newState[sectionKey];
        return newState;
      });
    } catch (error) {
      toast.error("Failed to save content");
    }
  };

  const hasChanges = (sectionKey: string) => {
    return editedContent[sectionKey] && Object.keys(editedContent[sectionKey]).length > 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold">Edit Site Content</h1>
            <p className="text-muted-foreground">
              Edit text across all sections of the website
            </p>
          </div>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {allContent?.map((section) => (
            <AccordionItem
              key={section.section_key}
              value={section.section_key}
              className="bg-card rounded-xl border px-6"
            >
              <AccordionTrigger className="font-display text-lg hover:no-underline py-4">
                <div className="flex items-center gap-2">
                  {sectionLabels[section.section_key] || section.section_key}
                  {hasChanges(section.section_key) && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      Unsaved
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4">
                  {Object.entries(section.content as Record<string, string>).map(
                    ([fieldKey, fieldValue]) => (
                      <div key={fieldKey}>
                        <label className="text-sm font-medium mb-1 block">
                          {fieldLabels[fieldKey] || fieldKey}
                        </label>
                        {fieldValue.length > 100 ? (
                          <Textarea
                            value={getFieldValue(section.section_key, fieldKey, fieldValue)}
                            onChange={(e) =>
                              handleFieldChange(section.section_key, fieldKey, e.target.value)
                            }
                            rows={4}
                          />
                        ) : (
                          <Input
                            value={getFieldValue(section.section_key, fieldKey, fieldValue)}
                            onChange={(e) =>
                              handleFieldChange(section.section_key, fieldKey, e.target.value)
                            }
                          />
                        )}
                      </div>
                    )
                  )}
                  <Button
                    onClick={() => handleSave(section.section_key, section.content as Record<string, string>)}
                    disabled={!hasChanges(section.section_key) || updateContent.isPending}
                    className="w-full"
                  >
                    {updateContent.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save {sectionLabels[section.section_key]?.split(" ").slice(1).join(" ") || section.section_key}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
