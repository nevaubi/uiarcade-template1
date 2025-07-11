
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
      console.log('Fetching chatbot config...');
      
      const { data, error } = await supabase.functions.invoke('chatbot-config', {
        method: 'GET'
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Fetched config:', data);
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
      console.log('Updating chatbot config with:', updates);
      
      const { data, error } = await supabase.functions.invoke('chatbot-config', {
        method: 'PUT',
        body: updates
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Updated config:', data);
      setConfig(data);
      
      toast({
        title: "Success",
        description: "Configuration updated successfully",
      });

      return data;
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
