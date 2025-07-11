
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicChatbotStatus {
  current_status: 'active' | 'draft' | 'training' | 'error';
  chatbot_name: string;
  description: string;
}

export const useChatbotStatus = () => {
  const [status, setStatus] = useState<PublicChatbotStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      console.log('Fetching public chatbot status...');
      
      const { data, error } = await supabase.functions.invoke('chatbot-status', {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching chatbot status:', error);
        // Set default inactive status on error
        setStatus({
          current_status: 'draft',
          chatbot_name: 'AI Assistant',
          description: 'Your helpful AI assistant'
        });
      } else {
        console.log('Fetched public status:', data);
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching chatbot status:', error);
      // Set default inactive status on error
      setStatus({
        current_status: 'draft',
        chatbot_name: 'AI Assistant',
        description: 'Your helpful AI assistant'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    refetch: fetchStatus,
  };
};
