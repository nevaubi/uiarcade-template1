import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is included in the template?",
    answer: "The template comes with a full-featured React frontend, a Supabase backend setup with authentication and database, and Stripe integration for payments. It includes a library of UI components, protected routes, and more.",
  },
  {
    question: "Is it easy to customize?",
    answer: "Yes! The template is built with Tailwind CSS and shadcn/ui, making it highly customizable. You can easily change the colors, fonts, and components to match your brand.",
  },
  {
    question: "What technologies are used?",
    answer: "We use Vite, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase for the backend, and Stripe for payments. It's a modern and robust stack for building SaaS applications.",
  },
  {
    question: "Do you offer support?",
    answer: "Yes, of course! You can reach out to me anytime on my personal Twitter account.",
  },
    {
    question: "Can I use this for multiple projects?",
    answer: "Absolutely. Once you purchase the template, you are free to use it for as many projects as you'd like.",
  },
];

const FaqSection = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">
            Here is a FAQ section you can customize for your personal webapp
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-all"
            >
              <AccordionTrigger className="text-lg text-left font-semibold hover:no-underline px-5 text-slate-900 dark:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-700 dark:text-slate-300 text-base px-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection; 
