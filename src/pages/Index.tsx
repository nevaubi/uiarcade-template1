import React, { useState, useEffect } from 'react';
import { Check, Star, Users, Shield, Zap, ArrowRight, Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import AuthButton from '@/components/AuthButton';
import PricingSection from '@/components/PricingSection';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 z-50 shadow-sm">
        {/* Navigation */}
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
        {isMenuOpen && <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                Features
              </a>
              <a href="#pricing" className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                Pricing
              </a>
              <div className="px-3 py-2">
                <AuthButton />
              </div>
            </div>
          </div>}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto text-center">
          <div className="scroll-animate opacity-0 transform translate-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700/50 mb-8 shadow-sm hover:shadow-md transition-all duration-300">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Trusted by 10,000+ developers</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
              Build Amazing
              <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent relative">
                SaaS Products
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 blur-2xl -z-10"></div>
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-4 max-w-4xl mx-auto leading-relaxed">
              The modern platform for teams who want to build, ship, and scale their SaaS applications faster than ever before.
            </p>
            
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
              Join thousands of developers who've already launched successful products with our battle-tested boilerplate.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-10 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group" 
                onClick={() => navigate('/auth?tab=signup')}
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
                <span className="relative z-10">Start Free Trial</span>
                <ArrowRight className="ml-3 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-4 border-2 border-slate-300 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-300 backdrop-blur-sm"
              >
                Watch Demo
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">10k+</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">99.9%</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">24/7</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Support</div>
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
                title: 'Analytics & Insights',
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
              <Card 
                key={index} 
                className="scroll-animate opacity-0 transform translate-y-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm" 
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Card border gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-[1px] bg-white dark:bg-slate-800 rounded-lg"></div>
                
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
      </div>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 dark:bg-slate-950 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
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
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a></li>
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
