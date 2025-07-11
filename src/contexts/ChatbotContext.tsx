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
  shouldShowWidget: boolean; // New property
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
  
  // Always fetch public status for everyone
  const { status: publicStatus, loading: statusLoading } = useChatbotStatus();
  
  // Conditionally use config hook based on auth
  const configHook = user ? useChatbotConfig() : { 
    config: null, 
    loading: false, 
    updating: false, 
    updateConfig: async () => undefined 
  };
  
  const { config, loading: configLoading, updating: configUpdating, updateConfig } = configHook;
  
  // Determine if user is admin based on successful config fetch
  const isAdmin = config !== null && user !== null;
  
  // For admins: show config status, for public: show public status
  const isActive = isAdmin ? config?.current_status === 'active' : publicStatus?.current_status === 'active';
  
  // Widget should only show for non-authenticated users when active
  const shouldShowWidget = !user && publicStatus?.current_status === 'active';
  
  // Get chatbot display info
  const chatbotName = publicStatus?.chatbot_name || 'AI Assistant';
  const chatbotDescription = publicStatus?.description || 'Your helpful AI assistant';

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
        shouldShowWidget,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};
