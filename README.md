
# 🚀 SaaS Boilerplate - Premium Starter Kit

**Build, ship, and scale your SaaS faster than ever before**

A complete, production-ready SaaS boilerplate that saves you weeks of development time. Built with modern technologies and best practices, this starter kit includes everything you need to launch your SaaS business.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## ✨ What's Included

### 🔐 Complete Authentication System
- Email/password authentication with Supabase Auth
- Protected routes and session management
- User profile management
- Secure authentication flow with proper error handling

### 💳 Stripe Payment Integration
- Subscription management (Basic, Pro, Enterprise tiers)
- One-time payments support
- Customer portal for subscription management
- Real-time subscription status updates
- No webhooks required - simplified implementation

### 🎨 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- shadcn/ui component library
- Dark mode support ready
- Animated landing page with premium feel
- Mobile-first responsive design

### 🗄️ Database & Backend
- Supabase backend with PostgreSQL database
- Row-Level Security (RLS) policies
- Real-time subscriptions
- Edge functions for secure operations

### 🚀 Developer Experience
- TypeScript for type safety
- React Query for efficient data fetching
- Modern React Router setup
- ESLint and Prettier configured
- Optimized build with Vite

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Stripe Checkout & Customer Portal
- **Deployment**: Vercel (configured)
- **State Management**: React Query, React Context

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- A Stripe account
- Git

### 1. Clone and Install

```bash
git clone <your-repository-url>
cd your-saas-project
npm install
```

### 2. Environment Setup

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Configuration

1. Create a new project at [Supabase](https://supabase.com/)
2. Copy your project URL and anon key to your `.env.local`
3. Run the database migrations (see Database Setup below)
4. Configure your Supabase Edge Functions with secrets

### 4. Stripe Configuration

1. Create a Stripe account at [Stripe](https://stripe.com/)
2. Add your Stripe Secret Key to Supabase Edge Function secrets
3. Configure your pricing tiers in the PricingSection component
4. Test with Stripe's test mode before going live

### 5. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see your SaaS boilerplate in action!

## ⚙️ Configuration

### Database Setup

Your Supabase project needs the following table for subscription management:

```sql
-- Create subscribers table
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT WITH CHECK (true);
```

### Edge Function Secrets

Configure these secrets in your Supabase project settings:

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Stripe Webhooks (Optional)

While not required for basic functionality, you can set up webhooks for advanced payment handling:

- Endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- Events: `invoice.payment_succeeded`, `customer.subscription.deleted`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AuthButton.tsx  # Authentication button
│   ├── PricingSection.tsx # Pricing display & checkout
│   └── ProtectedRoute.tsx # Route protection
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── hooks/             # Custom React hooks
│   ├── useSubscription.tsx # Subscription management
│   └── use-toast.ts   # Toast notifications
├── pages/             # Application pages
│   ├── Index.tsx      # Landing page
│   ├── Auth.tsx       # Login/signup page
│   ├── Dashboard.tsx  # Protected dashboard
│   └── Pricing.tsx    # Pricing page
├── integrations/      # Third-party integrations
│   └── supabase/      # Supabase client & types
└── utils/             # Utility functions
```

## 🚀 Deployment

### Deploy to Vercel

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy!

The project includes a `vercel.json` configuration for optimal deployment.

### Post-Deployment

1. Update your Supabase Auth settings with your production URL
2. Configure Stripe webhooks with your production endpoint
3. Test your payment flows in Stripe test mode
4. Switch to Stripe live mode when ready

## 📖 Customization

### Branding
- Update the app name in `src/pages/Index.tsx`
- Modify colors in `tailwind.config.ts`
- Replace logo and favicons in the `public/` directory

### Pricing
- Edit pricing plans in `src/components/PricingSection.tsx`
- Update Stripe price IDs for your products
- Customize subscription tiers and features

### Features
- Add new protected routes in `src/App.tsx`
- Extend the dashboard with your SaaS features
- Customize the landing page content

## 🆘 Support & Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Common Issues
- **Authentication not working**: Check your Supabase URL and keys
- **Payments failing**: Verify Stripe secret key in Edge Function secrets
- **Build errors**: Ensure all dependencies are installed with `npm install`

### Getting Help
- Check the browser console for error messages
- Review Supabase Edge Function logs
- Verify your environment variables are set correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for developers who want to ship faster**

*This boilerplate saves you weeks of development time by providing a complete, production-ready foundation for your SaaS business.*
