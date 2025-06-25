
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Blog = () => {
  const navigate = useNavigate();

  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "Building SaaS Products with React and TypeScript",
      excerpt: "Learn how to create scalable SaaS applications using modern React patterns and TypeScript for type safety.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      author: "Sarah Johnson",
      publishDate: "2025-06-20",
      readTime: "8 min read",
      category: "Development",
      isPublished: true
    },
    {
      id: 2,
      title: "Complete Guide to Stripe Integration",
      excerpt: "Master payment processing with Stripe, from basic setup to advanced subscription management and webhooks.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      author: "Mike Chen",
      publishDate: "2025-06-18",
      readTime: "12 min read",
      category: "Payments",
      isPublished: true
    },
    {
      id: 3,
      title: "Authentication Best Practices for Modern Apps",
      excerpt: "Coming soon: Learn about implementing secure authentication flows with modern techniques and best practices.",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      author: "Alex Rivera",
      publishDate: "Coming Soon",
      readTime: "10 min read",
      category: "Security",
      isPublished: false
    },
    {
      id: 4,
      title: "Scaling Your SaaS: From MVP to Enterprise",
      excerpt: "Coming soon: Strategic insights on growing your SaaS product and building for enterprise customers.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      author: "Emily Watson",
      publishDate: "Coming Soon",
      readTime: "15 min read",
      category: "Business",
      isPublished: false
    }
  ];

  const handlePostClick = (post: typeof blogPosts[0]) => {
    if (post.isPublished) {
      navigate(`/blog/${post.id}`);
    }
  };

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
                <span className="text-purple-600 dark:text-purple-400 font-medium">
                  Blog
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Our <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Insights, tutorials, and best practices for building amazing SaaS products. 
            Learn from our experience and accelerate your development journey.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Card 
                key={post.id} 
                className={`group transition-all duration-500 overflow-hidden border-0 glass-morph backdrop-blur-sm ${
                  post.isPublished 
                    ? 'hover:shadow-2xl hover:-translate-y-2 cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => handlePostClick(post)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className={`w-full h-48 object-cover transition-transform duration-500 ${
                      post.isPublished ? 'group-hover:scale-105' : 'grayscale'
                    }`}
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`text-white px-3 py-1 rounded-full text-sm font-semibold ${
                      post.isPublished 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                        : 'bg-slate-500'
                    }`}>
                      {post.category}
                    </span>
                  </div>
                  {!post.isPublished && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className={`text-xl font-semibold transition-colors duration-300 line-clamp-2 ${
                    post.isPublished 
                      ? 'group-hover:text-purple-600 dark:group-hover:text-purple-400' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className={`line-clamp-3 ${
                    post.isPublished 
                      ? 'text-slate-600 dark:text-slate-300' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {post.excerpt}
                  </p>
                  
                  <div className={`flex items-center justify-between text-sm ${
                    post.isPublished 
                      ? 'text-slate-500 dark:text-slate-400' 
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {post.isPublished ? new Date(post.publishDate).toLocaleDateString() : post.publishDate}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full transition-colors ${
                      post.isPublished 
                        ? 'group-hover:bg-purple-50 dark:group-hover:bg-purple-950/20' 
                        : 'cursor-not-allowed opacity-60'
                    }`}
                    disabled={!post.isPublished}
                  >
                    {post.isPublished ? 'Read More' : 'Coming Soon'}
                    {post.isPublished && (
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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

export default Blog;
