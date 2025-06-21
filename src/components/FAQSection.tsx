// src/components/FAQSection.tsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "What exactly do I get with this template?",
      answer: "You get a complete, production-ready SaaS boilerplate with authentication (Supabase), payment processing (Stripe), subscription management, a beautiful UI built with Tailwind CSS and shadcn/ui, and all the backend infrastructure you need. Everything is fully typed with TypeScript and includes mobile-optimized payment flows that actually work."
    },
    {
      question: "Do I need to be an expert developer to use this?",
      answer: "Not at all! If you're comfortable with React and have basic knowledge of TypeScript, you're good to go. The codebase is well-organized and documented. Most developers can get it running in under 30 minutes. We provide clear setup instructions and the code is written to be easily understood and modified."
    },
    {
      question: "How is this different from other SaaS templates?",
      answer: "Three key differences: 1) Mobile payments actually work (most templates break on mobile), 2) We include enterprise-grade features like subscription caching and rate limiting, and 3) Everything is built with the latest versions and best practices. No deprecated code or outdated patterns."
    },
    {
      question: "Can I use this for client projects?",
      answer: "Absolutely! You can use this template for unlimited personal and commercial projects. Build as many SaaS applications as you want, for yourself or your clients. The license is perpetual - buy once, use forever."
    },
    {
      question: "What if I need help setting it up?",
      answer: "We provide comprehensive documentation and setup guides. If you get stuck, you can reach out for support and we'll help you get up and running. Most issues are resolved within 24 hours. Plus, you'll get access to our Discord community where other developers share tips and solutions."
    },
    {
      question: "Do I need to pay for Supabase and Stripe?",
      answer: "Both services have generous free tiers. Supabase gives you 500MB database, unlimited auth users, and 2GB bandwidth free. Stripe only charges when you make money (2.9% + 30¢ per transaction). You can build and launch your MVP without paying anything extra."
    },
    {
      question: "How do updates work?",
      answer: "You'll receive free updates for 1 year, including new features, bug fixes, and dependency updates. Updates are delivered via GitHub, and you can merge them into your project as needed. After 1 year, you keep everything but updates become optional paid upgrades."
    },
    {
      question: "Can I customize the design?",
      answer: "Yes! Every component is built with Tailwind CSS and shadcn/ui, making customization straightforward. Change colors, fonts, layouts - everything is modular and uses CSS variables. We don't use any weird abstractions or locked-in design systems."
    },
    {
      question: "What's your refund policy?",
      answer: "We offer a 14-day money-back guarantee. If you're not satisfied with the template for any reason, just let us know and we'll refund your purchase. No questions asked. We're confident you'll love it, but we want you to buy with confidence."
    },
    {
      question: "Is this template actively maintained?",
      answer: "Yes! We use this template for our own projects, so it's constantly being improved. We regularly update dependencies, fix any issues, and add new features based on community feedback. This isn't abandonware - it's a living product."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Everything you need to know about the template
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                <span className="font-semibold text-slate-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 flex-shrink-0",
                    openIndex === index && "transform rotate-180"
                  )}
                />
              </button>
              
              <div
                className={cn(
                  "px-6 overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === index ? "max-h-96 pb-4" : "max-h-0"
                )}
              >
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:support@yourtemplate.com"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
          >
            Contact us directly →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
