// import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Alex Johnson",
    handle: "@alexj",
    text: "This template saved me weeks of setup time. The code is clean, well-organized, and follows best practices.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Samantha Lee",
    handle: "@samanthacodes",
    text: "An incredible starter kit! The integration with Supabase and Stripe is seamless. I launched my MVP so quickly.",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "David Chen",
    handle: "@daviddev",
    text: "The component library is extensive and easy to customize. I love the attention to detail in the UI.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Maria Garcia",
    handle: "@mariacreates",
    text: "As a designer who codes, I appreciate how beautiful and functional this template is out of the box.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Chris Taylor",
    handle: "@ctaylor",
    text: "The documentation is clear and concise, and the code is a joy to work with. Best SaaS template ever!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Jessica Brown",
    handle: "@jessbrown",
    text: "From authentication to payments, everything just works. This template is a real game-changer.",
    avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
];

const secondRowReviews = [
  {
    name: "Michael Zhang",
    handle: "@mikezhang",
    text: "Perfect for rapid prototyping! The TypeScript setup and modern architecture saved me countless hours.",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Emily Rodriguez",
    handle: "@emilydev",
    text: "The Tailwind CSS integration is spot-on. Every component looks professional and modern right away.",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Ryan Kim",
    handle: "@ryanbuilds",
    text: "Excellent developer experience. The folder structure and conventions make scaling so much easier.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Sophia Williams",
    handle: "@sophiatech",
    text: "The authentication flow is seamless and secure. Everything I needed for my startup's MVP.",
    avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "James Wilson",
    handle: "@jameswilson",
    text: "Outstanding template! The Supabase integration works flawlessly. Highly recommended for any SaaS.",
    avatar: "https://images.unsplash.com/photo-1528892952291-009c663ce843?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Isabella Martinez",
    handle: "@isabellacodes",
    text: "Love how responsive and accessible everything is. The attention to detail is incredible.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
];

const ReviewsSection = () => {
  // Duplicate reviews for seamless loop
  const duplicatedReviews = [...reviews, ...reviews];
  const duplicatedSecondRowReviews = [...secondRowReviews, ...secondRowReviews];

  return (
    <section className="py-8 sm:py-16 md:py-24 px-3 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b sm:bg-gradient-to-br from-gray-200 via-white to-gray-300 dark:from-gray-700 dark:via-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Loved by Devs
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Here is a placeholder reviews section for real users that love your product
          </p>
        </div>
        
        {/* First Row - Left to Right */}
        <div className="relative mb-6">
          <div className="reviews-scroll-container">
            <div className="reviews-scroll-track">
              {duplicatedReviews.map((review, index) => (
                <div key={index} className="reviews-scroll-item">
                  <Card className="h-full bg-white dark:bg-white shadow-md sm:shadow-lg border-slate-200 dark:border-slate-300 flex flex-col hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 backdrop-blur-sm border sm:border-2">
                    <CardContent className="flex-grow p-3 sm:p-5 flex flex-col">
                      <div className="flex items-center mb-3">
                        <img 
                          src={review.avatar} 
                          alt={review.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mr-2 sm:mr-3 border border-slate-300 dark:border-slate-600 shadow-sm"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{review.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{review.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-2 sm:mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current drop-shadow-sm" />
                        ))}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-tight sm:leading-relaxed line-clamp-4 sm:line-clamp-none">"{review.text}"</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row - Right to Left */}
        <div className="relative">
          <div className="reviews-scroll-container">
            <div className="reviews-scroll-track-reverse">
              {duplicatedSecondRowReviews.map((review, index) => (
                <div key={index} className="reviews-scroll-item">
                  <Card className="h-full bg-white dark:bg-white shadow-md sm:shadow-lg border-slate-200 dark:border-slate-300 flex flex-col hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 backdrop-blur-sm border sm:border-2">
                    <CardContent className="flex-grow p-3 sm:p-5 flex flex-col">
                      <div className="flex items-center mb-3">
                        <img 
                          src={review.avatar} 
                          alt={review.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mr-2 sm:mr-3 border border-slate-300 dark:border-slate-600 shadow-sm"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{review.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{review.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-2 sm:mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current drop-shadow-sm" />
                        ))}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-tight sm:leading-relaxed line-clamp-4 sm:line-clamp-none">"{review.text}"</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection; 
