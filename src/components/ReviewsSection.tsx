import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Star, UserCircle2 } from "lucide-react";

const reviews = [
  {
    name: "Alex Johnson",
    handle: "@alexj",
    text: "This template saved me weeks of setup time. The code is clean, well-organized, and follows best practices. Highly recommended for any new SaaS project!",
  },
  {
    name: "Samantha Lee",
    handle: "@samanthacodes",
    text: "An incredible starter kit! The integration with Supabase and Stripe is seamless. I was able to launch my MVP in a fraction of the time it would normally take.",
  },
  {
    name: "David Chen",
    handle: "@daviddev",
    text: "The component library is extensive and easy to customize. I love the attention to detail in the UI and the overall developer experience.",
  },
  {
    name: "Maria Garcia",
    handle: "@mariacreates",
    text: "As a designer who codes, I appreciate how beautiful and functional this template is out of the box. It made my job so much easier.",
  },
  {
    name: "Chris Taylor",
    handle: "@ctaylor",
    text: "The documentation is clear and concise, and the code is a joy to work with. This is the best SaaS template I've come across.",
  },
  {
    name: "Jessica Brown",
    handle: "@jessbrown",
    text: "From authentication to payments, everything just works. This template is a real game-changer for solo developers and small teams.",
  },
];

const ReviewsSection = () => {
  const [api, setApi] = React.useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-900/50 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Loved by Devs
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Here is a placeholder reviews section for real users that love your product
          </p>
        </div>
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {reviews.map((review, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="h-full bg-white dark:bg-slate-800/50 shadow-lg border-slate-200/80 dark:border-slate-700/50 flex flex-col">
                    <CardContent className="flex-grow p-6 flex flex-col items-start">
                      <div className="flex items-center mb-4">
                        <UserCircle2 className="w-12 h-12 text-slate-400 dark:text-slate-500 mr-4" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{review.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{review.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-left flex-grow">"{review.text}"</p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden sm:block">
            <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default ReviewsSection; 
