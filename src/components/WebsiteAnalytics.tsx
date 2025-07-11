
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const WebsiteAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
          Website Analytics
        </h3>
        <p className="text-sm lg:text-base text-gray-600">
          Monitor your website performance and user engagement.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive website analytics and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h4>
            <p className="text-gray-600">
              Advanced analytics features will be available here, including user metrics, 
              traffic analysis, conversion tracking, and performance insights.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteAnalytics;
