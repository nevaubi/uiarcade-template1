
import React, { useState, useEffect } from 'react';
import { Check, Star, Users, Shield, Zap, ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import AuthButton from '@/components/AuthButton';
import PricingSection from '@/components/PricingSection';
import ReviewsSection from '@/components/ReviewsSection';
import FaqSection from '@/components/FaqSection';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Smooth scroll animation hook
  const useScrollAnimation = () => {
    useEffect(() => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      }, {
        threshold: 0.1
      });
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach(el => observer.observe(el));
      return () => observer.disconnect();
    }, []);
  };
  useScrollAnimation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Simplified Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute w-[800px] h-[600px] bg-gradient-to-r from-purple-200/30 to-blue-200/30 dark:from-purple-800/20 dark:to-blue-800/20 rounded-full blur-3xl -top-48 -right-48 animate-float" style={{ animationDuration: '20s' }}></div>
        <div className="absolute w-[600px] h-[400px] bg-gradient-to-r from-blue-200/20 to-indigo-200/20 dark:from-blue-800/15 dark:to-indigo-800/15 rounded-full blur-3xl -bottom-24 -left-24 animate-float" style={{ animationDuration: '25s', animationDelay: '5s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button onClick={() => navigate('/')} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
                <Link to="/blog" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Blog
                </Link>
                <AuthButton />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                Features
              </a>
              <a href="#pricing" className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                Pricing
              </a>
              <Link to="/blog" className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                Blog
              </Link>
              <div className="px-3 py-2">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Optimized for Conversion */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="scroll-animate opacity-0 transform translate-y-8 text-center lg:text-left space-y-8">
              {/* Trust Badge - Improved */}
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200/50 dark:border-purple-700/30 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
                <div className="p-1 bg-purple-100 dark:bg-purple-800/30 rounded-full">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Save weeks of development time
                </span>
              </div>

              {/* Headline - Improved Typography */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                  Build Amazing
                  <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent relative">
                    SaaS Products
                  </span>
                </h1>
                
                <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  Build, ship, and scale faster than ever
                </p>
                
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl lg:max-w-none">
                  Join developers who save days of boilerplate creation and ship on day one.
                </p>
              </div>

              {/* CTA Section - Optimized for Conversion */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-4 h-14 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 min-w-[200px] font-semibold"
                    onClick={() => navigate('/auth?tab=signup')}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-4 h-14 border-2 border-slate-300 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 min-w-[160px]"
                  >
                    Watch Demo
                  </Button>
                </div>

                {/* Social Proof - Repositioned */}
                <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Tons
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Hours saved</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        99.9%
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Uptime</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        24/7
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Image - Simplified */}
            <div className="scroll-animate opacity-0 transform translate-y-8 lg:order-last order-first" style={{ animationDelay: '0.2s' }}>
              <div className="relative group">
                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80" 
                    alt="Developer working on MacBook Pro" 
                    className="w-full h-auto rounded-xl shadow-md aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                  
                  {/* Floating Tech Badges - Simplified */}
                  <div className="absolute top-6 -left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg animate-float opacity-95">
                    React + TypeScript
                  </div>
                  <div className="absolute bottom-6 -right-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg animate-float opacity-95" style={{ animationDelay: '1s' }}>
                    Tailwind CSS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 scroll-animate opacity-0 transform translate-y-8">
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to help you build and scale your SaaS business with confidence and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Built for speed with modern technologies and optimized performance.',
                gradient: 'from-yellow-400 to-orange-500'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-level security with end-to-end encryption and compliance.',
                gradient: 'from-green-400 to-emerald-500'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Work together seamlessly with real-time collaboration tools.',
                gradient: 'from-blue-400 to-cyan-500'
              },
              {
                icon: Star,
                title: 'Complete Stripe Integration',
                description: 'Deep insights into your business with comprehensive analytics.',
                gradient: 'from-purple-400 to-pink-500'
              },
              {
                icon: Check,
                title: 'Easy Integration',
                description: 'Connect with your favorite tools through our robust API.',
                gradient: 'from-indigo-400 to-purple-500'
              },
              {
                icon: ArrowRight,
                title: 'Scalable Infrastructure',
                description: 'Grow from startup to enterprise with our scalable platform.',
                gradient: 'from-rose-400 to-red-500'
              }
            ].map((feature, index) => (
              <Card key={index} className="scroll-animate opacity-0 transform translate-y-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden border-0 glass-morph backdrop-blur-sm" style={{
                animationDelay: `${index * 150}ms`
              }}>
                {/* Card border gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-[1px] bg-white/90 dark:bg-slate-800/90 rounded-lg backdrop-blur-sm"></div>
                
                <CardHeader className="relative z-10">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} p-3 mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div id="pricing" className="relative">
        <PricingSection />
        <ReviewsSection />
        <FaqSection />
      </div>

      {/* Footer */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                Template1
              </h3>
              <p className="text-slate-400 mb-4 max-w-md">
                The modern platform for teams who want to build, ship, and scale their SaaS applications faster than ever before.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/blog" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">© 2025 Template1. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
