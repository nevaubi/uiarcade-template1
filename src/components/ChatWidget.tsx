import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Loader2, Bot } from 'lucide-react';
import { useChatbotStatus } from '@/hooks/useChatbotStatus';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRateLimit } from '@/hooks/useRateLimit';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatWidget = () => {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { status, loading } = useChatbotStatus();
  const { isRateLimited, timeUntilReset } = useRateLimit();
  const { user } = useAuth();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Auto-focus input when widget opens
  useEffect(() => {
    if (isWidgetOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isWidgetOpen]);

  // Add welcome message when widget opens for the first time
  useEffect(() => {
    if (isWidgetOpen && messages.length === 0 && status) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hello! I'm ${status.chatbot_name}. How can I help you today?`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isWidgetOpen, messages.length, status]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isRateLimited) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.isBot ? 'assistant' as const : 'user' as const,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: userMessage.content,
          conversationHistory 
        },
      });

      // Handle rate limiting
      if (error && error.message?.includes('Rate limit')) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: error.message,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        return;
      }

      if (error) {
        console.error('Chat error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data?.error || error.message || 'Sorry, I encountered an error. Please try again.',
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      if (data?.response) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Network error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered a network error. Please check your connection and try again.',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Don't render if chatbot is not active, still loading, or user is logged in
  if (loading || !status || status.current_status !== 'active' || user) {
    return null;
  }

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50">
      {isWidgetOpen ? (
        <Card className="w-[90vw] max-w-sm sm:w-96 h-[70vh] sm:h-[500px] shadow-xl border-gray-200/50 bg-white/95 backdrop-blur-sm overflow-hidden flex flex-col">
          <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 p-4 bg-blue-100 border-b border-blue-200">
            <CardTitle className="text-base font-medium text-gray-800">
              {status.chatbot_name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsWidgetOpen(false)}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-3">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-lg text-sm break-words ${
                        message.isBot
                          ? 'bg-blue-50 text-gray-800 border border-blue-100'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-blue-50 text-gray-800 border border-blue-100 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200/50 bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isRateLimited ? `Wait ${timeUntilReset}s...` : "Type your message..."}
                  inputMode="text"
                  enterKeyHint="send"
                  disabled={isLoading || isRateLimited}
                  className="flex-1 text-sm border-gray-300 focus:border-blue-400"
                />
                <Button
                  onClick={sendMessage}
                  size="icon"
                  disabled={isLoading || !inputMessage.trim() || isRateLimited}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {isRateLimited && (
                <p className="text-xs text-red-500 mt-1">
                  Rate limit reached. Please wait {timeUntilReset} seconds.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsWidgetOpen(true)}
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-[0_8px_30px_rgba(37,99,235,0.2)] bg-white hover:bg-gray-50 backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 hover:shadow-[0_12px_40px_rgba(37,99,235,0.25)] group border-2 border-blue-100 relative"
        >
          <Bot 
            className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300" 
            style={{ width: '42px', height: '42px' }}
          />
          <span className="absolute inset-0 rounded-full border-4 border-blue-200/50 animate-pulse"></span>
        </Button>
      )}
    </div>
  );
};

export default ChatWidget;
