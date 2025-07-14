import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Choose the perfect plan for your business needs.
          </p>
          
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-lg ${!isAnnual ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500'}`}>
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-lg ${isAnnual ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Save up to 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular 
                  ? 'border-purple-600 shadow-2xl scale-105' 
                  : 'hover:shadow-lg'
              } ${
                isCurrentPlan(plan.name) 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : ''
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan(plan.name) && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-slate-500 ml-1">
                    {isAnnual ? '/year' : '/month'}
                  </span>
                  {isAnnual && (
                    <div className="text-sm text-slate-500 mt-1">
                      ${(plan.annualPrice / 12).toFixed(0)}/month billed annually
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-6">
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                        : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                    }`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrentPlan(plan.name) || checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      isCurrentPlan(plan.name) ? 'Current Plan' : 'Get Started'
                    )}
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
