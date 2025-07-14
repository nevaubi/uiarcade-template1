import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  author: string;
  category: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  publish_date: string | null;
  read_time: string | null;
}

const Blog = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('publish_date', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (post: BlogPost) => {
    if (post.is_published) {
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
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="group transition-all duration-500 overflow-hidden border-0 glass-morph backdrop-blur-sm">
                  <div className="relative overflow-hidden">
                    <div className="w-full h-48 bg-muted animate-pulse" />
                  </div>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded animate-pulse" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-12 bg-muted rounded animate-pulse" />
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-10 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : blogPosts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No blog posts available yet.</p>
              </div>
            ) : (
              blogPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="group transition-all duration-500 overflow-hidden border-0 glass-morph backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={post.image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold transition-colors duration-300 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="line-clamp-3 text-slate-600 dark:text-slate-300">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(post.publish_date || post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.read_time}
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full transition-colors group-hover:bg-purple-50 dark:group-hover:bg-purple-950/20"
                    >
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
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