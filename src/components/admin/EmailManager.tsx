import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, FileText, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EmailTemplateViewer from './EmailTemplateViewer';

interface EmailConfig {
  id: string;
  config_type: string;
  enabled: boolean;
  template_html: string;
  template_subject: string;
  from_name: string;
  created_at: string;
  updated_at: string;
}

const EmailManager: React.FC = () => {
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Local state for email template HTML (separate from Supabase)
  const [localEmailHtml, setLocalEmailHtml] = useState<string>('');
  const [emailSaving, setEmailSaving] = useState(false);
  
  // Local state for overview fields (separate from Supabase)
  const [localFromName, setLocalFromName] = useState<string>('');
  const [localSubject, setLocalSubject] = useState<string>('');
  const [overviewSaving, setOverviewSaving] = useState(false);
  
  // Check if email template has unsaved changes
  const isEmailDirty = emailConfig && localEmailHtml !== emailConfig.template_html;
  
  // Check if overview fields have unsaved changes
  const isOverviewDirty = emailConfig && (
    localFromName !== emailConfig.from_name ||
    localSubject !== emailConfig.template_subject
  );
  
  const { toast } = useToast();

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('email_configs')
        .select('*')
        .eq('config_type', 'welcome_email')
        .single();

      if (error) throw error;
      setEmailConfig(data);
      // Set local state to match Supabase data
      setLocalEmailHtml(data.template_html || '');
      setLocalFromName(data.from_name || '');
      setLocalSubject(data.template_subject || '');
    } catch (error) {
      console.error('Error fetching email config:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email configuration",
        variant: "destructive",
      });
    }
  };

  const handleEmailConfigUpdate = async (field: string, value: any) => {
    if (!emailConfig) return;
    
    // Don't handle template_html updates here - they go through saveEmailTemplate
    if (field === 'template_html') {
      console.warn('template_html updates should use saveEmailTemplate function');
      return;
    }
    
    setEmailLoading(true);
    try {
      const updatedConfig = { ...emailConfig, [field]: value };
      
      const { error } = await supabase
        .from('email_configs')
        .update(updatedConfig)
        .eq('id', emailConfig.id);

      if (error) throw error;
      
      setEmailConfig(updatedConfig);
      toast({
        title: "Success",
        description: "Email configuration updated successfully",
      });
    } catch (error) {
      console.error('Error updating email config:', error);
      toast({
        title: "Error",
        description: "Failed to update email configuration",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const saveEmailTemplate = async () => {
    if (!emailConfig) return;
    
    setEmailSaving(true);
    try {
      const { error } = await supabase
        .from('email_configs')
        .update({ template_html: localEmailHtml })
        .eq('id', emailConfig.id);

      if (error) throw error;
      
      // Update the emailConfig state to match what was saved
      setEmailConfig({ ...emailConfig, template_html: localEmailHtml });
      
      toast({
        title: "Success",
        description: "Email template saved successfully",
      });
    } catch (error) {
      console.error('Error saving email template:', error);
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      });
    } finally {
      setEmailSaving(false);
    }
  };

  const saveOverviewConfig = async () => {
    if (!emailConfig) return;
    
    setOverviewSaving(true);
    try {
      const { error } = await supabase
        .from('email_configs')
        .update({ 
          from_name: localFromName,
          template_subject: localSubject
        })
        .eq('id', emailConfig.id);

      if (error) throw error;
      
      // Update the emailConfig state to match what was saved
      setEmailConfig({ 
        ...emailConfig, 
        from_name: localFromName,
        template_subject: localSubject
      });
      
      toast({
        title: "Success",
        description: "Email configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving email configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save email configuration",
        variant: "destructive",
      });
    } finally {
      setOverviewSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Management Header - Enhanced */}
      <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/60 rounded-xl p-6 border border-green-200/40">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground flex items-center tracking-tight">
          <div className="p-2 bg-green-100/80 rounded-lg mr-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          Email Management
        </h1>
        <p className="text-muted-foreground mt-3 text-lg font-medium">Configure email templates and settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {emailConfig ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-background to-green-50/10 border border-green-100/30">
                <CardHeader className="bg-green-50/30 border-b border-green-100/50">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    Welcome Email Configuration
                    {isOverviewDirty && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                        Unsaved Changes
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable Welcome Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send welcome emails to new users when they sign up
                      </p>
                    </div>
                    <Switch
                      checked={emailConfig.enabled}
                      onCheckedChange={(checked) => handleEmailConfigUpdate('enabled', checked)}
                      disabled={emailLoading}
                    />
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="from_name">From Name</Label>
                      <Input
                        id="from_name"
                        value={localFromName}
                        onChange={(e) => setLocalFromName(e.target.value)}
                        placeholder="Your Company Name"
                        disabled={emailLoading || overviewSaving}
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        value={localSubject}
                        onChange={(e) => setLocalSubject(e.target.value)}
                        placeholder="Welcome to our platform!"
                        disabled={emailLoading || overviewSaving}
                      />
                    </div>

                    {isOverviewDirty && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-orange-800">
                              You have unsaved changes
                            </span>
                          </div>
                          <Button
                            onClick={saveOverviewConfig}
                            disabled={overviewSaving || !isOverviewDirty}
                            className="ml-4"
                          >
                            {overviewSaving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Password Reset Email - Mock Component */}
              <Card className="bg-gradient-to-br from-background to-slate-50/10 border border-slate-100/30">
                <CardHeader className="bg-slate-50/30 border-b border-slate-100/50">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-slate-600" />
                    Password Reset Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable Password Reset Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send password reset emails when users request to change their password
                      </p>
                    </div>
                    <Switch checked={false} disabled />
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="password_from_name">From Name</Label>
                      <Input
                        id="password_from_name"
                        placeholder="Your Company Name"
                        disabled
                        value=""
                      />
                    </div>
                    <div>
                      <Label htmlFor="password_subject">Email Subject</Label>
                      <Input
                        id="password_subject"
                        placeholder="Reset your password"
                        disabled
                        value=""
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    Coming soon - configuration options will be available here
                  </div>
                </CardContent>
              </Card>

              {/* Notification Email - Mock Component */}
              <Card className="bg-gradient-to-br from-background to-blue-50/10 border border-blue-100/30">
                <CardHeader className="bg-blue-50/30 border-b border-blue-100/50">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Notification Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable Notification Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notification emails for important account updates
                      </p>
                    </div>
                    <Switch checked={false} disabled />
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="notification_from_name">From Name</Label>
                      <Input
                        id="notification_from_name"
                        placeholder="Your Company Name"
                        disabled
                        value=""
                      />
                    </div>
                    <div>
                      <Label htmlFor="notification_subject">Email Subject</Label>
                      <Input
                        id="notification_subject"
                        placeholder="Important account update"
                        disabled
                        value=""
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    Coming soon - configuration options will be available here
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Email - Mock Component */}
              <Card className="bg-gradient-to-br from-background to-purple-50/10 border border-purple-100/30">
                <CardHeader className="bg-purple-50/30 border-b border-purple-100/50">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-purple-600" />
                    Newsletter Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Enable Newsletter Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send regular newsletter updates to subscribed users
                      </p>
                    </div>
                    <Switch checked={false} disabled />
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="newsletter_from_name">From Name</Label>
                      <Input
                        id="newsletter_from_name"
                        placeholder="Your Company Name"
                        disabled
                        value=""
                      />
                    </div>
                    <div>
                      <Label htmlFor="newsletter_subject">Email Subject</Label>
                      <Input
                        id="newsletter_subject"
                        placeholder="Your monthly newsletter"
                        disabled
                        value=""
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    Coming soon - configuration options will be available here
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {emailConfig ? (
            <EmailTemplateViewer
              htmlContent={localEmailHtml}
              onHtmlChange={setLocalEmailHtml}
              disabled={emailLoading}
              loading={emailLoading}
              isDirty={!!isEmailDirty}
              onSave={saveEmailTemplate}
              saveLoading={emailSaving}
            />
          ) : (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default EmailManager; 
