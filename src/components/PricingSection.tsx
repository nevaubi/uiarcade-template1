
import React, { useState } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { createCheckout, subscribed, subscription_tier, checkoutLoading } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const pricingPlans = [
    {
      name: 'Starter',
      monthlyPrice: 9,
      annualPrice: 86,
      monthlyPriceId: 'price_1RcNqWDBIslKIY5sRPrUZSwO',
      annualPriceId: 'price_1RcNtSDBIslKIY5sbtJZKhIi',
      features: ['Up to 5 projects', 'Basic analytics', 'Email support', '1GB storage'],
      popular: false,
    },
    {
      name: 'Pro',
      monthlyPrice: 29,
      annualPrice: 278,
      monthlyPriceId: 'price_1RcNryDBIslKIY5sJpOan8AV',
      annualPriceId: 'price_1RcNubDBIslKIY5sZMM2yYNG',
      features: ['Unlimited projects', 'Advanced analytics', 'Priority support', '10GB storage', 'Team collaboration'],
      popular: true,
    },
    {
      name: 'Enterprise',
      monthlyPrice: 99,
      annualPrice: 950,
      monthlyPriceId: 'price_1RcNsfDBIslKIY5sIVc446gj',
      annualPriceId: 'price_1RcNvSDBIslKIY5s2eB93M48',
      features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'Unlimited storage', 'Advanced security'],
      popular: false,
    },
  ];

  const handleSubscribe = async (plan: any) => {
    if (!user) {
      // Navigate to auth with plan parameters
      const planParam = plan.name.toLowerCase();
      const billingParam = isAnnual ? 'annual' : 'monthly';
      navigate(`/auth?plan=${planParam}&billing=${billingParam}`);
      return;
    }

    try {
      const priceId = isAnnual ? plan.annualPriceId : plan.monthlyPriceId;
      await createCheckout(priceId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isCurrentPlan = (planName: string) => {
    return subscribed && subscription_tier === planName;
  };

  return (
    <section className="py-20 xl:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-purple-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-purple-950/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
           style={{
             backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
             backgroundSize: '32px 32px'
           }}>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-purple-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 xl:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700/50 mb-6 xl:mb-8">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Choose your perfect plan
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-slate-900 dark:text-white mb-6 xl:mb-8 leading-tight">
            Simple, transparent 
            <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              pricing
            </span>
          </h2>
          <p className="text-xl xl:text-2xl text-slate-600 dark:text-slate-300 mb-12 xl:mb-16 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your business needs and start building today.
          </p>
          
          {/* Enhanced Pricing Toggle */}
          <div className="flex items-center justify-center space-x-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-2 w-fit mx-auto border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <span className={`text-lg xl:text-xl font-semibold transition-colors duration-300 ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              Monthly
            </span>
            <div className="relative">
              <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-blue-600" />
            </div>
            <span className={`text-lg xl:text-xl font-semibold transition-colors duration-300 ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm xl:text-base font-semibold shadow-lg animate-pulse">
                Save up to 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative group transition-all duration-500 hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-purple-500/50 shadow-2xl shadow-purple-500/20 scale-105 xl:scale-110 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-slate-800 dark:via-purple-950/30 dark:to-blue-950/30' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl bg-white/80 dark:bg-slate-800/80'
              } ${
                isCurrentPlan(plan.name) 
                  ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30' 
                  : ''
              } backdrop-blur-sm overflow-hidden`}
            >
              {/* Enhanced Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm xl:text-base font-bold shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Most Popular
                    </span>
                  </div>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan(plan.name) && (
                <div className="absolute -top-4 right-6 z-10">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm xl:text-base font-semibold shadow-lg">
                    Current Plan
                  </span>
                </div>
              )}

              {/* Card Glow Effect */}
              <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                plan.popular 
                  ? 'bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10' 
                  : 'bg-gradient-to-r from-slate-500/5 to-purple-500/5'
              }`}></div>
              
              <CardHeader className={`text-center pb-8 xl:pb-12 relative z-10 ${plan.popular ? 'pt-12' : 'pt-8'}`}>
                <CardTitle className="text-2xl xl:text-3xl font-bold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  {plan.name}
                </CardTitle>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl xl:text-6xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-lg xl:text-xl">
                      {isAnnual ? '/year' : '/month'}
                    </span>
                  </div>
                  {isAnnual && (
                    <div className="text-sm xl:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">
                      ${(plan.annualPrice / 12).toFixed(0)}/month billed annually
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 xl:space-y-8 relative z-10">
                <ul className="space-y-4 xl:space-y-5">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center group/item">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mr-4 group-hover/item:scale-110 transition-transform duration-300">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-300 text-base xl:text-lg leading-relaxed group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors duration-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-8 xl:pt-12">
                  <Button 
                    size="lg"
                    className={`w-full h-12 xl:h-14 text-base xl:text-lg font-semibold relative overflow-hidden group/btn transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
                        : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md hover:shadow-lg'
                    } ${
                      isCurrentPlan(plan.name) ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrentPlan(plan.name) || checkoutLoading}
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                    
                    <span className="relative z-10">
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        isCurrentPlan(plan.name) ? 'Current Plan' : 'Get Started'
                      )}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
