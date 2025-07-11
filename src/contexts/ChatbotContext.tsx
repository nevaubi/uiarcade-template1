
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatbotContextType {
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  isWidgetOpen: boolean;
  setIsWidgetOpen: (open: boolean) => void;
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
  const [isActive, setIsActive] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  return (
    <ChatbotContext.Provider
      value={{
        isActive,
        setIsActive,
        isWidgetOpen,
        setIsWidgetOpen,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};
