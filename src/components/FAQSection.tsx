import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSiteContent } from "@/hooks/useSiteContent";

const faqs = [
  {
    question: "What are Stuffed Adventures stories?",
    answer: "Stuffed Adventures are heartwarming short stories featuring lovable stuffed animal characters going on magical journeys. Each story teaches valuable lessons about friendship, courage, and kindness in a fun and engaging way."
  },
  {
    question: "What's included in the Cooking Kits?",
    answer: "Each Cooking Kit contains everything you need to create delicious recipes inspired by the story characters. Kits typically include ingredient lists, step-by-step instructions, and special touches that bring the story to life."
  },
  {
    question: "What age group are the stories suitable for?",
    answer: "Our stories are perfect for children ages 3-10, but they're designed to be enjoyed by the whole family! Parents and grandparents often tell us they love reading these stories as much as the little ones enjoy hearing them."
  },
  {
    question: "How long does shipping take?",
    answer: "We typically process orders within 1-2 business days. Standard shipping takes 5-7 business days within the US. International shipping varies by location but usually takes 2-3 weeks."
  },
  {
    question: "Can I read the stories online?",
    answer: "Yes! All our stories are available to read for free right here on our website. Simply click on any story card to dive into the adventure. Physical books and kits are also available in our shop."
  },
  {
    question: "Do you offer custom or personalized kits?",
    answer: "We love making adventures personal! Contact us for custom orders - we can add names, special colors, or create unique combinations. Perfect for birthdays, holidays, or just-because gifts!"
  }
];

export const FAQSection = () => {
  const { data: content } = useSiteContent("faq_section");
  
  const c = content?.content as Record<string, string> | undefined;
  const emoji = c?.emoji ?? "❓";
  const title = c?.title ?? "Questions & Answers";
  const description = c?.description ?? "Got questions? We've got answers! Here's everything you need to know.";

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container px-4 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-5xl mb-4 block">{emoji}</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {description}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card rounded-xl border-2 border-border/50 px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-soft transition-all"
            >
              <AccordionTrigger className="font-display text-left text-lg hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
