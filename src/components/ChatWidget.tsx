
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatbot } from '@/contexts/ChatbotContext';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot,
  Minimize2,
  Maximize2
} from 'lucide-react';

const ChatWidget = () => {
  const { isActive, isWidgetOpen, setIsWidgetOpen } = useChatbot();
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  // Mock messages for demonstration
  const mockMessages = [
    { id: 1, type: 'bot', content: 'Hello! How can I help you today?', timestamp: new Date() },
    { id: 2, type: 'user', content: 'Hi there!', timestamp: new Date() },
    { id: 3, type: 'bot', content: 'I\'m here to assist you with any questions you might have. What would you like to know?', timestamp: new Date() }
  ];

  if (!isActive) return null;

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // TODO: Implement actual message sending
    console.log('Sending message:', message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat bubble trigger */}
      {!isWidgetOpen && (
        <Button
          onClick={() => setIsWidgetOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-110"
          size="sm"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat widget */}
      {isWidgetOpen && (
        <Card className={`shadow-2xl transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-80 h-96'
        }`}>
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-3 w-3" />
                  ) : (
                    <Minimize2 className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWidgetOpen(false)}
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Chat content - only show when not minimized */}
          {!isMinimized && (
            <>
              {/* Messages area */}
              <CardContent className="p-0 flex-1">
                <ScrollArea className="h-64 p-4">
                  <div className="space-y-3">
                    {mockMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input area */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Send className="h-4 w-4" />
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
