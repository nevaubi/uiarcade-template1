
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useChatbotConfig, ChatbotConfig } from '@/hooks/useChatbotConfig';
import { useChatbotStatus, PublicChatbotStatus } from '@/hooks/useChatbotStatus';
import { useAuth } from '@/contexts/AuthContext';

interface ChatbotContextType {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  isWidgetOpen: boolean;
  setIsWidgetOpen: (open: boolean) => void;
  config: ChatbotConfig | null;
  publicStatus: PublicChatbotStatus | null;
  updateConfig: (updates: Partial<ChatbotConfig>) => Promise<ChatbotConfig | undefined>;
  configLoading: boolean;
  configUpdating: boolean;
  isAdmin: boolean;
  chatbotName: string;
  chatbotDescription: string;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const { user } = useAuth();
  
  // Try to fetch admin config (will fail gracefully for non-admin users)
  const { config, loading: configLoading, updating: configUpdating, updateConfig } = useChatbotConfig();
  
  // Always fetch public status for widget visibility
  const { status: publicStatus, loading: statusLoading } = useChatbotStatus();
  
  // Determine if user is admin based on successful config fetch
  const isAdmin = config !== null && user !== null;
  
  // Derive isActive from appropriate source
  const isActive = isAdmin ? config?.current_status === 'active' : publicStatus?.current_status === 'active';
  
  // Get chatbot display info from appropriate source
  const chatbotName = isAdmin ? (config?.chatbot_name || 'AI Assistant') : (publicStatus?.chatbot_name || 'AI Assistant');
  const chatbotDescription = isAdmin ? (config?.description || 'Your helpful AI assistant') : (publicStatus?.description || 'Your helpful AI assistant');

  const setIsActive = async (active: boolean) => {
    if (isAdmin && updateConfig) {
      const newStatus = active ? 'active' : 'draft';
      await updateConfig({ current_status: newStatus });
    }
  };

  return (
    <ChatbotContext.Provider
      value={{
        isActive: isActive || false,
        setIsActive,
        isWidgetOpen,
        setIsWidgetOpen,
        config,
        publicStatus,
        updateConfig,
        configLoading: configLoading || statusLoading,
        configUpdating,
        isAdmin,
        chatbotName,
        chatbotDescription,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};
