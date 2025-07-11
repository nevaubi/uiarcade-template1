
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useChatbotConfig, ChatbotConfig } from '@/hooks/useChatbotConfig';

interface ChatbotContextType {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  isWidgetOpen: boolean;
  setIsWidgetOpen: (open: boolean) => void;
  config: ChatbotConfig | null;
  updateConfig: (updates: Partial<ChatbotConfig>) => Promise<ChatbotConfig | undefined>;
  configLoading: boolean;
  configUpdating: boolean;
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
  const { config, loading: configLoading, updating: configUpdating, updateConfig } = useChatbotConfig();
  
  // Derive isActive from config current_status
  const isActive = config?.current_status === 'active';

  const setIsActive = async (active: boolean) => {
    const newStatus = active ? 'active' : 'draft';
    await updateConfig({ current_status: newStatus });
  };

  return (
    <ChatbotContext.Provider
      value={{
        isActive,
        setIsActive,
        isWidgetOpen,
        setIsWidgetOpen,
        config,
        updateConfig,
        configLoading,
        configUpdating,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};
