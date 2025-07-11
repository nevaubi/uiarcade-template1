
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatbotConfig {
  id: string;
  chatbot_name: string;
  description: string;
  personality: string;
  role: string;
  custom_instructions: string;
  response_style: string;
  max_response_length: string;
  creativity_level: number;
  fallback_response: string;
  current_status: 'active' | 'draft' | 'training' | 'error';
  include_citations: boolean;
  created_at: string;
  updated_at: string;
}

export const useChatbotConfig = () => {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('No session found');
        return;
      }

      const response = await fetch('/api/v1/functions/v1/chatbot-config', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }

      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching chatbot config:', error);
      toast({
        title: "Error",
        description: "Failed to load chatbot configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<ChatbotConfig>) => {
    try {
      setUpdating(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No session found');
      }

      const response = await fetch('/api/v1/functions/v1/chatbot-config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update configuration');
      }

      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      
      toast({
        title: "Success",
        description: "Configuration updated successfully",
      });

      return updatedConfig;
    } catch (error) {
      console.error('Error updating chatbot config:', error);
      toast({
        title: "Error",
        description: "Failed to update configuration",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    updating,
    updateConfig,
    refetch: fetchConfig,
  };
};
