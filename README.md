
# 🚀 SaaS Boilerplate - Premium Starter Kit

**Build, ship, and scale your SaaS faster than ever before**

A complete, production-ready SaaS boilerplate that saves you weeks of development time. Built with modern technologies and best practices, this starter kit includes everything you need to launch your SaaS business.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🎯 Getting Started with Lovable

**The fastest way to use this template is with Lovable! Follow these simple steps:**

### Quick Integration Method (Recommended)

1. **Create a New Lovable Project**
   - Go to [Lovable](https://lovable.dev) and create a new project
   - Start with any minimal template (the content will be replaced)

2. **Connect to GitHub**
   - In your Lovable project, click the GitHub button
   - Connect your GitHub account and create a new repository
   - **Make sure the new repository is set to PUBLIC**

3. **Force Push Template Code**
   - Clone the private template repository locally:
   ```bash
   git clone https://github.com/nevaubi/uiarcade-template1
   cd uiarcade-template1
   ```
   
   - Add your new Lovable-connected repository as a remote:
   ```bash
   git remote add lovable https://github.com/yourusername/your-new-lovable-repo.git
   ```
   
   - Force push the template code to your new repository:
   ```bash
   git push lovable main --force
   ```

4. **Automatic Sync**
   - Lovable will automatically detect the changes and sync the new code
   - You now have the full SaaS template in your Lovable project!

5. **Configure Your Project**
   - Follow the configuration steps below to set up Supabase and Stripe
   - Start customizing your SaaS application

---

## ✨ What's Included

### 🔐 Complete Authentication System
- Email/password authentication with Supabase Auth
- Google OAuth integration with UI components
- Protected routes and session management
- User profile management with avatar support
- Secure authentication flow with proper error handling
- Admin user management and suspension capabilities

### 💳 Stripe Payment Integration
- Subscription management (Basic, Pro, Enterprise tiers)
- Monthly & Annual Plans with custom pricing
- End-to-end Customer portal for subscription management
- Real-time subscription status updates (cancels, upgrades, payment method changes, etc)
- No webhooks required - simplified implementation
- Stripe checkout and customer portal integration
- Rate limiting and payment security

### 🤖 AI-Powered Features
- **Smart AI Chatbot** with customizable personality and responses
- **Document Processing** - Upload and process PDFs, Word docs, and text files
- **Vector Database Integration** with Upstash for semantic search
- **OpenAI Integration** with configurable models and creativity levels
- **Intelligent Chat** with context-aware responses and citations
- **Document Chunking** for efficient AI processing

### 📝 Content Management System
- **Blog Management** with rich editor and SEO features
- **Scheduled Publishing** with automatic post publication
- **SEO Optimization** with meta tags, descriptions, and canonical URLs
- **Content Analytics** and performance tracking
- **Dynamic Sitemap Generation** for better search engine indexing

### 👑 Advanced Admin Panel
- **User Management** - View, search, and manage all users
- **Subscription Analytics** with visual charts and metrics
- **Content Management** - Blog posts, chatbot configuration
- **Document Management** - Upload, organize, and process documents
- **System Configuration** - Email templates, chatbot settings
- **Data Export** functionality for analytics and reporting

### 🎨 Modern UI/UX
- Beautiful, screen responsive design with Tailwind CSS
- shadcn/ui component library with custom variants
- Animated landing page with premium feel
- Mobile-first responsive design
- Dark/light theme support
- Custom toast notifications and error handling

### 🗄️ Database & Backend
- Supabase backend with PostgreSQL database
- Row-Level Security (RLS) policies for all tables
- Real-time subscriptions and data synchronization
- Edge functions for secure operations
- Complete database schema with relationships
- Automated email notifications and welcome flows

### 🚀 Developer Experience
- TypeScript for type safety
- React Query for efficient data fetching
- Modern React Router setup
- ESLint and Prettier configured
- Optimized build with Vite
- Comprehensive error boundaries and debugging tools

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **AI**: OpenAI GPT models, Upstash Vector Database
- **Payments**: Stripe Checkout & Customer Portal
- **Email**: Resend for transactional emails
- **Deployment**: Vercel (configured)
- **State Management**: React Query, React Context
- **File Processing**: PDF.js, Mammoth.js for document processing

## 🚀 Quick Start

### Prerequisites

- A Supabase account and project
- A Stripe account
- OpenAI API key (for AI features)
- Resend account (for email features)
- Upstash Vector Database account (for AI search)

### 1. Set Up Your Supabase Project

1. Create a new project at [Supabase](https://supabase.com/)
2. **Update the Supabase client configuration** in `src/integrations/supabase/client.ts`:
   ```typescript
   const supabaseUrl = "YOUR_SUPABASE_PROJECT_URL";
   const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";
   ```

### 2. Database Migration

Run the complete database migration in your Supabase SQL editor (see Database Schema section below for full migration code).

### 3. Configure Edge Function Secrets

In your Supabase project settings → Edge Functions, add these secrets:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `OPENAI_API_KEY`: Your OpenAI API key
- `RESEND_API_KEY`: Your Resend API key
- `UPSTASH_VECTOR_REST_URL`: Your Upstash Vector REST URL
- `UPSTASH_VECTOR_REST_TOKEN`: Your Upstash Vector REST token
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 4. Configure Authentication

1. In Supabase Dashboard → Authentication → Providers
2. Enable Email provider and configure Google OAuth (optional)
3. Update Site URL and redirect URLs for your domain

### 5. Stripe Configuration

1. Create a Stripe account at [Stripe](https://stripe.com/)
2. Add your Stripe Secret Key to Supabase Edge Function secrets
3. Configure your pricing tiers in the PricingSection component
4. Test with Stripe's test mode before going live

## 📊 Complete Database Schema

Run this complete SQL migration in your Supabase SQL editor to set up all required tables:

```sql
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active',
  suspended_at TIMESTAMPTZ,
  suspended_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscribers table for subscription management
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancellation_status TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create blog_posts table for content management
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'Admin',
  category TEXT DEFAULT 'General',
  image_url TEXT,
  read_time TEXT DEFAULT '5 min read',
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chatbot_config table for AI chatbot settings
CREATE TABLE public.chatbot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_name TEXT DEFAULT 'AI Assistant',
  description TEXT DEFAULT 'Your helpful AI assistant',
  personality TEXT DEFAULT 'professional',
  role TEXT DEFAULT 'Customer Support Specialist',
  custom_instructions TEXT DEFAULT '',
  response_style TEXT DEFAULT 'conversational',
  max_response_length TEXT DEFAULT 'medium',
  creativity_level INTEGER DEFAULT 30,
  fallback_response TEXT DEFAULT 'I apologize, but I don''t have enough information to answer that question.',
  current_status TEXT DEFAULT 'draft',
  include_citations BOOLEAN DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create document_chunks table for AI document processing
CREATE TABLE public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  word_count INTEGER NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create email_configs table for email templates
CREATE TABLE public.email_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_type TEXT NOT NULL,
  template_subject TEXT DEFAULT 'Welcome to our platform!',
  template_html TEXT NOT NULL,
  from_name TEXT DEFAULT 'Our Team',
  enabled BOOLEAN DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rate_limits table for API rate limiting
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_admin 
     FROM public.subscribers 
     WHERE email = auth.email() 
     LIMIT 1), 
    false
  );
$$;

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create comprehensive RLS policies (sample - add all policies for each table)
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Subscribers policies
CREATE POLICY "Users can view their own subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

-- Blog posts policies
CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all posts" ON public.blog_posts
  FOR ALL USING (is_current_user_admin());

-- Admin policies for other tables
CREATE POLICY "Admins can manage chatbot config" ON public.chatbot_config
  FOR ALL USING (is_current_user_admin());

CREATE POLICY "Admins can manage document chunks" ON public.document_chunks
  FOR ALL USING (is_current_user_admin());

-- Create storage bucket for chatbot documents
INSERT INTO storage.buckets (id, name, public) VALUES ('chatbot-documents', 'chatbot-documents', false);

-- Create storage policies for document uploads
CREATE POLICY "Admins can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chatbot-documents' AND is_current_user_admin());

CREATE POLICY "Admins can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'chatbot-documents' AND is_current_user_admin());
```

## 🔧 Edge Functions

This template includes several pre-built Edge Functions for different functionalities:

### Payment & Subscription Functions
- **`create-checkout`**: Creates Stripe checkout sessions for subscriptions
- **`customer-portal`**: Manages Stripe customer portal sessions
- **`check-subscription`**: Verifies and updates subscription status
- **`stripe-webhook`**: Handles Stripe webhook events (optional)

### AI & Chat Functions
- **`chat-with-ai`**: Handles AI chat interactions with OpenAI
- **`process-document`**: Processes uploaded documents for AI search
- **`vector-embed`**: Creates vector embeddings for semantic search
- **`chatbot-config`**: Manages chatbot configuration
- **`chatbot-status`**: Returns public chatbot status

### Content & Communication Functions
- **`generate-sitemap`**: Automatically generates XML sitemaps
- **`publish-scheduled-posts`**: Publishes scheduled blog posts
- **`send-welcome-email`**: Sends welcome emails to new users

### Required API Keys & Configuration

Add these secrets in your Supabase project settings → Edge Functions:

**Core Services:**
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `OPENAI_API_KEY`: Your OpenAI API key
- `RESEND_API_KEY`: Your Resend API key

**Vector Database:**
- `UPSTASH_VECTOR_REST_URL`: Your Upstash Vector REST URL
- `UPSTASH_VECTOR_REST_TOKEN`: Your Upstash Vector REST token

**Supabase Configuration:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SUPABASE_DB_URL`: Your Supabase database URL

**Optional:**
- `STRIPE_WEBHOOK_SECRET`: For webhook validation (if using webhooks)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── admin/          # Admin panel components
│   │   ├── AdminPanel.tsx      # Main admin dashboard
│   │   ├── BlogManager.tsx     # Blog post management
│   │   ├── ChatbotPanel.tsx    # AI chatbot configuration
│   │   ├── DocumentManager.tsx # Document upload/management
│   │   ├── UserDetailsModal.tsx # User management
│   │   └── VisualAnalytics.tsx # Analytics dashboard
│   ├── AuthButton.tsx  # Authentication button with Google OAuth
│   ├── ChatWidget.tsx  # AI chatbot interface
│   ├── PricingSection.tsx # Pricing display & checkout
│   ├── ProtectedRoute.tsx # Route protection
│   ├── FaqSection.tsx  # FAQ component
│   └── ReviewsSection.tsx # Customer reviews
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state management
│   └── ChatbotContext.tsx # Chatbot state management
├── hooks/             # Custom React hooks
│   ├── useSubscription.tsx # Subscription management
│   ├── useChatbotConfig.tsx # Chatbot configuration
│   ├── useDocuments.tsx # Document management
│   ├── useRateLimit.tsx # API rate limiting
│   └── use-toast.ts   # Toast notifications
├── pages/             # Application pages
│   ├── Index.tsx      # Landing page with hero section
│   ├── Auth.tsx       # Login/signup page
│   ├── Dashboard.tsx  # Protected dashboard
│   ├── Pricing.tsx    # Pricing page
│   ├── Blog.tsx       # Blog listing page
│   ├── BlogPost.tsx   # Individual blog post
│   ├── Privacy.tsx    # Privacy policy page
│   └── NotFound.tsx   # 404 error page
├── integrations/      # Third-party integrations
│   └── supabase/      # Supabase client & types
│       ├── client.ts  # Supabase client configuration
│       └── types.ts   # Database type definitions
├── services/          # Service layer
│   └── vectorService.ts # Vector database operations
├── utils/             # Utility functions
│   ├── documentProcessor.ts # Document processing utilities
│   ├── csvExport.ts   # Data export functionality
│   └── subscriptionCache.ts # Subscription caching
└── supabase/          # Supabase configuration
    ├── functions/     # Edge Functions
    │   ├── chat-with-ai/
    │   ├── process-document/
    │   ├── create-checkout/
    │   ├── customer-portal/
    │   ├── check-subscription/
    │   └── ... (other functions)
    ├── migrations/    # Database migrations
    └── config.toml    # Supabase configuration
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to Vercel**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect it's a Vite project

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy**
   - Click Deploy! (No environment variables needed for Lovable projects)

The project includes a `vercel.json` configuration for optimal deployment.

### Alternative Deployment Options

- **Netlify**: Drag and drop the `dist` folder after running `npm run build`
- **GitHub Pages**: Use the included GitHub Actions workflow
- **Self-hosted**: Deploy the `dist` folder to any static hosting

### Post-Deployment Checklist

1. **Update Supabase Auth Settings**
   - Add your production domain to Site URL
   - Configure redirect URLs in Authentication settings

2. **Configure Stripe**
   - Update webhook endpoints with your production URL
   - Test payment flows in Stripe test mode
   - Switch to Stripe live mode when ready

3. **Test Core Features**
   - User authentication and registration
   - Subscription checkout and management
   - AI chatbot functionality
   - Admin panel access (if applicable)

## 📖 Customization Guide

### 🎨 Branding & Design

**Update Brand Identity:**
```typescript
// src/pages/Index.tsx - Update hero section
const heroTitle = "Your SaaS Name";
const heroSubtitle = "Your unique value proposition";

// tailwind.config.ts - Custom colors
extend: {
  colors: {
    primary: "hsl(var(--primary))",
    // Add your brand colors
  }
}
```

**Logo & Assets:**
- Replace favicon in `public/favicon.ico`
- Update logo references in components
- Add custom images to `public/` directory

### 💰 Pricing Configuration

**Update Pricing Plans:**
```typescript
// src/components/PricingSection.tsx
const pricingPlans = [
  {
    name: "Basic",
    price: "$9",
    stripePrice: "price_your_basic_price_id",
    features: ["Your features here"]
  },
  // Add more plans
];
```

**Stripe Integration:**
1. Create products in Stripe Dashboard
2. Copy price IDs to your pricing component
3. Update checkout function calls

### 🤖 AI Chatbot Customization

**Configure Chatbot Personality:**
- Access admin panel → Chatbot Configuration
- Adjust personality, role, and response style
- Upload custom documents for knowledge base
- Set creativity level and response length

**Document Processing:**
- Upload PDFs, Word docs, or text files
- Documents are automatically chunked and vectorized
- AI uses document content for context-aware responses

### 🔧 Advanced Features

**Add New Protected Routes:**
```typescript
// src/App.tsx
<Route path="/your-feature" element={
  <ProtectedRoute>
    <YourFeatureComponent />
  </ProtectedRoute>
} />
```

**Extend Admin Panel:**
- Add new admin components in `src/components/admin/`
- Update admin navigation
- Create new database tables if needed

**Custom Edge Functions:**
- Create new functions in `supabase/functions/`
- Add function configuration to `supabase/config.toml`
- Use existing functions as templates

## 🆘 Support & Troubleshooting

### 📚 Documentation Links

- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Upstash Vector](https://upstash.com/docs/vector)

### 🔍 Common Issues & Solutions

**Authentication Issues:**
- ✅ Verify Supabase URL and keys in `src/integrations/supabase/client.ts`
- ✅ Check Site URL in Supabase Auth settings
- ✅ Ensure redirect URLs are configured correctly

**Payment Integration Problems:**
- ✅ Verify Stripe secret key in Edge Function secrets
- ✅ Check Stripe webhook endpoint configuration
- ✅ Test with Stripe test mode before going live
- ✅ Ensure price IDs match your Stripe products

**AI Chatbot Not Working:**
- ✅ Verify OpenAI API key in Edge Function secrets
- ✅ Check Upstash Vector database configuration
- ✅ Ensure chatbot status is set to "active"
- ✅ Upload documents to provide context

**Build/Deployment Errors:**
- ✅ Run `npm install` to ensure all dependencies are installed
- ✅ Check for TypeScript errors with `npm run build`
- ✅ Verify Supabase client configuration is correct
- ✅ Check Edge Function logs in Supabase dashboard

**Database Issues:**
- ✅ Ensure all migration SQL has been executed
- ✅ Check Row Level Security policies are configured
- ✅ Verify user permissions for admin functions
- ✅ Review Supabase logs for database errors

### 🛠️ Debugging Tools

**Frontend Debugging:**
- Use browser developer tools console
- Check Network tab for API call failures
- Use React Developer Tools for component debugging

**Backend Debugging:**
- Monitor Supabase Edge Function logs
- Check Supabase Auth logs for authentication issues
- Review database logs for query problems
- Use Stripe Dashboard logs for payment debugging

### 📧 Getting Help

**Before Asking for Help:**
1. Check the browser console for error messages
2. Review Supabase Edge Function logs
3. Verify all required API keys are configured
4. Test with minimal reproduction steps

**Support Channels:**
- Check existing GitHub issues
- Review Supabase community forums
- Consult Stripe documentation
- Use AI assistant for code-related questions

### 🚀 Performance Optimization

**Frontend Performance:**
- Optimize images and assets
- Use lazy loading for heavy components
- Implement proper caching strategies
- Monitor bundle size with build tools

**Backend Performance:**
- Optimize database queries
- Use proper indexing
- Implement caching for frequently accessed data
- Monitor Edge Function performance

**AI Performance:**
- Optimize document chunking strategies
- Use appropriate OpenAI models for your use case
- Implement proper rate limiting
- Cache AI responses when possible

---

**Built with ❤️ for developers who want to ship faster**

*This boilerplate saves you weeks of development time by providing a complete, production-ready foundation for your SaaS business.*
