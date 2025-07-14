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
  PenTool
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
    if (subscriptionError) return 'text-red-600';
    if (!subscribed) return 'text-gray-600';
    return 'text-green-600';
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
      color: cancel_at_period_end ? 'text-orange-600' : 'text-blue-600'
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'User'}!
        </h3>
        <p className="text-sm lg:text-base text-gray-600">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Admin Badge - Updated to gold color scheme */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-amber-600 mr-2" />
            <div>
              <h4 className="font-semibold text-amber-800">Administrator Access</h4>
              <p className="text-sm text-amber-700">You have admin privileges on this account.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-gray-900 break-words">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>
            Your current plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              subscribed 
                ? 'bg-gradient-to-r from-purple-50 to-blue-50' 
                : 'bg-gray-50'
            }`}>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 truncate">
                  {subscribed ? `${subscription_tier} Plan` : 'No Active Plan'}
                </h4>
                <p className="text-sm text-gray-600 break-words">
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
                      ? "bg-orange-100 text-orange-800" 
                      : "bg-green-100 text-green-800") 
                  : "bg-gray-100 text-gray-800"
              } flex-shrink-0 ml-2`}>
                {subscribed 
                  ? (cancel_at_period_end ? 'Canceling' : 'Active') 
                  : 'Inactive'}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button 
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="w-full sm:w-auto"
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
                <Button variant="outline" onClick={() => navigate('/pricing')} className="w-full sm:w-auto">
                  Change Plan
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used features and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-12" 
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {subscribed ? 'Manage Billing' : 'Subscribe'}
            </Button>
            <Button variant="outline" className="h-12">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
            <Button variant="outline" className="h-12">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Usage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlaceholder1Content = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
          Placeholder Tab1
        </h3>
        <p className="text-sm lg:text-base text-gray-600">
          This is a placeholder page for Tab1 functionality.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sample Content</CardTitle>
          <CardDescription>
            This is placeholder content for demonstration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Feature 1</h4>
              <p className="text-sm text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Feature 2</h4>
              <p className="text-sm text-gray-600">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Feature 3</h4>
              <p className="text-sm text-gray-600">Ut enim ad minim veniam, quis nostrud exercitation.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPlaceholder2Content = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
          Placeholder Tab2
        </h3>
        <p className="text-sm lg:text-base text-gray-600">
          This is a placeholder page for Tab2 functionality.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Options</CardTitle>
          <CardDescription>
            Sample configuration settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Setting 1</h4>
                <p className="text-sm text-gray-600">Enable or disable this feature</p>
              </div>
              <Button variant="outline" size="sm">Toggle</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Setting 2</h4>
                <p className="text-sm text-gray-600">Configure this option</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Setting 3</h4>
                <p className="text-sm text-gray-600">Manage this preference</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-full bg-gray-50 flex overflow-x-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Template1
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                {user?.email ? getInitials(user.email) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || 'User'}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500">
                  {subscribed ? `${subscription_tier} Member` : 'Free User'}
                </p>
                {isAdmin && (
                  <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`
                w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${item.active 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
                ${(item.id === 'admin' || item.id === 'chatbot' || item.id === 'blog') ? 'border border-amber-300' : ''}
              `}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
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
