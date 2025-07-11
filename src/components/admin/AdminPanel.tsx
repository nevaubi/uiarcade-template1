
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Database, Activity, Loader2, RefreshCw, Calendar, Mail, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import UserSearchFilter from './UserSearchFilter';
import DataExport from './DataExport';

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
  created_at: string;
  stripe_customer_id: string;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const { toast } = useToast();

  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      console.log('AdminPanel: Starting data fetch...');
      
      // Fetch user profiles
      console.log('AdminPanel: Fetching user profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('AdminPanel: Error fetching profiles:', profilesError);
        toast({
          title: "Error",
          description: "Failed to load user profiles",
          variant: "destructive",
        });
      } else {
        console.log('AdminPanel: Successfully fetched profiles:', profilesData?.length || 0, 'profiles');
        setUsers(profilesData || []);
      }

      // Fetch subscriber information
      console.log('AdminPanel: Fetching subscriber information...');
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('email, subscribed, subscription_tier, subscription_end, is_admin, created_at, stripe_customer_id')
        .order('created_at', { ascending: false });

      if (subscribersError) {
        console.error('AdminPanel: Error fetching subscribers:', subscribersError);
        toast({
          title: "Error",
          description: "Failed to load subscription data",
          variant: "destructive",
        });
      } else {
        console.log('AdminPanel: Successfully fetched subscribers:', subscribersData?.length || 0, 'subscribers');
        setSubscribers(subscribersData || []);
      }

      console.log('AdminPanel: Data fetch completed successfully');

    } catch (error) {
      console.error('AdminPanel: Error in fetchAdminData:', error);
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
    console.log('AdminPanel: Component mounted, fetching initial data...');
    fetchAdminData();
  }, []);

  // Filtered and sorted users based on search and filter criteria
  const filteredUsers = useMemo(() => {
    console.log('AdminPanel: Filtering users...', {
      totalUsers: users.length,
      searchTerm,
      adminFilter,
      subscriptionFilter,
      sortBy
    });

    let filtered = users.filter(user => {
      const subscriber = subscribers.find(sub => sub.email === user.email);
      
      // Search filter
      const matchesSearch = !searchTerm || 
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Admin filter
      const matchesAdmin = adminFilter === 'all' ||
        (adminFilter === 'admin' && subscriber?.is_admin) ||
        (adminFilter === 'user' && !subscriber?.is_admin);
      
      // Subscription filter
      const matchesSubscription = subscriptionFilter === 'all' ||
        (subscriptionFilter === 'active' && subscriber?.subscribed) ||
        (subscriptionFilter === 'inactive' && !subscriber?.subscribed);
      
      return matchesSearch && matchesAdmin && matchesSubscription;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    console.log('AdminPanel: Filtered users result:', filtered.length, 'users after filtering');
    return filtered;
  }, [users, subscribers, searchTerm, adminFilter, subscriptionFilter, sortBy]);

  const handleClearFilters = () => {
    console.log('AdminPanel: Clearing all filters');
    setSearchTerm('');
    setAdminFilter('all');
    setSubscriptionFilter('all');
    setSortBy('newest');
  };

  const getStats = () => {
    const totalUsers = users.length;
    const adminUsers = subscribers.filter(sub => sub.is_admin).length;
    const totalSubscribers = subscribers.filter(sub => sub.subscribed).length;
    const activeSubscriptions = subscribers.filter(sub => {
      if (!sub.subscription_end) return false;
      return new Date(sub.subscription_end) > new Date();
    }).length;

    console.log('AdminPanel: Stats calculated:', {
      totalUsers,
      adminUsers,
      totalSubscribers,
      activeSubscriptions
    });

    return { totalUsers, adminUsers, totalSubscribers, activeSubscriptions };
  };

  const stats = getStats();

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  const UserTableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-4 w-4" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <UserTableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center">
            <Shield className="h-7 w-7 mr-3 text-primary" />
            Admin Panel
          </h2>
          <p className="text-muted-foreground mt-1">System administration and user management</p>
        </div>
        <Button
          onClick={fetchAdminData}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-600" />
        <StatCard title="Admin Users" value={stats.adminUsers} icon={Shield} color="text-amber-600" />
        <StatCard title="Active Subscribers" value={stats.totalSubscribers} icon={Activity} color="text-green-600" />
        <StatCard title="Database Records" value={users.length + subscribers.length} icon={Database} color="text-purple-600" />
      </div>

      {/* Data Export Section */}
      <DataExport users={users} subscribers={subscribers} />

      {/* Users Management with Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Management
          </CardTitle>
          <CardDescription>
            Search, filter, and manage user accounts ({users.length} total users found)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserSearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            adminFilter={adminFilter}
            onAdminFilterChange={setAdminFilter}
            subscriptionFilter={subscriptionFilter}
            onSubscriptionFilterChange={setSubscriptionFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
            resultCount={filteredUsers.length}
            totalCount={users.length}
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {users.length === 0 ? 'No users found in database' : 'No users match your current filters'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const subscriber = subscribers.find(sub => sub.email === user.email);
                    return (
                      <TableRow key={user.id} className="transition-colors hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{user.full_name || 'No name'}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={subscriber?.is_admin ? "default" : "secondary"}
                            className={subscriber?.is_admin ? "bg-amber-100 text-amber-800 border-amber-300" : ""}
                          >
                            {subscriber?.is_admin ? "Admin" : "User"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subscriber?.subscribed ? "default" : "secondary"}>
                            {subscriber?.subscribed ? "Active" : "Free"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Send Email</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Suspend User</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Subscription Overview
          </CardTitle>
          <CardDescription>
            Monitor user subscriptions and billing ({subscribers.length} total subscribers found)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No subscription data found
                    </TableCell>
                  </TableRow>
                ) : (
                  subscribers.slice(0, 10).map((subscriber, index) => (
                    <TableRow key={subscriber.email + index} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {subscriber.subscription_tier ? `${subscriber.subscription_tier} Plan` : 'No active plan'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant={subscriber.subscribed ? "default" : "secondary"}>
                            {subscriber.subscribed ? "Active" : "Inactive"}
                          </Badge>
                          {subscriber.is_admin && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300">Admin</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {subscriber.subscription_end ? (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(subscriber.subscription_end).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
