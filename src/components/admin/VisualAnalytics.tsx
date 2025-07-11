
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Activity, DollarSign } from 'lucide-react';

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

interface VisualAnalyticsProps {
  users: UserProfile[];
  subscribers: SubscriberInfo[];
  loading: boolean;
}

const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({ users, subscribers, loading }) => {
  // Process data for User Registration Timeline
  const userGrowthData = useMemo(() => {
    const monthlyData = users.reduce((acc, user) => {
      const month = new Date(user.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, users: count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months
  }, [users]);

  // Process data for Subscription Distribution
  const subscriptionData = useMemo(() => {
    const tierCounts = subscribers.reduce((acc, sub) => {
      const tier = sub.subscription_tier || 'Free';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];
    
    return Object.entries(tierCounts).map(([tier, count], index) => ({
      name: tier,
      value: count,
      fill: colors[index % colors.length]
    }));
  }, [subscribers]);

  // Process data for Admin vs Users
  const roleData = useMemo(() => {
    const adminCount = subscribers.filter(sub => sub.is_admin).length;
    const userCount = users.length - adminCount;

    return [
      { name: 'Users', value: userCount, fill: '#8884d8' },
      { name: 'Admins', value: adminCount, fill: '#82ca9d' }
    ];
  }, [users, subscribers]);

  // Process data for Monthly Revenue (estimated based on subscription tiers)
  const revenueData = useMemo(() => {
    const tierPricing = {
      'Basic': 9.99,
      'Pro': 19.99,
      'Enterprise': 49.99,
      'Premium': 29.99
    } as Record<string, number>;

    const monthlyRevenue = subscribers
      .filter(sub => sub.subscribed && sub.subscription_tier)
      .reduce((acc, sub) => {
        const month = new Date(sub.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
        const revenue = tierPricing[sub.subscription_tier] || 0;
        acc[month] = (acc[month] || 0) + revenue;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6);
  }, [subscribers]);

  // Process data for Active vs Inactive Subscriptions
  const subscriptionStatusData = useMemo(() => {
    const activeCount = subscribers.filter(sub => sub.subscribed).length;
    const inactiveCount = subscribers.length - activeCount;

    return [
      { status: 'Active', count: activeCount },
      { status: 'Inactive', count: inactiveCount }
    ];
  }, [subscribers]);

  const chartConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--chart-1))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-2))",
    },
    active: {
      label: "Active",
      color: "hsl(var(--chart-1))",
    },
    inactive: {
      label: "Inactive",
      color: "hsl(var(--chart-3))",
    },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              +{users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.filter(s => s.subscribed).length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((subscribers.filter(s => s.subscribed).length / subscribers.length) * 100)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueData.reduce((sum, item) => sum + item.revenue, 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on subscription tiers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userGrowthData.length > 1 ? 
                Math.round(((userGrowthData[userGrowthData.length - 1]?.users || 0) / (userGrowthData[userGrowthData.length - 2]?.users || 1) - 1) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>User Registration Timeline</CardTitle>
            <CardDescription>New user registrations over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="var(--color-users)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-users)" }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Distribution of users across subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Estimated monthly recurring revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  fill="var(--color-revenue)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Admin vs Users Ratio */}
        <Card>
          <CardHeader>
            <CardTitle>User Roles Distribution</CardTitle>
            <CardDescription>Admin vs regular users breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status Overview</CardTitle>
          <CardDescription>Active vs inactive subscription comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={subscriptionStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-active)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualAnalytics;
