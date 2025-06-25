import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, User, Calendar, Share2, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';

const BlogPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Sample blog post data (in a real app, this would come from an API)
  const blogPosts = {
    "1": {
      title: "Building SaaS Products with React and TypeScript",
      content: `
        <p>Building a successful SaaS product requires careful consideration of architecture, user experience, and scalability. In this comprehensive guide, we'll explore how to leverage React and TypeScript to create robust, maintainable applications that can grow with your business.</p>

        <h2>Why React and TypeScript?</h2>
        <p>React has become the de facto standard for building modern web applications, offering a component-based architecture that promotes reusability and maintainability. When combined with TypeScript, you get the added benefits of static type checking, better IDE support, and improved developer experience.</p>

        <h2>Setting Up Your Development Environment</h2>
        <p>Start with a solid foundation by setting up your development environment properly. We recommend using Vite for fast development builds, ESLint for code quality, and Prettier for consistent formatting.</p>

        <h2>Component Architecture</h2>
        <p>Design your components with reusability in mind. Create a component library that can be shared across your application, ensuring consistency in design and behavior.</p>

        <h2>State Management</h2>
        <p>Choose the right state management solution for your needs. For most SaaS applications, React's built-in state management combined with React Query for server state works perfectly.</p>

        <h2>Conclusion</h2>
        <p>Building SaaS products with React and TypeScript provides a solid foundation for scalable, maintainable applications. Focus on creating reusable components, implementing proper state management, and maintaining high code quality standards.</p>
      `,
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      author: "Sarah Johnson",
      publishDate: "2025-06-20",
      readTime: "8 min read",
      category: "Development"
    },
    "2": {
      title: "Complete Guide to Stripe Integration",
      content: `
        <p>Integrating payment processing into your SaaS application is crucial for monetization. Stripe provides a comprehensive platform for handling payments, subscriptions, and billing. This guide will walk you through everything you need to know.</p>

        <h2>Getting Started with Stripe</h2>
        <p>First, create a Stripe account and obtain your API keys. You'll need both publishable and secret keys for different parts of your integration.</p>

        <h2>Setting Up Stripe Elements</h2>
        <p>Stripe Elements provides pre-built UI components for collecting payment information securely. These components are PCI-compliant and handle sensitive data without it touching your servers.</p>

        <h2>Implementing Subscriptions</h2>
        <p>For SaaS applications, subscriptions are often the primary revenue model. Stripe's subscription system handles recurring billing, proration, and complex pricing scenarios.</p>

        <h2>Webhooks and Security</h2>
        <p>Implement Stripe webhooks to handle events like successful payments, failed charges, and subscription updates. Always verify webhook signatures to ensure security.</p>

        <h2>Best Practices</h2>
        <p>Follow Stripe's best practices for error handling, retry logic, and user experience. Provide clear feedback to users during the payment process.</p>
      `,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      author: "Mike Chen",
      publishDate: "2025-06-18",
      readTime: "12 min read",
      category: "Payments"
    }
  };

  const post = blogPosts[id as keyof typeof blogPosts];

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="cursor-pointer hover:opacity-80 transition-opacity">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Template1
                </h1>
              </button>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Home
                </Link>
                <Link to="/#features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Features
                </Link>
                <Link to="/#pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link to="/blog" className="text-purple-600 dark:text-purple-400 font-medium">
                  Blog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Back Button */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/blog')} className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </div>
      </div>

      {/* Article */}
      <article className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="relative mb-8 rounded-2xl overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="absolute top-6 left-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {post.category}
              </span>
            </div>
          </div>

          {/* Article Header */}
          <header className="mb-12">
            <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center space-x-6 text-slate-600 dark:text-slate-300">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {post.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {new Date(post.publishDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {post.readTime}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-slate-500 mr-2" />
                <Button variant="ghost" size="sm">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed"
            />
          </div>

          {/* View All Posts Section */}
          <div className="mt-16 pt-16 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer max-w-md mx-auto" onClick={() => navigate('/blog')}>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-2 hover:text-purple-600 transition-colors">
                    View All Posts
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Explore our complete collection of tutorials and insights.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </article>

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
                <li><Link to="/#features" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
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

export default BlogPost;
