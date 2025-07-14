-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT NOT NULL DEFAULT 'Admin',
  category TEXT NOT NULL DEFAULT 'General',
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_time TEXT DEFAULT '5 min read'
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can read published posts
CREATE POLICY "Anyone can view published posts"
ON public.blog_posts
FOR SELECT
USING (is_published = true);

-- Only admins can manage posts
CREATE POLICY "Admins can manage all posts"
ON public.blog_posts
FOR ALL
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data to replace hardcoded posts
INSERT INTO public.blog_posts (title, content, excerpt, author, category, image_url, is_published, publish_date, read_time) VALUES
(
  'Building SaaS Products with React and TypeScript',
  '<p>Building a successful SaaS product requires careful consideration of architecture, user experience, and scalability. In this comprehensive guide, we''ll explore how to leverage React and TypeScript to create robust, maintainable applications that can grow with your business.</p>

<h2>Why React and TypeScript?</h2>
<p>React has become the de facto standard for building modern web applications, offering a component-based architecture that promotes reusability and maintainability. When combined with TypeScript, you get the added benefits of static type checking, better IDE support, and improved developer experience.</p>

<h2>Setting Up Your Development Environment</h2>
<p>Start with a solid foundation by setting up your development environment properly. We recommend using Vite for fast development builds, ESLint for code quality, and Prettier for consistent formatting.</p>

<h2>Component Architecture</h2>
<p>Design your components with reusability in mind. Create a component library that can be shared across your application, ensuring consistency in design and behavior.</p>

<h2>State Management</h2>
<p>Choose the right state management solution for your needs. For most SaaS applications, React''s built-in state management combined with React Query for server state works perfectly.</p>

<h2>Conclusion</h2>
<p>Building SaaS products with React and TypeScript provides a solid foundation for scalable, maintainable applications. Focus on creating reusable components, implementing proper state management, and maintaining high code quality standards.</p>',
  'Learn how to build scalable SaaS products using React and TypeScript with best practices for architecture and development.',
  'Sarah Johnson',
  'Development',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  true,
  '2025-06-20'::timestamp,
  '8 min read'
),
(
  'Complete Guide to Stripe Integration',
  '<p>Integrating payment processing into your SaaS application is crucial for monetization. Stripe provides a comprehensive platform for handling payments, subscriptions, and billing. This guide will walk you through everything you need to know.</p>

<h2>Getting Started with Stripe</h2>
<p>First, create a Stripe account and obtain your API keys. You''ll need both publishable and secret keys for different parts of your integration.</p>

<h2>Setting Up Stripe Elements</h2>
<p>Stripe Elements provides pre-built UI components for collecting payment information securely. These components are PCI-compliant and handle sensitive data without it touching your servers.</p>

<h2>Implementing Subscriptions</h2>
<p>For SaaS applications, subscriptions are often the primary revenue model. Stripe''s subscription system handles recurring billing, proration, and complex pricing scenarios.</p>

<h2>Webhooks and Security</h2>
<p>Implement Stripe webhooks to handle events like successful payments, failed charges, and subscription updates. Always verify webhook signatures to ensure security.</p>

<h2>Best Practices</h2>
<p>Follow Stripe''s best practices for error handling, retry logic, and user experience. Provide clear feedback to users during the payment process.</p>',
  'Everything you need to know about integrating Stripe payments and subscriptions into your SaaS application.',
  'Mike Chen',
  'Payments',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  true,
  '2025-06-18'::timestamp,
  '12 min read'
),
(
  'SaaS Analytics and User Tracking',
  '<p>Understanding your users and tracking key metrics is essential for SaaS success. This guide covers implementing analytics, tracking user behavior, and making data-driven decisions for your product.</p>

<h2>Essential SaaS Metrics</h2>
<p>Learn about Monthly Recurring Revenue (MRR), Customer Acquisition Cost (CAC), Customer Lifetime Value (CLV), and churn rate - the key metrics every SaaS founder should track.</p>

<h2>Implementation Strategy</h2>
<p>Choose the right analytics tools and implement tracking that provides actionable insights without overwhelming your team with data.</p>',
  'Learn how to implement comprehensive analytics and tracking for your SaaS application to make data-driven decisions.',
  'Alex Rodriguez',
  'Analytics',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  false,
  '2025-06-22'::timestamp,
  '10 min read'
);