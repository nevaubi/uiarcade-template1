import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const fetchConfig = async () => {
    // Only fetch if user is authenticated
    if (!user) {
      console.log('No authenticated user, skipping config fetch');
      setConfig(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching chatbot config for authenticated user...');
      
      const { data, error } = await supabase.functions.invoke('chatbot-config', {
        method: 'GET'
      });

      if (error) {
        console.error('Supabase function error:', error);
        // Only show error toast for actual errors, not auth issues
        if (!error.message?.includes('Unauthorized')) {
          toast({
            title: "Error",
            description: "Failed to load chatbot configuration",
            variant: "destructive",
          });
        }
        setConfig(null);
        return;
      }

      console.log('Fetched config:', data);
      setConfig(data);
    } catch (error) {
      console.error('Error fetching chatbot config:', error);
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<ChatbotConfig>) => {
    if (!user) {
      console.error('Cannot update config without authentication');
      return;
    }

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
  }, [user]); // Re-fetch when user changes

  return {
    config,
    loading,
    updating,
    updateConfig,
    refetch: fetchConfig,
  };
};
