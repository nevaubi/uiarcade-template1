
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Users, CreditCard, Database, Loader2 } from 'lucide-react';
import { exportToCSV, prepareUsersForExport, prepareSubscribersForExport } from '@/utils/csvExport';

interface DataExportProps {
  users: any[];
  subscribers: any[];
}

const DataExport: React.FC<DataExportProps> = ({ users, subscribers }) => {
  const [exportingUsers, setExportingUsers] = useState(false);
  const [exportingSubscribers, setExportingSubscribers] = useState(false);
  const [exportingCombined, setExportingCombined] = useState(false);
  const { toast } = useToast();

  const handleExportUsers = async () => {
    if (users.length === 0) {
      toast({
        title: "No Data",
        description: "No user data available to export",
        variant: "destructive",
      });
      return;
    }

    setExportingUsers(true);
    try {
      const exportData = prepareUsersForExport(users, subscribers);
      exportToCSV(exportData, 'users_export');
      
      toast({
        title: "Export Successful",
        description: `Exported ${exportData.length} users to CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export user data",
        variant: "destructive",
      });
    } finally {
      setExportingUsers(false);
    }
  };

  const handleExportSubscribers = async () => {
    if (subscribers.length === 0) {
      toast({
        title: "No Data",
        description: "No subscriber data available to export",
        variant: "destructive",
      });
      return;
    }

    setExportingSubscribers(true);
    try {
      const exportData = prepareSubscribersForExport(subscribers);
      exportToCSV(exportData, 'subscribers_export');
      
      toast({
        title: "Export Successful",
        description: `Exported ${exportData.length} subscribers to CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export subscriber data",
        variant: "destructive",
      });
    } finally {
      setExportingSubscribers(false);
    }
  };

  const handleExportCombined = async () => {
    if (users.length === 0 && subscribers.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    setExportingCombined(true);
    try {
      const userData = prepareUsersForExport(users, subscribers);
      
      // Create combined dataset with all unique information
      const combinedData = userData.map(user => {
        const subscriber = subscribers.find(sub => sub.email === user.email);
        return {
          user_id: user.id,
          email: user.email,
          full_name: user.full_name,
          user_created_at: user.created_at,
          subscription_status: user.subscription_status,
          subscription_tier: user.subscription_tier,
          subscription_end: subscriber?.subscription_end ? new Date(subscriber.subscription_end).toLocaleDateString() : 'N/A',
          is_admin: user.is_admin,
          stripe_customer_id: subscriber?.stripe_customer_id || 'N/A'
        };
      });
      
      exportToCSV(combinedData, 'combined_export');
      
      toast({
        title: "Export Successful",
        description: `Exported ${combinedData.length} combined records to CSV`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export combined data",
        variant: "destructive",
      });
    } finally {
      setExportingCombined(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="h-5 w-5 mr-2" />
          Data Export
        </CardTitle>
        <CardDescription>
          Export user and subscription data to CSV files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export Users */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center mb-3">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium">Users Data</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Export all user profiles and basic information
            </p>
            <Button
              onClick={handleExportUsers}
              disabled={exportingUsers || users.length === 0}
              className="w-full"
              size="sm"
            >
              {exportingUsers ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Users ({users.length})
                </>
              )}
            </Button>
          </div>

          {/* Export Subscribers */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center mb-3">
              <CreditCard className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium">Subscribers Data</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Export subscription and billing information
            </p>
            <Button
              onClick={handleExportSubscribers}
              disabled={exportingSubscribers || subscribers.length === 0}
              className="w-full"
              size="sm"
            >
              {exportingSubscribers ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Subscribers ({subscribers.length})
                </>
              )}
            </Button>
          </div>

          {/* Export Combined */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center mb-3">
              <Database className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium">Combined Data</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Export comprehensive user and subscription data
            </p>
            <Button
              onClick={handleExportCombined}
              disabled={exportingCombined || (users.length === 0 && subscribers.length === 0)}
              className="w-full"
              size="sm"
            >
              {exportingCombined ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Combined ({users.length})
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Export Information:</strong> CSV files will include column headers and be automatically downloaded with today's date. 
            All personal data exports should comply with your privacy policy and data protection regulations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExport;
