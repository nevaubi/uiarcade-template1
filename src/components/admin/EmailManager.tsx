import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, FileText, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EmailTemplateViewer from './EmailTemplateViewer';
import EmailConfigCard from './EmailConfigCard';

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

const EMAIL_TYPES = [
  { value: 'welcome_email', label: 'Welcome Email', description: 'Sent when users first sign up' },
  { value: 'welcome_email2', label: 'Welcome Email 2', description: 'Alternative welcome email template' },
  { value: 'new_subscription', label: 'New Subscription', description: 'Sent when users activate subscription' },
  { value: 'new_subscription2', label: 'New Subscription 2', description: 'Alternative subscription email template' }
];

const EmailManager: React.FC = () => {
  const [emailConfigs, setEmailConfigs] = useState<Record<string, EmailConfig>>({});
  const [loading, setLoading] = useState(true);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [templateSaving, setTemplateSaving] = useState(false);
  const [dirtyStates, setDirtyStates] = useState<Record<string, boolean>>({});
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>('welcome_email');
  const { toast } = useToast();

  const fetchEmailConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_configs')
        .select('*')
        .in('config_type', EMAIL_TYPES.map(type => type.value));

      if (error) throw error;
      
      const configsMap = data.reduce((acc: Record<string, EmailConfig>, config: EmailConfig) => {
        acc[config.config_type] = config;
        return acc;
      }, {});
      
      setEmailConfigs(configsMap);
    } catch (error) {
      console.error('Error fetching email configs:', error);
      toast({
        title: "Error",
        description: "Failed to load email configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailConfigUpdate = async (configType: string, field: string, value: any) => {
    const config = emailConfigs[configType];
    if (!config) return;
    
    try {
      setSavingStates(prev => ({ ...prev, [configType]: true }));
      const { error } = await supabase
        .from('email_configs')
        .update({ [field]: value })
        .eq('id', config.id);

      if (error) throw error;

      setEmailConfigs(prev => ({
        ...prev,
        [configType]: { ...config, [field]: value }
      }));
      
      setDirtyStates(prev => ({ ...prev, [configType]: false }));
      
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
      setSavingStates(prev => ({ ...prev, [configType]: false }));
    }
  };

  const saveEmailTemplate = async () => {
    const config = emailConfigs[selectedTemplateType];
    if (!config) return;

    try {
      setTemplateSaving(true);
      const { error } = await supabase
        .from('email_configs')
        .update({ template_html: config.template_html })
        .eq('id', config.id);

      if (error) throw error;

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
      setTemplateSaving(false);
    }
  };

  const handleFieldUpdate = (configType: string, field: string, value: string) => {
    const config = emailConfigs[configType];
    if (!config) return;

    setEmailConfigs(prev => ({
      ...prev,
      [configType]: { ...config, [field]: value }
    }));
    
    setDirtyStates(prev => ({ ...prev, [configType]: true }));
  };

  const handleSaveConfig = (configType: string) => {
    handleEmailConfigUpdate(configType, 'from_name', emailConfigs[configType]?.from_name);
    handleEmailConfigUpdate(configType, 'template_subject', emailConfigs[configType]?.template_subject);
  };

  const handleTemplateHtmlChange = (html: string) => {
    const config = emailConfigs[selectedTemplateType];
    if (!config) return;

    setEmailConfigs(prev => ({
      ...prev,
      [selectedTemplateType]: { ...config, template_html: html }
    }));
  };

  useEffect(() => {
    fetchEmailConfigs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Email Management Header */}
      <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/60 rounded-xl p-6 border border-green-200/40">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground flex items-center tracking-tight">
          <div className="p-2 bg-green-100/80 rounded-lg mr-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          Email Management
        </h1>
        <p className="text-muted-foreground mt-3 text-lg font-medium">Configure email templates and settings</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
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

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {EMAIL_TYPES.map((emailType) => (
              <EmailConfigCard
                key={emailType.value}
                title={emailType.label}
                description={emailType.description}
                config={emailConfigs[emailType.value]}
                loading={loading}
                saving={savingStates[emailType.value] || false}
                isDirty={dirtyStates[emailType.value] || false}
                onToggleEnabled={(enabled) => handleEmailConfigUpdate(emailType.value, 'enabled', enabled)}
                onUpdateField={(field, value) => handleFieldUpdate(emailType.value, field, value)}
                onSave={() => handleSaveConfig(emailType.value)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Customize the HTML templates for your emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-select">Select Email Type</Label>
                <Select
                  value={selectedTemplateType}
                  onValueChange={setSelectedTemplateType}
                >
                  <SelectTrigger id="template-select">
                    <SelectValue placeholder="Choose email type to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TYPES.map((emailType) => (
                      <SelectItem key={emailType.value} value={emailType.value}>
                        {emailType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <EmailTemplateViewer
                htmlContent={emailConfigs[selectedTemplateType]?.template_html || ''}
                onHtmlChange={handleTemplateHtmlChange}
                disabled={loading}
                loading={templateSaving}
                isDirty={emailConfigs[selectedTemplateType]?.template_html !== undefined}
                onSave={saveEmailTemplate}
                saveLoading={templateSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailManager;