import { useState, useEffect, useRef, FormEvent } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useChatbot } from '../contexts/ChatbotContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send, Bot, User, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';

// Define the Message interface
interface Message {
  text: string;
  sender: 'user' | 'bot';
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { chatbotName, chatbotAvatar, initialMessage } = useChatbot();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialMessage && messages.length === 0) {
      setMessages([{ text: initialMessage, sender: 'bot' }]);
    }
  }, [isOpen, initialMessage, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          query: input,
          history: messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            parts: [{ text: msg.text }],
          })),
        },
      });

      if (error) {
        throw error;
      }

      if (data && data.response) {
        setMessages([...newMessages, { text: data.response, sender: 'bot' }]);
      } else {
        setMessages([...newMessages, { text: "I'm sorry, I couldn't get a response.", sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Error chatting with AI:', error);
      const errorMessage = (error as Error).message || 'An unknown error occurred';
      toast.error(`Error: ${errorMessage}`);
      setMessages([...newMessages, { text: "Sorry, something went wrong. Please try again.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="fixed bottom-4 right-4 z-50">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={toggleOpen}
            className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center"
          >
            <AnimatePresence>
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 180, scale: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <X size={32} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: -180, scale: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Bot size={32} />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed bottom-24 right-4 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[600px] overflow-hidden"
            >
              <header className="bg-gray-50 p-4 border-b border-gray-200 flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={chatbotAvatar || 'https://placehold.co/40x40/7c3aed/ffffff?text=B'} alt="Chatbot Avatar" />
                  <AvatarFallback>{chatbotName ? chatbotName.charAt(0) : 'B'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{chatbotName || 'Chatbot'}</h3>
                  <p className="text-sm text-green-500 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </header>

              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}
                    >
                      {message.sender === 'bot' && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={chatbotAvatar || 'https://placehold.co/32x32/7c3aed/ffffff?text=B'} alt="Bot" />
                          <AvatarFallback>{chatbotName ? chatbotName.charAt(0) : 'B'}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                      {message.sender === 'user' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback><User size={18} /></AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3"
                    >
                      <Avatar className="w-8 h-8">
                         <AvatarImage src={chatbotAvatar || 'https://placehold.co/32x32/7c3aed/ffffff?text=B'} alt="Bot" />
                         <AvatarFallback>{chatbotName ? chatbotName.charAt(0) : 'B'}</AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              <footer className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full focus-visible:ring-2 focus-visible:ring-indigo-400"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    className="rounded-full w-10 h-10 p-0 bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading || !input.trim()}
                  >
                    <Send size={20} />
                  </Button>
                </form>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
