
import { useMemo, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from '@/components/ui/chart';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, AlertCircle, Clock, Target } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ErrorBoundary from '@/components/ErrorBoundary';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
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

// Pricing configuration - centralized and easy to update
const TIER_PRICING = {
  'Starter': 9,
  'Professional': 29,
  'Enterprise': 99,
  'Basic': 9.99, // Legacy tier
  'Pro': 19.99, // Legacy tier
  'Premium': 29.99 // Legacy tier
} as const;

interface VisualAnalyticsProps {
  users: UserProfile[];
  subscribers: SubscriberInfo[];
  loading: boolean;
}

// Utility functions for date processing
const formatMonthKey = (date: Date, isMobile: boolean): string => {
  return date.toLocaleString('default', { 
    month: 'short', 
    year: isMobile ? '2-digit' : 'numeric' 
  });
};

const createDateFromMonthKey = (monthKey: string): Date => {
  try {
    // Handle both "Jan 2024" and "Jan 24" formats
    const parts = monthKey.split(' ');
    if (parts.length !== 2) return new Date();
    
    const month = parts[0];
    let year = parseInt(parts[1]);
    
    // Convert 2-digit year to 4-digit
    if (year < 100) {
      year += 2000;
    }
    
    return new Date(year, new Date(`${month} 1, ${year}`).getMonth(), 1);
  } catch {
    return new Date();
  }
};

// Empty state component
const EmptyStateCard: React.FC<{ title: string; description: string }> = memo(({ title, description }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
    <AlertCircle className="h-12 w-12 text-muted-foreground" />
    <div className="space-y-2">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  </div>
));

const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({ users, subscribers, loading }) => {
  const isMobile = useIsMobile();

  // Process data for User Registration Timeline with improved date handling
  const userGrowthData = useMemo(() => {
    try {
      if (!users?.length) return [];

      const monthlyData = users.reduce((acc, user) => {
        try {
          const date = new Date(user.created_at);
          if (isNaN(date.getTime())) return acc; // Skip invalid dates
          
          const monthKey = formatMonthKey(date, isMobile);
          acc[monthKey] = (acc[monthKey] || 0) + 1;
          return acc;
        } catch {
          return acc; // Skip invalid entries
        }
      }, {} as Record<string, number>);

      const sortedData = Object.entries(monthlyData)
        .map(([month, count]) => ({ 
          month, 
          users: count,
          date: createDateFromMonthKey(month)
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(-6) // Last 6 months
        .map(({ month, users }) => ({ month, users }));

      return sortedData;
    } catch (error) {
      console.error('Error processing user growth data:', error);
      return [];
    }
  }, [users, isMobile]);

  // Process data for Subscription Distribution with better handling
  const subscriptionData = useMemo(() => {
    try {
      if (!subscribers?.length) return [];

      const tierCounts = subscribers.reduce((acc, sub) => {
        const tier = sub.subscription_tier || 'Free';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
      const total = Object.values(tierCounts).reduce((sum, count) => sum + count, 0);
      
      if (total === 0) return [];
      
      return Object.entries(tierCounts).map(([tier, count], index) => ({
        name: tier,
        value: count,
        fill: colors[index % colors.length],
        percentage: Math.round((count / total) * 100),
        label: isMobile ? `${tier} (${count})` : `${tier} (${count} users - ${Math.round((count / total) * 100)}%)`
      }));
    } catch (error) {
      console.error('Error processing subscription data:', error);
      return [];
    }
  }, [subscribers, isMobile]);

  // Process data for Monthly Revenue with fixed pricing and better error handling
  const revenueData = useMemo(() => {
    try {
      if (!subscribers?.length) return [];

      const activeSubscribers = subscribers.filter(sub => sub.subscribed && sub.subscription_tier);
      if (!activeSubscribers.length) return [];

      const monthlyRevenue = activeSubscribers.reduce((acc, sub) => {
        try {
          const date = new Date(sub.created_at);
          if (isNaN(date.getTime())) return acc; // Skip invalid dates
          
          const monthKey = formatMonthKey(date, isMobile);
          const revenue = TIER_PRICING[sub.subscription_tier as keyof typeof TIER_PRICING] || 0;
          acc[monthKey] = (acc[monthKey] || 0) + revenue;
          return acc;
        } catch {
          return acc; // Skip invalid entries
        }
      }, {} as Record<string, number>);

      const sortedData = Object.entries(monthlyRevenue)
        .map(([month, revenue]) => ({ 
          month, 
          revenue: Math.round(revenue * 100) / 100,
          date: createDateFromMonthKey(month)
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(-6) // Last 6 months
        .map(({ month, revenue }) => ({ month, revenue }));

      return sortedData;
    } catch (error) {
      console.error('Error processing revenue data:', error);
      return [];
    }
  }, [subscribers, isMobile]);

  // Calculate Time to First Value (TTFV) - Average time from registration to first subscription
  const timeToFirstValue = useMemo(() => {
    try {
      if (!users?.length || !subscribers?.length) return { days: 0, hours: 0 };

      // Find users who eventually subscribed
      const subscribedUsers = subscribers.filter(sub => sub.subscribed && sub.email);
      if (!subscribedUsers.length) return { days: 0, hours: 0 };

      let totalHours = 0;
      let validConversions = 0;

      subscribedUsers.forEach(subscriber => {
        const user = users.find(u => u.email === subscriber.email);
        if (user) {
          const registrationDate = new Date(user.created_at);
          const subscriptionDate = new Date(subscriber.created_at);
          
          if (!isNaN(registrationDate.getTime()) && !isNaN(subscriptionDate.getTime())) {
            const hoursDiff = (subscriptionDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60);
            if (hoursDiff >= 0) { // Only count positive time differences
              totalHours += hoursDiff;
              validConversions++;
            }
          }
        }
      });

      if (validConversions === 0) return { days: 0, hours: 0 };

      const avgHours = totalHours / validConversions;
      return {
        days: Math.round(avgHours / 24 * 10) / 10,
        hours: Math.round(avgHours * 10) / 10
      };
    } catch (error) {
      console.error('Error calculating TTFV:', error);
      return { days: 0, hours: 0 };
    }
  }, [users, subscribers]);

  // Calculate Active vs Inactive Users data
  const activeInactiveData = useMemo(() => {
    try {
      if (!users?.length || !subscribers?.length) return [];

      const activeSubscribers = subscribers.filter(sub => sub.subscribed).length;
      const totalUsers = users.length;
      const inactiveUsers = totalUsers - activeSubscribers;

      const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];
      
      return [
        {
          name: 'Active Subscribers',
          value: activeSubscribers,
          fill: colors[0],
          percentage: Math.round((activeSubscribers / totalUsers) * 100),
          label: isMobile ? `Active (${activeSubscribers})` : `Active Subscribers (${activeSubscribers} users - ${Math.round((activeSubscribers / totalUsers) * 100)}%)`
        },
        {
          name: 'Inactive Users',
          value: inactiveUsers,
          fill: colors[1],
          percentage: Math.round((inactiveUsers / totalUsers) * 100),
          label: isMobile ? `Inactive (${inactiveUsers})` : `Inactive Users (${inactiveUsers} users - ${Math.round((inactiveUsers / totalUsers) * 100)}%)`
        }
      ];
    } catch (error) {
      console.error('Error processing active/inactive data:', error);
      return [];
    }
  }, [users, subscribers, isMobile]);

  // Calculate ARPU (Average Revenue Per User)
  const arpu = useMemo(() => {
    try {
      if (!users?.length || !subscribers?.length) return 0;
      
      const totalRevenue = subscribers
        .filter(sub => sub.subscribed && sub.subscription_tier)
        .reduce((sum, sub) => {
          const tierRevenue = TIER_PRICING[sub.subscription_tier as keyof typeof TIER_PRICING] || 0;
          return sum + tierRevenue;
        }, 0);
      
      return Math.round((totalRevenue / users.length) * 100) / 100;
    } catch (error) {
      console.error('Error calculating ARPU:', error);
      return 0;
    }
  }, [users, subscribers]);

  // Calculate Revenue Per Plan breakdown
  const revenuePerPlan = useMemo(() => {
    try {
      if (!subscribers?.length) return [];

      const planRevenue = subscribers
        .filter(sub => sub.subscribed && sub.subscription_tier)
        .reduce((acc, sub) => {
          const tier = sub.subscription_tier as keyof typeof TIER_PRICING;
          const revenue = TIER_PRICING[tier] || 0;
          acc[tier] = (acc[tier] || 0) + revenue;
          return acc;
        }, {} as Record<string, number>);

      const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
      const total = Object.values(planRevenue).reduce((sum, revenue) => sum + revenue, 0);
      
      if (total === 0) return [];
      
      return Object.entries(planRevenue).map(([tier, revenue], index) => ({
        name: tier,
        value: Math.round(revenue * 100) / 100,
        fill: colors[index % colors.length],
        percentage: Math.round((revenue / total) * 100),
        label: isMobile ? `${tier} ($${revenue})` : `${tier} ($${revenue} - ${Math.round((revenue / total) * 100)}%)`
      }));
    } catch (error) {
      console.error('Error processing revenue per plan:', error);
      return [];
    }
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

  // Custom Bar Chart Legend for User Registration with improved growth calculation
  const CustomUserGrowthLegend = memo(({ payload }: any) => {
    if (!payload?.length || !userGrowthData.length) return null;
    
    try {
      const totalUsers = userGrowthData.reduce((sum, item) => sum + item.users, 0);
      const avgUsers = userGrowthData.length > 0 ? Math.round(totalUsers / userGrowthData.length) : 0;
      
      // Improved growth rate calculation
      let growthRate = 0;
      if (userGrowthData.length > 1) {
        const current = userGrowthData[userGrowthData.length - 1]?.users || 0;
        const previous = userGrowthData[userGrowthData.length - 2]?.users || 0;
        if (previous > 0) {
          growthRate = Math.round(((current - previous) / previous) * 100);
        } else if (current > 0) {
          growthRate = 100; // First month with data
        }
      }
    
    return (
      <div className="flex flex-col gap-3 pt-2 px-2">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-center gap-4'}`}>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium text-foreground">
                {entry.payload.label || entry.value}
              </span>
            </div>
          ))}
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-3 gap-4'} text-center`}>
          <div className={`flex ${isMobile ? 'flex-row justify-between items-center' : 'flex-col'} ${isMobile ? 'px-2 py-1 bg-muted/30 rounded-md' : ''}`}>
            <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground`}>Total Registrations</span>
            <span className={`font-semibold text-foreground ${isMobile ? 'text-base' : 'text-sm'}`}>{totalUsers}</span>
          </div>
          <div className={`flex ${isMobile ? 'flex-row justify-between items-center' : 'flex-col'} ${isMobile ? 'px-2 py-1 bg-muted/30 rounded-md' : ''}`}>
            <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground`}>Avg per Month</span>
            <span className={`font-semibold text-foreground ${isMobile ? 'text-base' : 'text-sm'}`}>{avgUsers}</span>
          </div>
          <div className={`flex ${isMobile ? 'flex-row justify-between items-center' : 'flex-col'} ${isMobile ? 'px-2 py-1 bg-muted/30 rounded-md' : ''}`}>
            <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground`}>Growth Rate</span>
            <div className={`flex items-center gap-1 ${isMobile ? '' : 'justify-center'}`}>
              {growthRate >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`font-semibold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'} ${isMobile ? 'text-base' : 'text-sm'}`}>
                {growthRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
    } catch (error) {
      console.error('Error in CustomUserGrowthLegend:', error);
      return null;
    }
  });

  // Custom Bar Chart Legend for Revenue with improved calculation
  const CustomRevenueLegend = memo(({ payload }: any) => {
    if (!payload?.length || !revenueData.length) return null;
    
    try {
      const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
      const avgRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;
      
      // Improved revenue growth calculation
      let revenueGrowth = 0;
      if (revenueData.length > 1) {
        const current = revenueData[revenueData.length - 1]?.revenue || 0;
        const previous = revenueData[revenueData.length - 2]?.revenue || 0;
        if (previous > 0) {
          revenueGrowth = Math.round(((current - previous) / previous) * 100);
        } else if (current > 0) {
          revenueGrowth = 100; // First month with revenue
        }
      }
    
    return (
      <div className="flex flex-col gap-3 pt-2 px-2">
        <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-center gap-4'}`}>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium text-foreground">
                {entry.payload.label || entry.value}
              </span>
            </div>
          ))}
        </div>
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-3 gap-4'} text-center`}>
          <div className={`flex ${isMobile ? 'flex-row justify-between items-center' : 'flex-col'} ${isMobile ? 'px-2 py-1 bg-muted/30 rounded-md' : ''}`}>
            <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground`}>Total Revenue</span>
            <span className={`font-semibold text-foreground ${isMobile ? 'text-base' : 'text-sm'}`}>${totalRevenue.toFixed(2)}</span>
          </div>
          <div className={`flex ${isMobile ? 'flex-row justify-between items-center' : 'flex-col'} ${isMobile ? 'px-2 py-1 bg-muted/30 rounded-md' : ''}`}>
            <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground`}>Avg per Month</span>
            <span className={`font-semibold text-foreground ${isMobile ? 'text-base' : 'text-sm'}`}>${avgRevenue.toFixed(2)}</span>
          </div>
          <div className={`flex ${isMobile ? 'flex-row justify-between items-center' : 'flex-col'} ${isMobile ? 'px-2 py-1 bg-muted/30 rounded-md' : ''}`}>
            <span className={`${isMobile ? 'text-sm' : 'text-xs'} text-muted-foreground`}>Growth Rate</span>
            <div className={`flex items-center gap-1 ${isMobile ? '' : 'justify-center'}`}>
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`font-semibold ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'} ${isMobile ? 'text-base' : 'text-sm'}`}>
                {revenueGrowth}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
    } catch (error) {
      console.error('Error in CustomRevenueLegend:', error);
      return null;
    }
  });

  // Custom Legend Content for Pie Charts with error handling
  const CustomPieChartLegend = memo(({ payload }: any) => {
    if (!payload?.length) return null;
    
    try {
      return (
        <div className={`flex ${isMobile ? 'flex-col gap-2 px-2' : 'flex-wrap'} items-center justify-center gap-3 pt-2`}>
          {payload.map((entry: any, index: number) => (
            <div key={index} className={`flex items-center gap-2 ${isMobile ? 'justify-between px-2 py-1 bg-muted/20 rounded-md' : ''}`}>
              <div className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className={`font-medium text-foreground ${isMobile ? 'text-sm' : 'text-sm'}`}>
                  {entry.payload.name}
                </span>
              </div>
              {isMobile && (
                <span className="text-sm font-semibold">
                  {entry.payload.value} ({entry.payload.percentage}%)
                </span>
              )}
            </div>
          ))}
        </div>
      );
    } catch (error) {
      console.error('Error in CustomPieChartLegend:', error);
      return null;
    }
  });

  // Responsive chart margins
  const getChartMargins = () => ({
    top: isMobile ? 20 : 20,
    right: isMobile ? 20 : 30,
    left: isMobile ? 20 : 20,
    bottom: isMobile ? 10 : 10
  });

  // Responsive pie chart dimensions
  const getPieChartDimensions = () => ({
    outerRadius: isMobile ? 70 : 100,
    innerRadius: isMobile ? 25 : 40
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 xl:gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-3">
              <div className="h-5 bg-muted rounded-md animate-pulse" />
              <div className="h-4 bg-muted rounded-md animate-pulse w-2/3 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg animate-pulse" style={{ minHeight: isMobile ? '280px' : '320px' }} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Key Metrics Cards - New SaaS Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 xl:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Time to First Value</CardTitle>
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
              {timeToFirstValue.days > 0 ? `${timeToFirstValue.days}d` : `${timeToFirstValue.hours}h`}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {timeToFirstValue.days > 0 ? 
                `Average ${timeToFirstValue.days} days to subscribe` : 
                `Average ${timeToFirstValue.hours} hours to subscribe`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Active Users</CardTitle>
            <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">
              {subscribers.filter(s => s.subscribed).length.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {Math.round((subscribers.filter(s => s.subscribed).length / users.length) * 100)}% of total users
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">ARPU</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
              ${arpu.toFixed(2)}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Average revenue per user
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">Top Plan Revenue</CardTitle>
            <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-100">
              {revenuePerPlan.length > 0 ? `$${Math.max(...revenuePerPlan.map(p => p.value)).toFixed(0)}` : '$0'}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {revenuePerPlan.length > 0 ? 
                `${revenuePerPlan.find(p => p.value === Math.max(...revenuePerPlan.map(p => p.value)))?.name || 'Unknown'} plan` : 
                'No revenue data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 xl:gap-6">
        {/* User Registration Timeline - Bar Chart with Enhanced Legend */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg sm:text-xl'} font-semibold`}>User Registration Timeline</CardTitle>
            <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>New user registrations over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {userGrowthData.length === 0 ? (
              <EmptyStateCard 
                title="No User Data" 
                description="No user registration data available for the selected period." 
              />
            ) : (
              <ChartContainer config={chartConfig} style={{ minHeight: isMobile ? '280px' : '320px' }}>
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
                    maxBarSize={isMobile ? 40 : 60}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Subscription Distribution with Enhanced Legend */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg sm:text-xl'} font-semibold`}>Subscription Distribution</CardTitle>
            <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Distribution of users across subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionData.length === 0 ? (
              <EmptyStateCard 
                title="No Subscription Data" 
                description="No subscription distribution data available." 
              />
            ) : (
              <ChartContainer config={chartConfig} style={{ minHeight: isMobile ? '280px' : '320px' }}>
                <PieChart margin={getChartMargins()}>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={getPieChartDimensions().outerRadius}
                    innerRadius={getPieChartDimensions().innerRadius}
                    paddingAngle={isMobile ? 1 : 2}
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
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend - Bar Chart with Enhanced Legend */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg sm:text-xl'} font-semibold`}>Monthly Revenue Trend</CardTitle>
            <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Estimated monthly recurring revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <EmptyStateCard 
                title="No Revenue Data" 
                description="No revenue data available for the selected period." 
              />
            ) : (
              <ChartContainer config={chartConfig} style={{ minHeight: isMobile ? '280px' : '320px' }}>
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
                    maxBarSize={isMobile ? 40 : 60}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Active vs Inactive Users - Pie Chart with Enhanced Legend */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg sm:text-xl'} font-semibold`}>Active vs Inactive Users</CardTitle>
            <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Active subscribers vs inactive users breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {activeInactiveData.length === 0 ? (
              <EmptyStateCard 
                title="No User Activity Data" 
                description="No user activity data available." 
              />
            ) : (
              <ChartContainer config={chartConfig} style={{ minHeight: isMobile ? '280px' : '320px' }}>
                <PieChart margin={getChartMargins()}>
                  <Pie
                    data={activeInactiveData}
                    cx="50%"
                    cy="50%"
                    innerRadius={getPieChartDimensions().innerRadius + (isMobile ? 5 : 10)}
                    outerRadius={getPieChartDimensions().outerRadius}
                    paddingAngle={isMobile ? 2 : 4}
                    dataKey="value"
                  >
                    {activeInactiveData.map((entry, index) => (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Wrap with Error Boundary and memo for performance
const VisualAnalyticsWithErrorBoundary: React.FC<VisualAnalyticsProps> = (props) => (
  <ErrorBoundary fallback={
    <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
      <AlertCircle className="h-16 w-16 text-destructive" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Analytics Error</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          There was an error loading the analytics dashboard. Please refresh the page or contact support.
        </p>
      </div>
    </div>
  }>
    <VisualAnalytics {...props} />
  </ErrorBoundary>
);

export default memo(VisualAnalyticsWithErrorBoundary);
