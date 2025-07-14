import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Database, Activity, RefreshCw, Calendar, Mail, MoreHorizontal, BarChart3 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import UserSearchFilter from './UserSearchFilter';
import DataExport from './DataExport';
import VisualAnalytics from './VisualAnalytics';
import UserDetailsModal from './UserDetailsModal';
import SuspendUserModal from './SuspendUserModal';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  status?: string | null;
}

interface SubscriberInfo {
  email: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  is_admin: boolean;
  created_at: string;
  stripe_customer_id: string | null;
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
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [suspendUserOpen, setSuspendUserOpen] = useState(false);
  
  const { toast } = useToast();

  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      console.log('AdminPanel: Starting data fetch...');
      
      // Fetch user profiles
      console.log('AdminPanel: Fetching user profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at, status')
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

  const filteredSubscribers = useMemo(() => {
    console.log('AdminPanel: Filtering active subscribers...');
    
    // Only show active subscribers
    let filtered = subscribers.filter(subscriber => subscriber.subscribed);
    
    // Apply search filter to subscribers as well
    if (searchTerm) {
      filtered = filtered.filter(subscriber => 
        subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply admin filter to subscribers
    if (adminFilter !== 'all') {
      filtered = filtered.filter(subscriber =>
        adminFilter === 'admin' ? subscriber.is_admin : !subscriber.is_admin
      );
    }
    
    console.log('AdminPanel: Filtered active subscribers result:', filtered.length, 'active subscribers');
    return filtered;
  }, [subscribers, searchTerm, adminFilter]);

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
    <Card className="transition-all duration-200 hover:shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</div>
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-48 mb-3" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Skeleton className="h-12 w-64" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-lg">
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
    <div className="space-y-8">
      {/* Admin Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center tracking-tight">
            <Shield className="h-8 w-8 mr-4 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">System administration and user management</p>
        </div>
        <Button
          onClick={fetchAdminData}
          disabled={refreshing}
          variant="outline"
          size="lg"
          className="transition-all duration-200 hover:shadow-md"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Tabs for different admin sections - Moved to top */}
      <Tabs defaultValue="users" className="space-y-8">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
          <TabsTrigger value="users" className="flex items-center gap-2 text-base font-medium">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 text-base font-medium">
            <BarChart3 className="h-4 w-4" />
            Visual Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-8">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-600" />
            <StatCard title="Admin Users" value={stats.adminUsers} icon={Shield} color="text-amber-600" />
            <StatCard title="Active Subscribers" value={stats.totalSubscribers} icon={Activity} color="text-green-600" />
            <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={Database} color="text-purple-600" />
          </div>

          {/* Data Export Section */}
          <DataExport users={users} subscribers={subscribers} />

          {/* Users Management with Data Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold">
                <Users className="h-5 w-5 mr-3" />
                User Management
              </CardTitle>
              <CardDescription className="text-base">
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

              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Subscription</TableHead>
                      <TableHead className="font-semibold">Joined</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
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
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={subscriber?.is_admin ? "default" : "secondary"}
                                  className={subscriber?.is_admin ? "bg-amber-100 text-amber-800 border-amber-300" : ""}
                                >
                                  {subscriber?.is_admin ? "Admin" : "User"}
                                </Badge>
                                {user.status === 'suspended' && (
                                  <Badge variant="destructive" className="text-xs">
                                    Suspended
                                  </Badge>
                                )}
                              </div>
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
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedUser(user);
                                    setUserDetailsOpen(true);
                                  }}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className={user.status === 'suspended' ? "text-green-600" : "text-destructive"}
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setSuspendUserOpen(true);
                                    }}
                                  >
                                    {user.status === 'suspended' ? 'Reactivate User' : 'Suspend User'}
                                  </DropdownMenuItem>
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
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-semibold">
                <Activity className="h-5 w-5 mr-3" />
                Active Subscriptions
              </CardTitle>
              <CardDescription className="text-base">
                Monitor active user subscriptions and billing ({filteredSubscribers.length} active subscribers {searchTerm || adminFilter !== 'all' ? 'matching filters' : 'found'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Plan</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                          {subscribers.filter(s => s.subscribed).length === 0 
                            ? 'No active subscriptions found' 
                            : 'No active subscriptions match your current filters'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscribers.map((subscriber, index) => (
                        <TableRow key={subscriber.email + index} className="transition-colors hover:bg-muted/50">
                          <TableCell className="font-medium">{subscriber.email}</TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {subscriber.subscription_tier ? `${subscriber.subscription_tier} Plan` : 'Active Plan'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge variant="default">Active</Badge>
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
                              <span className="text-sm text-muted-foreground">Ongoing</span>
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
        </TabsContent>

        <TabsContent value="analytics">
          <VisualAnalytics users={users} subscribers={subscribers} loading={loading} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <UserDetailsModal
        user={selectedUser}
        subscriber={selectedUser ? subscribers.find(sub => sub.email === selectedUser.email) || null : null}
        isOpen={userDetailsOpen}
        onClose={() => {
          setUserDetailsOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={() => {
          fetchAdminData();
        }}
      />

      <SuspendUserModal
        user={selectedUser}
        isOpen={suspendUserOpen}
        onClose={() => {
          setSuspendUserOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={() => {
          fetchAdminData();
        }}
      />
    </div>
  );
};

export default AdminPanel;
