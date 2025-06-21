import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
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
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end, 
    loading: subscriptionLoading,
    error: subscriptionError,
    checkoutLoading,
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
      // Refresh subscription status after successful payment with force refresh
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
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: CreditCard, label: 'Billing' },
    { icon: Settings, label: 'Settings' },
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

  const stats = [
    {
      title: 'Current Plan',
      value: getSubscriptionStatus(),
      description: subscribed ? 'Active subscription' : subscriptionError ? 'Failed to load subscription' : 'No active plan',
      icon: TrendingUp,
      color: getSubscriptionColor()
    },
    {
      title: 'Next Billing',
      value: getBillingDate(),
      description: subscribed ? 'Billing date' : 'No billing scheduled',
      icon: Calendar,
      color: 'text-blue-600'
    }
  ];

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
              <p className="text-xs text-gray-500">
                {subscribed ? `${subscription_tier} Member` : 'Free User'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`
                w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${item.active 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
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
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-4"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            </div>
            <div className="flex items-center space-x-4">
              {subscriptionError && (
                <div className="text-sm text-red-600 mr-2">
                  {subscriptionError}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => checkSubscription(true)}
                disabled={subscriptionLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${subscriptionLoading ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
              <Badge variant="outline" className={subscribed ? "text-green-600 border-green-600" : subscriptionError ? "text-red-600 border-red-600" : "text-gray-600 border-gray-600"}>
                {getSubscriptionStatus()}
              </Badge>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'User'}!
            </h3>
            <p className="text-gray-600">
              Here's what's happening with your account today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 gap-6">
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
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {subscribed ? `${subscription_tier} Plan` : 'No Active Plan'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {subscribed 
                          ? `Next billing: ${getBillingDate()}` 
                          : 'Choose a plan to get started'
                        }
                      </p>
                    </div>
                    <Badge className={subscribed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {subscribed ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={handleManageBilling}
                      disabled={portalLoading}
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
                      <Button variant="outline" onClick={() => navigate('/pricing')}>
                        Change Plan
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Quick Actions */}
          <Card className="mt-6">
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
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
