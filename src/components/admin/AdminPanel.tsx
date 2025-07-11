import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Database, Activity, Loader2, RefreshCw } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface SubscriberInfo {
  email: string;
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string;
  is_admin: boolean;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to load user profiles",
          variant: "destructive",
        });
      } else {
        setUsers(profilesData || []);
      }

      // Fetch subscriber information
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('email, subscribed, subscription_tier, subscription_end, is_admin')
        .order('created_at', { ascending: false });

      if (subscribersError) {
        console.error('Error fetching subscribers:', subscribersError);
        toast({
          title: "Error",
          description: "Failed to load subscription data",
          variant: "destructive",
        });
      } else {
        setSubscribers(subscribersData || []);
      }

    } catch (error) {
      console.error('Error in fetchAdminData:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const getStats = () => {
    const totalUsers = users.length;
    const adminUsers = subscribers.filter(sub => sub.is_admin).length;
    const totalSubscribers = subscribers.filter(sub => sub.subscribed).length;
    const activeSubscriptions = subscribers.filter(sub => {
      if (!sub.subscription_end) return false;
      return new Date(sub.subscription_end) > new Date();
    }).length;

    return { totalUsers, adminUsers, totalSubscribers, activeSubscriptions };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading admin data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-amber-600" />
            Admin Panel
          </h2>
          <p className="text-gray-600">System administration and user management</p>
        </div>
        <Button
          onClick={fetchAdminData}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Records</CardTitle>
            <Database className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length + subscribers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No users found</p>
            ) : (
              users.map((user) => {
                const subscriber = subscribers.find(sub => sub.email === user.email);
                return (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={subscriber?.is_admin ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-gray-100 text-gray-800"}>
                        {subscriber?.is_admin ? "Admin" : "User"}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Overview</CardTitle>
          <CardDescription>
            Monitor user subscriptions and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscribers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No subscription data found</p>
            ) : (
              subscribers.slice(0, 10).map((subscriber, index) => (
                <div key={subscriber.email + index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{subscriber.email}</p>
                    <p className="text-sm text-gray-600">
                      {subscriber.subscription_tier ? `${subscriber.subscription_tier} Plan` : 'No active plan'}
                    </p>
                    {subscriber.subscription_end && (
                      <p className="text-xs text-gray-500">
                        Expires: {new Date(subscriber.subscription_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={subscriber.subscribed ? "default" : "secondary"}>
                      {subscriber.subscribed ? "Active" : "Inactive"}
                    </Badge>
                    {subscriber.is_admin && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300">Admin</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
