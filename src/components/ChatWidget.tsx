import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatbot } from '@/contexts/ChatbotContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  X, 
  Send, 
  Minimize2,
  Maximize2,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

// Custom cute robot icon component - scaled up for better visibility
const RobotIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="16" height="14" rx="3" fill="currentColor"/>
    <circle cx="12" cy="15" r="2" fill="white"/>
    <circle cx="20" cy="15" r="2" fill="white"/>
    <rect x="13" y="19" width="6" height="2" rx="1" fill="white"/>
    <rect x="14.5" y="5" width="3" height="5" fill="currentColor"/>
    <circle cx="16" cy="4" r="2" fill="currentColor"/>
    <rect x="5" y="14" width="3" height="6" rx="1.5" fill="currentColor"/>
    <rect x="24" y="14" width="3" height="6" rx="1.5" fill="currentColor"/>
  </svg>
);

const ChatWidget = () => {
  const { shouldShowWidget, isWidgetOpen, setIsWidgetOpen, chatbotName } = useChatbot();
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Only show widget for non-authenticated users when chatbot is active
  if (!shouldShowWidget) return null;

  const addMessage = (type: 'bot' | 'user', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to conversation
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages
        .filter(msg => msg.type === 'user' || msg.type === 'bot')
        .map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      console.log('Sending message to chat API...');
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: userMessage,
          conversationHistory
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data.success) {
        // Use the error message from the edge function
        throw new Error(data.error || 'Failed to get response');
      }

      // Add bot response to conversation
      addMessage('bot', data.response);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Use the error message from the edge function if available
      const errorMessage = error.message || 'Failed to send message. Please try again.';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Add appropriate fallback message
      const fallbackMessage = errorMessage.includes('configuration') 
        ? "I apologize, but the chatbot is not properly configured. Please contact the administrator."
        : errorMessage.includes('demand')
        ? "I'm experiencing high demand right now. Please try again in a moment."
        : "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
        
      addMessage('bot', fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat bubble trigger with iOS-style design */}
      {!isWidgetOpen && (
        <Button
          onClick={() => setIsWidgetOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-white hover:bg-gray-50 transition-all duration-500 hover:scale-105 hover:shadow-xl group border border-gray-200/50"
          size="sm"
        >
          <RobotIcon className="h-7 w-7 text-gray-700 group-hover:text-gray-900 transition-colors duration-300" />
        </Button>
      )}

      {/* Chat widget with iOS-style design */}
      {isWidgetOpen && (
        <Card className={`shadow-xl transition-all duration-500 ease-out border border-gray-200/50 overflow-hidden backdrop-blur-xl bg-white/95 animate-in fade-in-0 zoom-in-95 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          {/* Header with iOS-style design */}
          <CardHeader className="bg-white/80 backdrop-blur-lg text-gray-900 p-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="bg-gray-100/80 p-1.5 rounded-xl">
                  <RobotIcon className="h-5 w-5 text-gray-700" />
                </div>
                <span className="text-gray-900">{chatbotName}</span>
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWidgetOpen(false)}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Chat content with iOS-style design */}
          {!isMinimized && (
            <>
              <CardContent className="p-0 flex-1 overflow-hidden bg-gray-50/50">
                <ScrollArea ref={scrollAreaRef} className="h-[340px] p-4">
                  <div className="space-y-3">
                    {messages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-50 slide-in-from-bottom-1 duration-300`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                            msg.type === 'user'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                          }`}
                        >
                          {msg.content}
                          <div className={`text-xs mt-0.5 ${
                            msg.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start animate-in fade-in-50 slide-in-from-bottom-1 duration-300">
                        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-800 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input area with iOS-style design */}
              <div className="border-t border-gray-200/50 bg-white/80 backdrop-blur-lg p-4">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    className="flex-1 text-sm border-gray-300 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 placeholder:text-gray-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:hover:bg-blue-500"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;
