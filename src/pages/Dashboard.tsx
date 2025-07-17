import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import AdminPanel from '@/components/admin/AdminPanel';
import ChatbotPanel from '@/components/admin/ChatbotPanel';
import BlogManager from '@/components/admin/BlogManager';
import { 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Calendar,
  TrendingUp,
  RefreshCw,
  Loader2,
  File,
  LayoutGrid,
  Shield,
  Bot,
  PenTool,
  Upload,
  BarChart3,
  HelpCircle,
  Clock,
  Database,
  Search,
  Image,
  Video,
  FileText,
  Folder,
  Share,
  Grid3x3,
  List,
  Music,
  Archive,
  Trash,
  Eye,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  const {
    subscribed, 
    subscription_tier, 
    subscription_end, 
    cancel_at_period_end,
    
    is_admin: isAdmin,
    loading: subscriptionLoading,
    error: subscriptionError,
    portalLoading,
    checkSubscription,
    openCustomerPortal 
  } = useSubscription();

  useEffect(() => {
    // Handle success/cancel from Stripe checkout
    if (searchParams.get('success')) {
      toast({
        title: "Payment successful!",
        description: "Your subscription has been activated.",
      });
      setTimeout(() => {
        checkSubscription(true);
      }, 2000);
    }
    if (searchParams.get('canceled')) {
      toast({
        title: "Payment canceled",
        description: "You can try again anytime.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast, checkSubscription]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleManageBilling = async () => {
    if (!subscribed) {
      navigate('/pricing');
      return;
    }

    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', active: activeTab === 'dashboard' },
    { id: 'placeholder1', icon: File, label: 'Placeholder Tab1', active: activeTab === 'placeholder1' },
    { id: 'placeholder2', icon: LayoutGrid, label: 'Placeholder Tab2', active: activeTab === 'placeholder2' },
    ...(isAdmin ? [
      { id: 'admin', icon: Shield, label: 'Admin Panel', active: activeTab === 'admin' },
      { id: 'chatbot', icon: Bot, label: 'Chatbot', active: activeTab === 'chatbot' },
      { id: 'blog', icon: PenTool, label: 'Blog Management', active: activeTab === 'blog' }
    ] : [])
  ];

  const getSubscriptionStatus = () => {
    if (subscriptionLoading) return 'Loading...';
    if (subscriptionError) return 'Error loading';
    if (!subscribed) return 'No subscription';
    return `${subscription_tier} Plan`;
  };

  const getSubscriptionColor = () => {
    if (subscriptionError) return 'text-destructive';
    if (!subscribed) return 'text-muted-foreground';
    return 'text-primary';
  };

  const getBillingDate = () => {
    if (!subscription_end) return 'N/A';
    return new Date(subscription_end).toLocaleDateString();
  };

  const getBillingLabel = () => {
    if (!subscribed) return 'Next Billing';
    if (cancel_at_period_end) return 'Subscription Ends';
    return 'Next Billing';
  };

  const stats = [
    {
      title: 'Current Plan',
      value: getSubscriptionStatus(),
      description: subscribed ? 'Active subscription' : subscriptionError ? 'Failed to load subscription' : 'No active plan',
      icon: TrendingUp,
      color: getSubscriptionColor()
    },
    {
      title: getBillingLabel(),
      value: getBillingDate(),
      description: subscribed ? 
        (cancel_at_period_end ? 'Subscription will end' : 'Billing date') : 
        'No billing scheduled',
      icon: Calendar,
      color: cancel_at_period_end ? 'text-orange-600' : 'text-primary'
    }
  ];

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Close sidebar on mobile when navigation item is clicked
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const renderDashboardContent = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="glass-effect rounded-2xl p-8 border border-primary/20">
        <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
          Welcome back, {user?.email?.split('@')[0] || 'User'}!
        </h3>
        <p className="text-lg lg:text-xl text-muted-foreground">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Admin Badge - iOS-inspired styling */}
      {isAdmin && (
        <div className="glass-effect rounded-2xl p-8 border border-purple/30 card-interactive">
          <div className="flex items-center">
            <div className="p-3 bg-purple/10 rounded-xl mr-6">
              <Shield className="h-8 w-8 text-purple" />
            </div>
            <div>
              <h4 className="font-bold text-purple text-xl">Administrator Access</h4>
              <p className="text-purple/80 font-medium text-lg">You have admin privileges on this account.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - iOS-inspired styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stats.map((stat, index) => (
          <Card key={index} className="feature-card border-0 rounded-2xl overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className="p-3 bg-primary/10 rounded-xl">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl lg:text-4xl font-bold text-foreground break-words tracking-tight">{stat.value}</div>
              <p className="text-base text-muted-foreground mt-3 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Status - iOS-inspired styling */}
      <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl font-bold flex items-center">
            <div className="p-2 bg-primary/10 rounded-xl mr-3">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            Subscription Status
          </CardTitle>
          <CardDescription className="text-lg">
            Your current plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-300 ${
              subscribed 
                ? 'bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20' 
                : 'bg-muted/50 border-muted'
            }`}>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-foreground truncate text-lg">
                  {subscribed ? `${subscription_tier} Plan` : 'No Active Plan'}
                </h4>
                <p className="text-muted-foreground break-words font-medium">
                  {subscribed 
                    ? (cancel_at_period_end 
                        ? `Subscription ends: ${getBillingDate()}` 
                        : `Next billing: ${getBillingDate()}`)
                    : 'Choose a plan to get started'
                  }
                </p>
              </div>
              <Badge className={`${
                subscribed 
                  ? (cancel_at_period_end 
                      ? "bg-orange-100 text-orange-800 border-orange-200" 
                      : "bg-green-100 text-green-800 border-green-200") 
                  : "bg-muted text-muted-foreground"
              } flex-shrink-0 ml-4 px-3 py-1 font-semibold`}>
                {subscribed 
                  ? (cancel_at_period_end ? 'Canceling' : 'Active') 
                  : 'Inactive'}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Button 
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="w-full sm:w-auto btn-enhanced h-12 px-6 font-semibold"
                size="lg"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  subscribed ? 'Manage Billing' : 'Choose Plan'
                )}
              </Button>
              {subscribed && (
                <Button variant="outline" onClick={() => navigate('/pricing')} className="w-full sm:w-auto btn-enhanced h-12 px-6 font-semibold" size="lg">
                  Change Plan
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - iOS-inspired styling */}
      <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
        <CardHeader className="pb-8">
          <CardTitle className="text-2xl font-bold flex items-center">
            <div className="p-2 bg-primary/10 rounded-xl mr-3">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            Quick Actions
          </CardTitle>
          <CardDescription className="text-lg">
            Frequently used features and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button 
              variant="outline" 
              className="h-16 btn-enhanced font-semibold text-lg hover:bg-primary/5 border-2 rounded-xl" 
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="h-6 w-6 mr-3 animate-spin" />
              ) : (
                <CreditCard className="h-6 w-6 mr-3" />
              )}
              {subscribed ? 'Manage Billing' : 'Subscribe'}
            </Button>
            <Button variant="outline" className="h-16 btn-enhanced font-semibold text-lg hover:bg-primary/5 border-2 rounded-xl">
              <Settings className="h-6 w-6 mr-3" />
              Account Settings
            </Button>
            <Button variant="outline" className="h-16 btn-enhanced font-semibold text-lg hover:bg-primary/5 border-2 rounded-xl">
              <TrendingUp className="h-6 w-6 mr-3" />
              View Usage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlaceholder1Content = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
          Quick Actions Hub
        </h3>
        <p className="text-base lg:text-lg text-muted-foreground">
          Welcome back, {user?.email?.split('@')[0] || 'User'}! Access your most used features quickly.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 rounded-2xl card-interactive hover-scale cursor-pointer" style={{ background: 'var(--gradient-card)' }}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Upload Document</h4>
            <p className="text-sm text-muted-foreground">Add new documents to your collection</p>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-2xl card-interactive hover-scale cursor-pointer" style={{ background: 'var(--gradient-card)' }}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">View Reports</h4>
            <p className="text-sm text-muted-foreground">Check your analytics and insights</p>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-2xl card-interactive hover-scale cursor-pointer" style={{ background: 'var(--gradient-card)' }}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Account Settings</h4>
            <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-2xl card-interactive hover-scale cursor-pointer" style={{ background: 'var(--gradient-card)' }}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h4 className="font-bold text-lg text-foreground mb-2">Help & Support</h4>
            <p className="text-sm text-muted-foreground">Get assistance and documentation</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Overview */}
        <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold flex items-center">
              <div className="p-2 bg-primary/10 rounded-xl mr-3">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-primary mr-3" />
                  <span className="font-semibold text-foreground">Subscription</span>
                </div>
                <Badge className={subscribed ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}>
                  {subscribed ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-primary mr-3" />
                  <span className="font-semibold text-foreground">Storage Used</span>
                </div>
                <span className="text-sm text-muted-foreground">2.4 GB / 10 GB</span>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Storage Usage</span>
                  <span className="text-sm text-muted-foreground">24%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '24%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold flex items-center">
              <div className="p-2 bg-primary/10 rounded-xl mr-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Upload className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Document uploaded</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Settings updated</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Report generated</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <HelpCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Help article viewed</p>
                  <p className="text-xs text-muted-foreground">1 week ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPlaceholder2Content = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Search & View Toggle */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
              Content Library & Media Center
            </h3>
            <p className="text-base lg:text-lg text-muted-foreground">
              Manage your files, media, and content in one place
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files..."
                className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
              />
            </div>
            <Button variant="outline" size="sm" className="border-2">
              <Grid3x3 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button variant="outline" size="sm" className="border-2">
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Content Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <File className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">1,247</div>
            <p className="text-sm text-muted-foreground">Total Files</p>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-purple" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">2.4 GB</div>
            <p className="text-sm text-muted-foreground">Storage Used</p>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">48</div>
            <p className="text-sm text-muted-foreground">This Month</p>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-foreground mb-2">12</div>
            <p className="text-sm text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Media Gallery Grid */}
      <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-bold flex items-center">
            <div className="p-2 bg-primary/10 rounded-xl mr-3">
              <Image className="h-5 w-5 text-primary" />
            </div>
            Media Gallery
          </CardTitle>
          <CardDescription className="text-base">
            Your recent uploads and media files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover-scale cursor-pointer">
              <div className="aspect-video flex items-center justify-center p-8">
                <Image className="h-16 w-16 text-primary/60" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h4 className="font-semibold text-sm">Project Screenshots</h4>
                <p className="text-xs text-white/80">12 images</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 hover-scale cursor-pointer">
              <div className="aspect-video flex items-center justify-center p-8">
                <Video className="h-16 w-16 text-primary/60" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h4 className="font-semibold text-sm">Tutorial Videos</h4>
                <p className="text-xs text-white/80">8 videos</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 hover-scale cursor-pointer">
              <div className="aspect-video flex items-center justify-center p-8">
                <FileText className="h-16 w-16 text-primary/60" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h4 className="font-semibold text-sm">Documents</h4>
                <p className="text-xs text-white/80">24 files</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover-scale cursor-pointer">
              <div className="aspect-video flex items-center justify-center p-8">
                <Music className="h-16 w-16 text-primary/60" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h4 className="font-semibold text-sm">Audio Files</h4>
                <p className="text-xs text-white/80">16 tracks</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500/20 to-green-500/20 hover-scale cursor-pointer">
              <div className="aspect-video flex items-center justify-center p-8">
                <Archive className="h-16 w-16 text-primary/60" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h4 className="font-semibold text-sm">Archives</h4>
                <p className="text-xs text-white/80">6 packages</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 hover-scale cursor-pointer">
              <div className="aspect-video flex items-center justify-center p-8">
                <Folder className="h-16 w-16 text-primary/60" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h4 className="font-semibold text-sm">Other Files</h4>
                <p className="text-xs text-white/80">32 items</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Type Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Type Breakdown */}
        <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold flex items-center">
              <div className="p-2 bg-primary/10 rounded-xl mr-3">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              File Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Images</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">45%</span>
                  <span className="text-sm font-semibold">562</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Documents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">30%</span>
                  <span className="text-sm font-semibold">374</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Videos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">15%</span>
                  <span className="text-sm font-semibold">187</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Other</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">10%</span>
                  <span className="text-sm font-semibold">124</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold flex items-center">
              <div className="p-2 bg-primary/10 rounded-xl mr-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Upload className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">presentation.pdf uploaded</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Complete</Badge>
              </div>

              <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">design-mockup.jpg viewed</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Viewed</Badge>
              </div>

              <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Share className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">project-files.zip shared</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">Shared</Badge>
              </div>

              <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">video-tutorial.mp4 processing</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Processing</Badge>
              </div>

              <div className="flex items-center p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <Trash className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">old-backup.zip deleted</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
                <Badge className="bg-red-100 text-red-800">Deleted</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Upload Area */}
      <Card className="border-0 rounded-2xl card-interactive" style={{ background: 'var(--gradient-card)' }}>
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-bold flex items-center">
            <div className="p-2 bg-primary/10 rounded-xl mr-3">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            Quick Upload
          </CardTitle>
          <CardDescription className="text-base">
            Upload new files or drag and drop them here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">Drag and drop files here</p>
            <p className="text-sm text-muted-foreground mb-6">or click to browse</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="btn-enhanced">
                <Image className="h-4 w-4 mr-2" />
                Images
              </Button>
              <Button variant="outline" className="btn-enhanced">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </Button>
              <Button variant="outline" className="btn-enhanced">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Button>
              <Button variant="outline" className="btn-enhanced">
                <File className="h-4 w-4 mr-2" />
                All Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-full flex overflow-x-hidden" style={{ background: 'var(--gradient-subtle)' }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - iOS-inspired styling */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 sidebar-solid transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border/50">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Template1
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-primary/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* User Profile Section - Enhanced */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg">
                {user?.email ? getInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {user?.email || 'User'}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-muted-foreground font-medium">
                  {subscribed ? `${subscription_tier} Member` : 'Free User'}
                </p>
                {isAdmin && (
                  <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-300 font-semibold">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Enhanced */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`
                w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 will-change-transform
                ${item.active 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transform scale-105' 
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:transform hover:scale-105'
                }
                ${(item.id === 'admin' || item.id === 'chatbot' || item.id === 'blog') ? 'border-2 border-amber-300/50' : ''}
              `}
            >
              <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout Button - Enhanced */}
        <div className="p-4 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive/10 font-semibold h-12 rounded-xl transition-all duration-300"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full min-w-0 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate flex items-center">
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'placeholder1' ? 'Placeholder Tab1' : 
                 activeTab === 'placeholder2' ? 'Placeholder Tab2' :
                 activeTab === 'admin' ? 'Admin Panel' : 
                 activeTab === 'chatbot' ? 'Chatbot' :
                 activeTab === 'blog' ? 'Blog Management' : 'Dashboard'}
                {activeTab === 'admin' && (
                  <Shield className="h-5 w-5 ml-2 text-amber-600" />
                )}
                {activeTab === 'chatbot' && (
                  <Bot className="h-5 w-5 ml-2 text-purple-600" />
                )}
                {activeTab === 'blog' && (
                  <PenTool className="h-5 w-5 ml-2 text-blue-600" />
                )}
              </h2>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
              {subscriptionError && (
                <div className="text-xs lg:text-sm text-red-600 mr-1 lg:mr-2 hidden sm:block">
                  {subscriptionError}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => checkSubscription(true)}
                disabled={subscriptionLoading}
                className="hidden sm:flex"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${subscriptionLoading ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
              <Badge variant="outline" className={subscribed ? "text-green-600 border-green-600" : subscriptionError ? "text-red-600 border-red-600" : "text-gray-600 border-gray-600"}>
                <span className="hidden sm:inline">{getSubscriptionStatus()}</span>
                <span className="sm:hidden">{subscribed ? 'Active' : 'Inactive'}</span>
              </Badge>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-6 w-full">
          {activeTab === 'dashboard' && renderDashboardContent()}
          {activeTab === 'placeholder1' && renderPlaceholder1Content()}
          {activeTab === 'placeholder2' && renderPlaceholder2Content()}
          {activeTab === 'admin' && isAdmin && <AdminPanel />}
          {activeTab === 'chatbot' && isAdmin && <ChatbotPanel />}
          {activeTab === 'blog' && isAdmin && <BlogManager />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
