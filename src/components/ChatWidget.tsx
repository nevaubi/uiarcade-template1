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

// Custom cute robot icon component
const RobotIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="7" width="12" height="10" rx="2" fill="currentColor" opacity="0.9"/>
    <circle cx="9" cy="11" r="1" fill="white"/>
    <circle cx="15" cy="11" r="1" fill="white"/>
    <rect x="10" y="13" width="4" height="1" rx="0.5" fill="white"/>
    <rect x="11" y="4" width="2" height="3" fill="currentColor" opacity="0.7"/>
    <circle cx="12" cy="3" r="1" fill="currentColor" opacity="0.7"/>
    <rect x="4" y="10" width="2" height="4" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="18" y="10" width="2" height="4" rx="1" fill="currentColor" opacity="0.7"/>
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
      {/* Chat bubble trigger with enhanced animation */}
      {!isWidgetOpen && (
        <Button
          onClick={() => setIsWidgetOpen(true)}
          className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all duration-300 hover:scale-110 hover:shadow-xl group"
          size="sm"
        >
          <RobotIcon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
        </Button>
      )}

      {/* Chat widget with enhanced styling */}
      {isWidgetOpen && (
        <Card className={`shadow-2xl transition-all duration-300 ease-in-out border-0 overflow-hidden ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          {/* Header with improved gradient */}
          <CardHeader className="bg-gradient-to-br from-violet-600 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                  <RobotIcon className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold">{chatbotName}</span>
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWidgetOpen(false)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Chat content with improved styling */}
          {!isMinimized && (
            <>
              <CardContent className="p-0 flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                <ScrollArea ref={scrollAreaRef} className="h-[340px] p-4">
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white'
                              : 'bg-white border border-gray-100 text-gray-800'
                          }`}
                        >
                          {msg.content}
                          <div className={`text-xs mt-1 ${
                            msg.type === 'user' ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-800 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin text-violet-600" />
                            <div className="flex gap-1">
                              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input area with enhanced styling */}
              <div className="border-t bg-white p-4">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 text-sm border-gray-200 focus:border-violet-500 focus:ring-violet-500 transition-colors"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    size="sm"
                    className="bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
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
