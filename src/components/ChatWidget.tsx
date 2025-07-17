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
        <Card className="w-[90vw] max-w-sm sm:w-96 h-[80vh] sm:h-[500px] shadow-2xl border-navy-200/30 bg-card/98 backdrop-blur-lg overflow-hidden flex flex-col animate-fade-in navy-card">
          <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 p-4 bg-gradient-to-r from-navy-50 to-navy-100 border-b border-navy-200/50">
            <CardTitle className="text-base font-semibold text-navy-900 flex items-center gap-2">
              <Bot className="h-4 w-4 text-navy-600" />
              {status.chatbot_name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsWidgetOpen(false)}
              className="h-8 w-8 text-navy-500 hover:text-navy-700 hover:bg-navy-100/50 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-3">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`flex items-start gap-2 max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                        message.isBot ? 'bg-navy-100 text-navy-600' : 'bg-primary text-primary-foreground'
                      }`}>
                        {message.isBot ? <Bot className="h-3 w-3" /> : <span className="text-xs font-medium">U</span>}
                      </div>
                      <div className="flex flex-col">
                        <div
                          className={`px-4 py-3 rounded-xl text-sm break-words shadow-sm transition-all duration-200 hover:shadow-md ${
                            message.isBot
                              ? 'bg-navy-50 text-navy-900 border border-navy-200/50'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          {message.content}
                        </div>
                        <span className={`text-xs mt-1 px-2 ${
                          message.isBot ? 'text-navy-400' : 'text-navy-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-navy-100 text-navy-600">
                        <Bot className="h-3 w-3" />
                      </div>
                      <div className="bg-navy-50 text-navy-900 border border-navy-200/50 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm">
                        <div className="relative">
                          <Loader2 className="h-3 w-3 animate-spin text-navy-600" />
                        </div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex-shrink-0 p-4 border-t border-navy-200/50 bg-card">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isRateLimited ? `Wait ${timeUntilReset}s...` : "Type your message..."}
                  disabled={isLoading || isRateLimited}
                  className="flex-1 text-sm border-navy-300 focus:border-primary focus:ring-1 focus:ring-primary/20 bg-background transition-all duration-200 min-h-[44px]"
                />
                <Button
                  onClick={sendMessage}
                  size="icon"
                  disabled={isLoading || !inputMessage.trim() || isRateLimited}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 min-h-[44px] min-w-[44px] shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {isRateLimited && (
                <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  Rate limit reached. Please wait {timeUntilReset} seconds.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsWidgetOpen(true)}
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-[0_8px_30px_hsl(var(--navy-900)/0.12)] bg-gradient-to-br from-card to-navy-50/95 hover:from-navy-50 hover:to-navy-100/95 backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.05] active:scale-95 hover:shadow-[0_16px_50px_hsl(var(--navy-900)/0.2)] group border border-navy-200/30 animate-float will-change-transform"
        >
          <Bot 
            className="text-navy-600 group-hover:text-navy-700 transition-all duration-300 group-hover:scale-110" 
            style={{ width: '54px', height: '54px' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-navy-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Button>
      )}
    </div>
  );
};

export default ChatWidget;
