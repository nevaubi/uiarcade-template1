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

  const checkAdminStatus = async () => {
    const currentUser = user;
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      console.log('Admin status for user:', currentUser.email, 'is_admin:', data?.is_admin);
      setIsAdmin(data?.is_admin === true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check admin status for initial session
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

          if (!error && mounted) {
            console.log('Initial admin check:', session.user.email, 'is_admin:', data?.is_admin);
            setIsAdmin(data?.is_admin === true);
          }
        } catch (error) {
          console.error('Error in initial admin check:', error);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        // Check admin status when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', session.user.id)
              .single();

            if (!error && mounted) {
              console.log('Sign-in admin check:', session.user.email, 'is_admin:', data?.is_admin);
              setIsAdmin(data?.is_admin === true);
            }
          } catch (error) {
            console.error('Error checking admin on sign-in:', error);
          }

          // Handle post-auth callback
          setTimeout(() => {
            if (postAuthCallback && mounted) {
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

        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove dependencies to avoid re-running

  // Re-check admin status when user changes
  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user?.id]);

  const handlePostAuthCheckout = async (callback: PostAuthCallback, freshSession: Session) => {
    try {
      console.log('Starting post-auth checkout for:', callback);
      
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
      
      const { data: { url }, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error during post-auth checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
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
