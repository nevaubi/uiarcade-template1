
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Activity, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  // Process data for User Registration Timeline
  const userGrowthData = useMemo(() => {
    const monthlyData = users.reduce((acc, user) => {
      const month = new Date(user.created_at).toLocaleString('default', { 
        month: isMobile ? 'short' : 'short', 
        year: isMobile ? '2-digit' : 'numeric' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, users: count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months
  }, [users, isMobile]);

  // Process data for Subscription Distribution
  const subscriptionData = useMemo(() => {
    const tierCounts = subscribers.reduce((acc, sub) => {
      const tier = sub.subscription_tier || 'Free';
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    const total = Object.values(tierCounts).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(tierCounts).map(([tier, count], index) => ({
      name: tier,
      value: count,
      fill: colors[index % colors.length],
      percentage: Math.round((count / total) * 100),
      label: isMobile ? `${tier} (${count})` : `${tier} (${count} users - ${Math.round((count / total) * 100)}%)`
    }));
  }, [subscribers, isMobile]);

  // Process data for Admin vs Users
  const roleData = useMemo(() => {
    const adminCount = subscribers.filter(sub => sub.is_admin).length;
    const userCount = users.length - adminCount;
    const total = adminCount + userCount;

    return [
      { 
        name: 'Users', 
        value: userCount, 
        fill: 'hsl(var(--chart-1))',
        percentage: Math.round((userCount / total) * 100),
        label: isMobile ? `Users (${userCount})` : `Regular Users (${userCount} users - ${Math.round((userCount / total) * 100)}%)`
      },
      { 
        name: 'Admins', 
        value: adminCount, 
        fill: 'hsl(var(--chart-2))',
        percentage: Math.round((adminCount / total) * 100),
        label: isMobile ? `Admins (${adminCount})` : `Administrators (${adminCount} users - ${Math.round((adminCount / total) * 100)}%)`
      }
    ];
  }, [users, subscribers, isMobile]);

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
        const month = new Date(sub.created_at).toLocaleString('default', { 
          month: isMobile ? 'short' : 'short', 
          year: isMobile ? '2-digit' : 'numeric' 
        });
        const revenue = tierPricing[sub.subscription_tier] || 0;
        acc[month] = (acc[month] || 0) + revenue;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6);
  }, [subscribers, isMobile]);

  const chartConfig = {
    users: {
      label: "New Users",
      color: "hsl(var(--chart-1))",
    },
    revenue: {
      label: "Revenue ($)",
      color: "hsl(var(--chart-2))",
    },
  };

  // Custom Bar Chart Legend for User Registration
  const CustomUserGrowthLegend = ({ payload }: any) => {
    if (!payload?.length || !userGrowthData.length) return null;
    
    const totalUsers = userGrowthData.reduce((sum, item) => sum + item.users, 0);
    const avgUsers = Math.round(totalUsers / userGrowthData.length);
    const growthRate = userGrowthData.length > 1 
      ? Math.round(((userGrowthData[userGrowthData.length - 1]?.users || 0) / Math.max(userGrowthData[userGrowthData.length - 2]?.users || 1, 1) - 1) * 100)
      : 0;
    
    return (
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex items-center justify-center gap-4">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium text-foreground">
                {entry.payload.label || entry.value}
              </span>
            </div>
          ))}
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-4'} text-center text-xs text-muted-foreground`}>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{totalUsers}</span>
            <span>Total Registrations</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{avgUsers}</span>
            <span>Avg per Month</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-1">
              {growthRate >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`font-semibold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthRate}%
              </span>
            </div>
            <span>Growth Rate</span>
          </div>
        </div>
      </div>
    );
  };

  // Custom Bar Chart Legend for Revenue
  const CustomRevenueLegend = ({ payload }: any) => {
    if (!payload?.length || !revenueData.length) return null;
    
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const avgRevenue = totalRevenue / revenueData.length;
    const revenueGrowth = revenueData.length > 1 
      ? Math.round(((revenueData[revenueData.length - 1]?.revenue || 0) / Math.max(revenueData[revenueData.length - 2]?.revenue || 1, 1) - 1) * 100)
      : 0;
    
    return (
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex items-center justify-center gap-4">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium text-foreground">
                {entry.payload.label || entry.value}
              </span>
            </div>
          ))}
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-4'} text-center text-xs text-muted-foreground`}>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">${totalRevenue.toFixed(2)}</span>
            <span>Total Revenue</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">${avgRevenue.toFixed(2)}</span>
            <span>Avg per Month</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-1">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`font-semibold ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth}%
              </span>
            </div>
            <span>Growth Rate</span>
          </div>
        </div>
      </div>
    );
  };

  // Custom Legend Content for Pie Charts
  const CustomPieChartLegend = ({ payload }: any) => {
    if (!payload?.length) return null;
    
    return (
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap'} items-center justify-center gap-4 pt-4`}>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="h-3 w-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium text-foreground">
              {entry.payload.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Responsive chart margins
  const getChartMargins = () => ({
    top: isMobile ? 10 : 20,
    right: isMobile ? 15 : 30,
    left: isMobile ? 10 : 20,
    bottom: isMobile ? 5 : 5
  });

  // Responsive pie chart dimensions
  const getPieChartDimensions = () => ({
    outerRadius: isMobile ? 80 : 100,
    innerRadius: isMobile ? 30 : 40
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardHeader>
              <div className="h-5 bg-muted rounded-md animate-pulse" />
              <div className="h-4 bg-muted rounded-md animate-pulse w-2/3 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-72 lg:h-80 bg-muted rounded-lg animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{users.length.toLocaleString()}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              +{users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Active Subscriptions</CardTitle>
            <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{subscribers.filter(s => s.subscribed).length.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Active recurring subscriptions
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">Est. Monthly Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
              ${revenueData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Based on subscription tiers
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">Growth Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-100">
              {userGrowthData.length > 1 ? 
                Math.round(((userGrowthData[userGrowthData.length - 1]?.users || 0) / Math.max(userGrowthData[userGrowthData.length - 2]?.users || 1, 1) - 1) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* User Registration Timeline - Bar Chart with Enhanced Legend */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-semibold">User Registration Timeline</CardTitle>
            <CardDescription className="text-sm sm:text-base">New user registrations over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 sm:h-72 lg:h-80">
              <BarChart data={userGrowthData} margin={getChartMargins()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={isMobile ? 10 : 12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={isMobile ? 10 : 12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                />
                <ChartLegend content={<CustomUserGrowthLegend />} />
                <Bar 
                  dataKey="users" 
                  fill="var(--color-users)"
                  radius={[4, 4, 0, 0]}
                  name="New Users"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subscription Distribution with Enhanced Legend */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-semibold">Subscription Distribution</CardTitle>
            <CardDescription className="text-sm sm:text-base">Distribution of users across subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 sm:h-72 lg:h-80">
              <PieChart margin={getChartMargins()}>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={getPieChartDimensions().outerRadius}
                  innerRadius={getPieChartDimensions().innerRadius}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-lg">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-sm" 
                              style={{ backgroundColor: data.fill }}
                            />
                            <span className="font-medium">{data.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {data.value} users ({data.percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend content={<CustomPieChartLegend />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend - Bar Chart with Enhanced Legend */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-semibold">Monthly Revenue Trend</CardTitle>
            <CardDescription className="text-sm sm:text-base">Estimated monthly recurring revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 sm:h-72 lg:h-80">
              <BarChart data={revenueData} margin={getChartMargins()}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={isMobile ? 10 : 12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={isMobile ? 10 : 12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                />
                <ChartLegend content={<CustomRevenueLegend />} />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                  name="Revenue ($)"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Roles Distribution with Enhanced Legend */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-semibold">User Roles Distribution</CardTitle>
            <CardDescription className="text-sm sm:text-base">Admin vs regular users breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 sm:h-72 lg:h-80">
              <PieChart margin={getChartMargins()}>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={getPieChartDimensions().innerRadius + 10}
                  outerRadius={getPieChartDimensions().outerRadius}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-lg">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-sm" 
                              style={{ backgroundColor: data.fill }}
                            />
                            <span className="font-medium">{data.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {data.value} users ({data.percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend content={<CustomPieChartLegend />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisualAnalytics;
