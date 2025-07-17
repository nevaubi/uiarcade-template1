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
      
      // Fetch user profiles
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
        setUsers(profilesData || []);
      }

      // Fetch ALL subscriber information (admins can now see all with new RLS policies)
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('email, subscribed, subscription_tier, subscription_end, is_admin, created_at, stripe_customer_id')
        .order('created_at', { ascending: false });

      if (subscribersError) {
        console.error('AdminPanel: Error fetching subscribers:', subscribersError);
        console.error('AdminPanel: Subscriber error details:', subscribersError.message, subscribersError.code);
        toast({
          title: "Error",
          description: `Failed to load subscription data: ${subscribersError.message}`,
          variant: "destructive",
        });
      } else {
        setSubscribers(subscribersData || []);
      }

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
    fetchAdminData();
  }, []);

  const filteredUsers = useMemo(() => {
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

    return filtered;
  }, [users, subscribers, searchTerm, adminFilter, subscriptionFilter, sortBy]);

  const filteredSubscribers = useMemo(() => {
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
    
    return filtered;
  }, [subscribers, searchTerm, adminFilter]);

  const handleClearFilters = () => {
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
    <div className="space-y-8 animate-fade-in">
      {/* Admin Panel Header - Enhanced */}
      <div className="flex items-center justify-between">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground flex items-center tracking-tight">
            <div className="p-2 bg-primary/10 rounded-lg mr-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-3 text-lg font-medium">System administration and user management</p>
        </div>
        <Button
          onClick={fetchAdminData}
          disabled={refreshing}
          variant="outline"
          size="lg"
          className="btn-enhanced transition-all duration-200 hover:shadow-md font-semibold h-12 px-6 border-2"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Tabs for different admin sections - Enhanced */}
      <Tabs defaultValue="users" className="space-y-8">
        <TabsList className="grid w-full max-w-2xl grid-cols-2 h-14 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-border/50">
          <TabsTrigger value="users" className="flex items-center gap-2 text-base font-semibold h-12 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
            <Users className="h-5 w-5" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 text-base font-semibold h-12 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
            <BarChart3 className="h-5 w-5" />
            Visual Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-8">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-primary" />
            <StatCard title="Admin Users" value={stats.adminUsers} icon={Shield} color="text-amber-600" />
            <StatCard title="Active Subscribers" value={stats.totalSubscribers} icon={Activity} color="text-green-600" />
            <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={Database} color="text-purple-600" />
          </div>

          {/* Data Export Section */}
          <DataExport users={users} subscribers={subscribers} />

          {/* Users Management with Data Table - Enhanced */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                User Management
              </CardTitle>
              <CardDescription className="text-base font-medium">
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

              <div className="rounded-xl border-2 border-border/50 overflow-hidden shadow-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30 border-b-2 border-border/50">
                      <TableHead className="font-bold text-foreground">User</TableHead>
                      <TableHead className="font-bold text-foreground">Role</TableHead>
                      <TableHead className="font-bold text-foreground">Subscription</TableHead>
                      <TableHead className="font-bold text-foreground">Joined</TableHead>
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
                          <TableRow key={user.id} className="transition-all duration-300 hover:bg-primary/5 border-b border-border/50">
                            <TableCell className="py-4">
                              <div className="space-y-1">
                                <div className="font-bold text-foreground">{user.full_name || 'No name'}</div>
                                <div className="text-sm text-muted-foreground flex items-center font-medium">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {user.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={subscriber?.is_admin ? "default" : "secondary"}
                                  className={subscriber?.is_admin ? "bg-amber-100 text-amber-800 border-amber-300 font-semibold" : "font-semibold"}
                                >
                                  {subscriber?.is_admin ? "Admin" : "User"}
                                </Badge>
                                {user.status === 'suspended' && (
                                  <Badge variant="destructive" className="text-xs font-semibold">
                                    Suspended
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge 
                                variant={subscriber?.subscription_tier ? "default" : "secondary"}
                                className={
                                  subscriber?.subscription_tier === "premium" ? "bg-blue-100 text-blue-800 border-blue-300 font-semibold" :
                                  subscriber?.subscription_tier === "enterprise" ? "bg-purple-100 text-purple-800 border-purple-300 font-semibold" :
                                  "font-semibold"
                                }
                              >
                                {subscriber?.subscription_tier || "Free"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="text-sm text-muted-foreground flex items-center font-medium">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(user.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-primary/10 rounded-lg">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-2">
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedUser(user);
                                    setUserDetailsOpen(true);
                                  }} className="font-medium">
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className={user.status === 'suspended' ? "text-green-600 font-medium" : "text-destructive font-medium"}
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
