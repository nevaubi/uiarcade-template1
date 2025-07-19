import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

interface EmailConfigCardProps {
  title: string;
  description: string;
  config: EmailConfig | null;
  loading: boolean;
  saving: boolean;
  isDirty: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  onUpdateField: (field: string, value: string) => void;
  onSave: () => void;
}

const EmailConfigCard: React.FC<EmailConfigCardProps> = ({
  title,
  description,
  config,
  loading,
  saving,
  isDirty,
  onToggleEnabled,
  onUpdateField,
  onSave
}) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading {title}...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card className="w-full opacity-50">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Configuration not found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load email configuration.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Email</Label>
            <div className="text-muted-foreground">
              Turn on/off this email type
            </div>
          </div>
          <Switch 
            checked={config.enabled} 
            onCheckedChange={onToggleEnabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`from-name-${config.config_type}`}>From Name</Label>
          <Input
            id={`from-name-${config.config_type}`}
            value={config.from_name}
            onChange={(e) => onUpdateField('from_name', e.target.value)}
            placeholder="e.g., Our Team"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`subject-${config.config_type}`}>Email Subject</Label>
          <Input
            id={`subject-${config.config_type}`}
            value={config.template_subject}
            onChange={(e) => onUpdateField('template_subject', e.target.value)}
            placeholder="e.g., Welcome to our platform!"
          />
        </div>

        {isDirty && (
          <Button 
            onClick={onSave}
            disabled={saving}
            className="w-full"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailConfigCard;