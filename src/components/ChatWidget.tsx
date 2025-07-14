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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 mx-4 sm:mx-0">
      {isWidgetOpen ? (
        <Card className="w-full max-w-sm h-[500px] max-h-[80vh] shadow-xl border-navy-200/50 bg-white/95 backdrop-blur-sm overflow-hidden flex flex-col animate-scale-in">
          <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 p-4 bg-gradient-to-r from-navy-600 to-navy-700 border-b border-navy-200/20">
            <CardTitle className="text-lg font-semibold text-white">
              {status.chatbot_name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsWidgetOpen(false)}
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-sm break-words ${
                        message.isBot
                          ? 'bg-navy-50 text-navy-900 border border-navy-200/50'
                          : 'bg-navy-600 text-white hover:bg-navy-700 transition-colors'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-navy-50 text-navy-700 border border-navy-200/50 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex-shrink-0 p-4 border-t border-navy-200/30 bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isRateLimited ? `Wait ${timeUntilReset}s...` : "Type your message..."}
                  disabled={isLoading || isRateLimited}
                  className="flex-1 text-sm border-navy-300 focus:border-navy-500 focus:ring-navy-500"
                />
                <Button
                  onClick={sendMessage}
                  size="icon"
                  disabled={isLoading || !inputMessage.trim() || isRateLimited}
                  className="bg-navy-600 hover:bg-navy-700 text-white flex-shrink-0 transition-colors min-w-[44px] min-h-[44px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {isRateLimited && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  Rate limit reached. Please wait {timeUntilReset} seconds.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsWidgetOpen(true)}
          className="h-20 w-20 rounded-full shadow-lg bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 transition-all duration-300 hover:scale-105 hover:shadow-xl group border border-navy-500/20"
        >
          <Bot className="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-300" />
        </Button>
      )}
    </div>
  );
};

export default ChatWidget;
