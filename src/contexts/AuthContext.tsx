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
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  setPostAuthCallback: (callback: PostAuthCallback | null) => void;
  checkAdminStatus: () => Promise<void>;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postAuthCallback, setPostAuthCallback] = useState<PostAuthCallback | null>(null);
  const { toast } = useToast();

  // FIX: Accept userId as parameter instead of relying on state
  const checkAdminStatusForUser = async (userId: string) => {
    if (!userId) {
      console.error('No userId provided to checkAdminStatusForUser');
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      console.log('Admin status for user', userId, ':', data?.is_admin);
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  // Wrapper function that uses current user from state
  const checkAdminStatus = async () => {
    if (user?.id) {
      await checkAdminStatusForUser(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // FIX: Pass the user ID directly instead of relying on state
        if (session?.user?.id) {
          await checkAdminStatusForUser(session.user.id);
        } else {
          setIsAdmin(false);
        }

        // Handle successful sign in with post-auth callback
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, checking for post-auth callback...');
          
          // Use a small delay to ensure state is properly updated
          setTimeout(() => {
            if (postAuthCallback) {
              console.log('Executing post-auth callback:', postAuthCallback);
              handlePostAuthCheckout(postAuthCallback, session);
              setPostAuthCallback(null);
            } else if (window.location.pathname === '/auth' || window.location.pathname === '/') {
              window.location.href = '/dashboard';
            }
          }, 100);
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setIsAdmin(false);
          if (window.location.pathname === '/dashboard') {
            window.location.href = '/';
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // FIX: Pass the user ID directly
      if (session?.user?.id) {
        await checkAdminStatusForUser(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [postAuthCallback]);

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
      
      console.log('Creating checkout with price ID:', priceId);
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshSession.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Post-auth checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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
        title: "Success!",
        description: "Please check your email to verify your account.",
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
    isAdmin,
    signUp,
    signIn,
    signOut,
    loading,
    setPostAuthCallback,
    checkAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
