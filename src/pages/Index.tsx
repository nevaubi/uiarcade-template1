
import { useState, useEffect } from 'react';
import { Shield, ArrowRight, Menu, X, Sparkles, Bot, CreditCard, Mail, BarChart3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import AuthButton from '@/components/AuthButton';
import PricingSection from '@/components/PricingSection';
import ReviewsSection from '@/components/ReviewsSection';
import FaqSection from '@/components/FaqSection';
import MetricsSection from '@/components/MetricsSection';
import HeroBackground from '@/components/HeroBackground';

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
    <div className="min-h-screen bg-white dark:bg-navy-900 relative overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white dark:bg-navy-900/90 backdrop-blur-md border-b border-navy-200 dark:border-navy-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button onClick={() => navigate('/')} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
                    Template1
                  </h1>
                </button>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white transition-colors">
                  Pricing
                </a>
                <Link to="/blog" className="text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white transition-colors">
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
          <div className="md:hidden bg-white dark:bg-navy-900 border-t border-navy-200 dark:border-navy-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white">
                Features
              </a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white">
                Pricing
              </a>
              <Link to="/blog" className="block px-3 py-2 text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white">
                Blog
              </Link>
              <div className="px-3 py-2">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="header-container pt-24 px-4 sm:px-6 lg:px-8">
        <HeroBackground />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="scroll-animate opacity-0 transform translate-y-8 text-center lg:text-left space-y-6 lg:space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className="p-1 bg-white/20 rounded-full">
                  <Sparkles className="h-4 w-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <span className="text-sm font-medium text-white">
                  Save weeks of development time
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-[2.5rem] sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                  Build Amazing
                  <span className="block text-blue-300 relative">
                    SaaS Products
                  </span>
                </h1>
                
                <p className="text-xl sm:text-2xl text-navy-200 font-medium leading-relaxed">
                  Build, ship, and scale faster than ever
                </p>
                
                <p className="text-lg text-navy-300 leading-relaxed max-w-xl lg:max-w-none">
                  Join developers who save days of boilerplate creation and ship on day one.
                </p>
              </div>

              {/* CTA Section */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 h-14 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 min-w-[200px] font-semibold btn-enhanced"
                    onClick={() => navigate('/auth?tab=signup')}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                  
                  <Button 
                    size="lg" 
                    className="hidden lg:flex text-lg px-8 py-4 h-14 bg-white text-black hover:bg-gray-200 transition-all duration-300 min-w-[160px]"
                  >
                    View Demo
                  </Button>
                </div>

                {/* Social Proof */}
                <div className="pt-4 border-t border-white/20">
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl sm:text-3xl font-bold text-white">
                        Tons
                      </div>
                      <div className="text-sm text-navy-300">Hours saved</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl sm:text-3xl font-bold text-white">
                        99.9%
                      </div>
                      <div className="text-sm text-navy-300">Uptime</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl sm:text-3xl font-bold text-white">
                        24/7
                      </div>
                      <div className="text-sm text-navy-300">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="scroll-animate opacity-0 transform translate-y-8 lg:order-last order-first w-4/5 mx-auto lg:w-full lg:mx-0" style={{ animationDelay: '0.2s' }}>
              <div className="relative group">
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80" 
                    alt="Developer working on MacBook Pro" 
                    className="w-full h-auto rounded-xl shadow-md aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Navy Theme */}
      <section id="features" className="pt-8 sm:pt-12 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 relative bg-white dark:bg-navy-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 scroll-animate opacity-0 transform translate-y-8">
            <h2 className="text-3xl sm:text-5xl font-bold text-navy-900 dark:text-white mb-6">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-navy-600 dark:text-navy-300 max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to help you build and scale your SaaS business with confidence and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[
              {
                icon: Bot,
                title: 'AI Assistant Integration',
                description: 'Intelligent chatbot powered by OpenAI with document integration and custom instructions.',
                bgColor: 'bg-navy-600'
              },
              {
                icon: CreditCard,
                title: 'Complete Stripe Integration',
                description: 'Full payment processing with subscriptions, one-time payments, and customer portal.',
                bgColor: 'bg-navy-700'
              },
              {
                icon: Mail,
                title: 'Professional Email System',
                description: 'Automated welcome emails and transactional messaging via Resend integration.',
                bgColor: 'bg-navy-800'
              },
              {
                icon: BarChart3,
                title: 'Advanced Admin Dashboard',
                description: 'Comprehensive analytics, user management, and business insights with visual charts.',
                bgColor: 'bg-navy-600'
              },
              {
                icon: FileText,
                title: 'Document Management',
                description: 'Upload, process, and embed documents with AI-powered search and retrieval.',
                bgColor: 'bg-navy-700'
              },
              {
                icon: Shield,
                title: 'Enterprise Authentication',
                description: 'Secure Supabase auth with rate limiting, user suspension, and admin controls.',
                bgColor: 'bg-navy-800'
              }
            ].map((feature, index) => (
              <Card key={index} className="scroll-animate opacity-0 transform translate-y-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden border-0 navy-card backdrop-blur-sm feature-card cursor-pointer p-2" style={{
                animationDelay: `${index * 150}ms`
              }}>
                {/* Card border */}
                <div className="absolute inset-0 bg-navy-200/20 dark:bg-navy-700/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-[1px] bg-white/90 dark:bg-navy-800/90 rounded-lg backdrop-blur-sm"></div>
                
                <CardHeader className="relative z-10 pb-4 pt-6 px-6">
                  <div className={`w-16 h-16 rounded-xl ${feature.bgColor} p-3 mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold group-hover:text-navy-700 dark:group-hover:text-navy-300 transition-colors duration-300 leading-snug">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 px-6 pb-6">
                  <p className="text-navy-600 dark:text-navy-300 leading-relaxed text-base">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <MetricsSection />

      {/* Pricing Section */}
      <div id="pricing" className="relative">
        <PricingSection />
        <ReviewsSection />
        <FaqSection />
      </div>

      {/* Footer - Navy Theme */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-navy-900 dark:bg-navy-950 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">
                Template1
              </h3>
              <p className="text-navy-300 mb-4 max-w-md">
                The modern platform for teams who want to build, ship, and scale their SaaS applications faster than ever before.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-navy-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-navy-300 hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/blog" className="text-navy-300 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-navy-300 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-navy-300 hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/privacy" className="text-navy-300 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-navy-800 mt-8 pt-8 text-center">
            <p className="text-navy-400">© 2025 Template1. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
