
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostAuthCallback {
  plan: string;
  billing: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setPostAuthCallback: (callback: PostAuthCallback | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [postAuthCallback, setPostAuthCallback] = useState<PostAuthCallback | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle successful sign in with post-auth callback
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, checking for post-auth callback...', { postAuthCallback });
          
          // Check immediately, then again after a small delay for race condition safety
          const checkAndExecuteCallback = () => {
            if (postAuthCallback) {
              console.log('Executing post-auth callback:', postAuthCallback);
              handlePostAuthCheckout(postAuthCallback, session); // Pass fresh session
              setPostAuthCallback(null); // Clear the callback after use
              return true;
            }
            return false;
          };
          
          // First immediate check
          const callbackExecuted = checkAndExecuteCallback();
          
          // If no callback found, check again after a small delay (for race condition safety)
          if (!callbackExecuted) {
            setTimeout(() => {
              console.log('Delayed check for post-auth callback...', { postAuthCallback });
              const delayedCallbackExecuted = checkAndExecuteCallback();
              
              // If still no callback, check URL parameters as fallback
              if (!delayedCallbackExecuted) {
                const urlParams = new URLSearchParams(window.location.search);
                const planParam = urlParams.get('plan');
                const billingParam = urlParams.get('billing');
                
                if (planParam && billingParam && window.location.pathname === '/auth') {
                  console.log('Fallback: Found plan parameters in URL, executing checkout directly');
                  handlePostAuthCheckout({ plan: planParam, billing: billingParam }, session);
                } else if (window.location.pathname === '/auth' || window.location.pathname === '/') {
                  console.log('No callback found, redirecting to dashboard');
                  window.location.href = '/dashboard';
                }
              }
            }, 100);
          }
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          if (window.location.pathname === '/dashboard') {
            window.location.href = '/';
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [postAuthCallback]); // Add postAuthCallback as dependency so listener sees updated values

  const handlePostAuthCheckout = async (callback: PostAuthCallback, freshSession: Session) => {
    try {
      console.log('Starting post-auth checkout for:', callback);
      
      // Map plan names to pricing data
      const pricingPlans = {
        starter: {
          monthlyPriceId: 'price_1RcNqWDBIslKIY5sRPrUZSwO',
          annualPriceId: 'price_1RcNtSDBIslKIY5sbtJZKhIi',
        },
        pro: {
          monthlyPriceId: 'price_1RcNryDBIslKIY5sJpOan8AV',
          annualPriceId: 'price_1RcNubDBIslKIY5sZMM2yYNG',
        },
        enterprise: {
          monthlyPriceId: 'price_1RcNsfDBIslKIY5sIVc446gj',
          annualPriceId: 'price_1RcNvSDBIslKIY5s2eB93M48',
        }
      };

      const plan = pricingPlans[callback.plan as keyof typeof pricingPlans];
      if (!plan) {
        throw new Error(`Invalid plan: ${callback.plan}`);
      }

      const priceId = callback.billing === 'annual' ? plan.annualPriceId : plan.monthlyPriceId;
      
      console.log('Creating checkout with priceId:', priceId);
      
      // Use the fresh session from authentication callback
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${freshSession.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      // For post-auth checkout, always redirect in same tab for seamless experience
      console.log('Post-auth checkout: redirecting to checkout in same tab');
      window.location.href = data.url;
      
      toast({
        title: "Redirecting to checkout",
        description: "Please complete your subscription.",
      });
      
    } catch (error) {
      console.error('Post-auth checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to start checkout. Please try again from the pricing page.",
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      // The redirect will be handled by the onAuthStateChange listener
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      // The redirect will be handled by the onAuthStateChange listener
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    setPostAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
