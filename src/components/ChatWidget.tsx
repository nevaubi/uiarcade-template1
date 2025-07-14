import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Loader2, Bot } from 'lucide-react';
import { useChatbotStatus } from '@/hooks/useChatbotStatus';
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

  // Don't render if chatbot is not active or still loading
  if (loading || !status || status.current_status !== 'active') {
    return null;
  }

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50">
      {isWidgetOpen ? (
        <Card className="w-[90vw] max-w-sm sm:w-96 h-[80vh] sm:h-[500px] shadow-xl border-gray-200/50 bg-white/95 backdrop-blur-sm overflow-hidden flex flex-col">
          <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
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
                          ? 'bg-gray-100 text-gray-800 border border-gray-200'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 border border-gray-200 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex-shrink-0 p-4 border-t border-gray-200/50 bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isRateLimited ? `Wait ${timeUntilReset}s...` : "Type your message..."}
                  disabled={isLoading || isRateLimited}
                  className="flex-1 text-sm border-gray-300 focus:border-blue-400"
                />
                <Button
                  onClick={sendMessage}
                  size="icon"
                  disabled={isLoading || !inputMessage.trim() || isRateLimited}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex-shrink-0"
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
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-lg bg-white hover:bg-gray-50 transition-all duration-500 hover:scale-105 hover:shadow-xl group border border-gray-200/50"
        >
          <Bot 
            className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300" 
            style={{ width: '60px', height: '60px' }}
          />
        </Button>
      )}
    </div>
  );
};

export default ChatWidget;
