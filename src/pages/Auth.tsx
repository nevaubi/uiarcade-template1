
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Menu, X, Shield } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import GoogleIcon from '@/components/GoogleIcon';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signUp, signIn, user, setPostAuthCallback } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get parameters from URL
  const planParam = searchParams.get('plan');
  const billingParam = searchParams.get('billing');
  const tabParam = searchParams.get('tab');

  // Set default tab based on URL parameter
  const defaultTab = tabParam === 'signup' ? 'signup' : 'signin';

  // FIXED: Only redirect if no plan parameters exist
  useEffect(() => {
    if (user) {
      // Don't redirect if we're processing a plan selection
      if (!planParam && !billingParam) {
        navigate('/');
      }
    }
  }, [user, navigate, planParam, billingParam]);

  // Set up post-auth callback if plan parameters exist
  useEffect(() => {
    if (planParam && billingParam && setPostAuthCallback) {
      setPostAuthCallback({
        plan: planParam,
        billing: billingParam
      });
    }
  }, [planParam, billingParam, setPostAuthCallback]);

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      await signUp(email, password, '');
    } else {
      await signIn(email, password);
    }

    setLoading(false);
  };

  const handleGoogleAuth = () => {
    // Google auth functionality will be implemented later
    console.log('Google auth clicked');
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button
                  onClick={() => navigate('/')}
                  className="cursor-pointer hover:opacity-75 transition-opacity"
                >
                  <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    Template1
                  </h1>
                </button>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Pricing
                </a>
                <AuthButton />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Pricing
              </a>
              <div className="px-3 py-2">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Form */}
      <div className="pt-24 flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            className="mb-8 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Button>

          <Card className="auth-card border-0 shadow-2xl bg-white dark:bg-slate-800">
            {/* Security Badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Secure Login</span>
              </div>
            </div>

            <CardHeader className="text-center pt-12 pb-8">
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Template1
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
                {planParam ? 
                  `Sign in to continue with your ${planParam} plan selection.` :
                  'Welcome! Sign in to your account or create a new one.'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <Tabs defaultValue={defaultTab} onValueChange={resetForm}>
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 dark:bg-slate-700 p-1">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-6">
                  <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="signin-email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Email Address
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="auth-input h-12 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signin-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="auth-input h-12 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transform hover:translate-y-[-1px] transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-6">
                  <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Email Address
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="auth-input h-12 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="auth-input h-12 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transform hover:translate-y-[-1px] transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative mt-8 mb-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-slate-300 dark:bg-slate-600" />
                </div>
                <div className="relative flex justify-center text-sm uppercase">
                  <span className="bg-white dark:bg-slate-800 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-12 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-base transition-all duration-200" 
                onClick={handleGoogleAuth}
              >
                <GoogleIcon className="mr-3 h-5 w-5" />
                Continue with Google
              </Button>

              {/* Trust Elements */}
              <div className="mt-8 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
