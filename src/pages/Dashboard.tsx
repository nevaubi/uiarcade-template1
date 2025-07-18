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
import EmailManager from '@/components/admin/EmailManager';
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
  Mail
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
      { id: 'blog', icon: PenTool, label: 'Blog Management', active: activeTab === 'blog' },
      { id: 'email', icon: Mail, label: 'Email Management', active: activeTab === 'email' }
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
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
          Welcome back, {user?.email?.split('@')[0] || 'User'}!
        </h3>
        <p className="text-base lg:text-lg text-muted-foreground">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Admin Badge - Enhanced with better styling */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg mr-4">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-amber-800 text-lg">Administrator Access</h4>
              <p className="text-amber-700 font-medium">You have admin privileges on this account.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - Enhanced with better styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {stats.map((stat, index) => (
          <Card key={index} className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-foreground break-words tracking-tight">{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-2 font-medium">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Status - Enhanced with better styling */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-bold flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary" />
            Subscription Status
          </CardTitle>
          <CardDescription className="text-base">
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

      {/* Quick Actions - Enhanced with better styling */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-bold flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-base">
            Frequently used features and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-14 btn-enhanced font-semibold text-base hover:bg-primary/5 border-2" 
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-5 w-5 mr-2" />
              )}
              {subscribed ? 'Manage Billing' : 'Subscribe'}
            </Button>
            <Button variant="outline" className="h-14 btn-enhanced font-semibold text-base hover:bg-primary/5 border-2">
              <Settings className="h-5 w-5 mr-2" />
              Account Settings
            </Button>
            <Button variant="outline" className="h-14 btn-enhanced font-semibold text-base hover:bg-primary/5 border-2">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Usage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlaceholder1Content = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
          Placeholder Tab1
        </h3>
        <p className="text-base lg:text-lg text-muted-foreground">
          This is a placeholder page for Tab1 functionality.
        </p>
      </div>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-bold flex items-center">
            <File className="h-5 w-5 mr-2 text-primary" />
            Sample Content
          </CardTitle>
          <CardDescription className="text-base">
            This is placeholder content for demonstration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-6 border-2 rounded-xl hover:bg-primary/5 transition-all duration-300 feature-card">
              <h4 className="font-bold mb-3 text-lg text-foreground">Feature 1</h4>
              <p className="text-muted-foreground font-medium">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className="p-6 border-2 rounded-xl hover:bg-primary/5 transition-all duration-300 feature-card">
              <h4 className="font-bold mb-3 text-lg text-foreground">Feature 2</h4>
              <p className="text-muted-foreground font-medium">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <div className="p-6 border-2 rounded-xl hover:bg-primary/5 transition-all duration-300 feature-card">
              <h4 className="font-bold mb-3 text-lg text-foreground">Feature 3</h4>
              <p className="text-muted-foreground font-medium">Ut enim ad minim veniam, quis nostrud exercitation.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlaceholder2Content = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
        <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
          Placeholder Tab2
        </h3>
        <p className="text-base lg:text-lg text-muted-foreground">
          This is a placeholder page for Tab2 functionality.
        </p>
      </div>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-bold flex items-center">
            <LayoutGrid className="h-5 w-5 mr-2 text-primary" />
            Configuration Options
          </CardTitle>
          <CardDescription className="text-base">
            Sample configuration settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 border-2 rounded-xl hover:bg-primary/5 transition-all duration-300 feature-card">
              <div>
                <h4 className="font-bold text-lg text-foreground">Setting 1</h4>
                <p className="text-muted-foreground font-medium">Enable or disable this feature</p>
              </div>
              <Button variant="outline" size="lg" className="btn-enhanced font-semibold">Toggle</Button>
            </div>
            <div className="flex items-center justify-between p-6 border-2 rounded-xl hover:bg-primary/5 transition-all duration-300 feature-card">
              <div>
                <h4 className="font-bold text-lg text-foreground">Setting 2</h4>
                <p className="text-muted-foreground font-medium">Configure this option</p>
              </div>
              <Button variant="outline" size="lg" className="btn-enhanced font-semibold">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-6 border-2 rounded-xl hover:bg-primary/5 transition-all duration-300 feature-card">
              <div>
                <h4 className="font-bold text-lg text-foreground">Setting 3</h4>
                <p className="text-muted-foreground font-medium">Manage this preference</p>
              </div>
              <Button variant="outline" size="lg" className="btn-enhanced font-semibold">Manage</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-full bg-gradient-to-br from-background to-muted/20 flex overflow-x-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Enhanced with better styling */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-card to-card/80 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-border/50
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
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-xl transform scale-105 border-l-4 border-primary-foreground/20' 
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:transform hover:scale-[1.02] hover:shadow-md'
                }
                ${(item.id === 'admin' || item.id === 'chatbot' || item.id === 'blog' || item.id === 'email') ? 'border-2 border-amber-300/50' : ''}
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
                 activeTab === 'blog' ? 'Blog Management' :
                 activeTab === 'email' ? 'Email Management' : 'Dashboard'}
                {activeTab === 'admin' && (
                  <Shield className="h-5 w-5 ml-2 text-amber-600" />
                )}
                {activeTab === 'chatbot' && (
                  <Bot className="h-5 w-5 ml-2 text-purple-600" />
                )}
                {activeTab === 'blog' && (
                  <PenTool className="h-5 w-5 ml-2 text-blue-600" />
                )}
                {activeTab === 'email' && (
                  <Mail className="h-5 w-5 ml-2 text-green-600" />
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
          {activeTab === 'email' && isAdmin && <EmailManager />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
