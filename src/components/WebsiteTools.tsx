
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const WebsiteTools = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
          Website Tools
        </h3>
        <p className="text-sm lg:text-base text-gray-600">
          Manage and configure your website settings and features.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Management Tools
          </CardTitle>
          <CardDescription>
            Administrative tools for website management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h4>
            <p className="text-gray-600">
              Powerful management tools will be available here, including content management, 
              user administration, system configuration, and maintenance utilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteTools;
