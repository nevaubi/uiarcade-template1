import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  MessageSquare, 
  Send,
  Power,
  PowerOff,
  Loader2,
  Trash2,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DocumentUpload from './DocumentUpload';
import DocumentManager from './DocumentManager';
import { useDocuments } from '@/hooks/useDocuments';
import { useChatbotConfig } from '@/hooks/useChatbotConfig';
import ErrorBoundary from '../ErrorBoundary';
import { supabase } from '@/integrations/supabase/client';

interface ChatbotStats {
  documentsCount: number;
  lastUpdated: string;
}

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatbotPanel = () => {
  const [activeTab, setActiveTab] = useState('my-chatbot');
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ChatbotStats | null>(null);
  
  // Test conversation state
  const [testMessages, setTestMessages] = useState<Message[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const testScrollAreaRef = useRef<HTMLDivElement>(null);

  // Use the existing useChatbotConfig hook
  const { config, loading: configLoading, updateConfig } = useChatbotConfig();

  // Local state for form inputs to prevent auto-save
  const [localConfig, setLocalConfig] = useState<typeof config>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize local config when config loads
  useEffect(() => {
    if (config && !localConfig) {
      setLocalConfig(config);
    }
  }, [config, localConfig]);

  // Track if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!config || !localConfig) return false;
    
    return (
      config.chatbot_name !== localConfig.chatbot_name ||
      config.description !== localConfig.description ||
      config.personality !== localConfig.personality ||
      config.role !== localConfig.role ||
      config.custom_instructions !== localConfig.custom_instructions ||
      config.response_style !== localConfig.response_style ||
      config.max_response_length !== localConfig.max_response_length ||
      config.creativity_level !== localConfig.creativity_level ||
      config.include_citations !== localConfig.include_citations ||
      config.fallback_response !== localConfig.fallback_response
    );
  }, [config, localConfig]);

  // Move useDocuments hook here - single source of truth
  const { 
    documents, 
    loading: documentsLoading, 
    uploading, 
    uploadDocument, 
    deleteDocument
  } = useDocuments();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Calculate last updated date from documents
        const getLastUpdated = () => {
          if (documents.length === 0) return 'Never';
          
          const allChunks = documents.flatMap(doc => doc.chunks);
          if (allChunks.length === 0) return 'Never';

          const mostRecentDate = Math.max(
            ...allChunks.map(chunk => new Date(chunk.created_at).getTime())
          );
          
          return formatDistanceToNow(new Date(mostRecentDate), { addSuffix: true });
        };
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set real stats from documents data
        setStats({
          documentsCount: documents.length,
          lastUpdated: getLastUpdated()
        });
      } catch (error) {
        console.error('Error fetching chatbot data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [documents]);

  // Auto-scroll test chat to bottom when new messages are added
  useEffect(() => {
    if (testScrollAreaRef.current) {
      const scrollContainer = testScrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [testMessages]);

  const handleTestMessage = async () => {
    if (!testMessage.trim() || testLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: testMessage.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setTestMessages(prev => [...prev, userMessage]);
    setTestMessage('');
    setTestLoading(true);
    
    try {
      // Pass last 20 messages as conversation history (same as normal chat)
      const conversationHistory = testMessages.slice(-20).map(msg => ({
        role: msg.isBot ? 'assistant' as const : 'user' as const,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: userMessage.content,
          conversationHistory
        },
      });

      if (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data?.error || error.message || 'Failed to get response from chatbot',
          isBot: true,
          timestamp: new Date(),
        };
        setTestMessages(prev => [...prev, errorMessage]);
        return;
      }

      if (data?.response) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isBot: true,
          timestamp: new Date(),
        };
        setTestMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'No response received from chatbot',
          isBot: true,
          timestamp: new Date(),
        };
        setTestMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Test message error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Network error. Please check your connection and try again.',
        isBot: true,
        timestamp: new Date(),
      };
      setTestMessages(prev => [...prev, errorMessage]);
    } finally {
      setTestLoading(false);
    }
  };

  const clearTestHistory = () => {
    setTestMessages([]);
  };

  const toggleChatbotStatus = async () => {
    if (config) {
      const newStatus = config.current_status === 'active' ? 'draft' : 'active';
      await updateConfig({ current_status: newStatus });
    }
  };

  const handleSaveSettings = async () => {
    if (!localConfig || !config || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    
    try {
      // Batch save all changes at once
      const updates = {
        chatbot_name: localConfig.chatbot_name,
        description: localConfig.description,
        personality: localConfig.personality,
        role: localConfig.role,
        custom_instructions: localConfig.custom_instructions,
        response_style: localConfig.response_style,
        max_response_length: localConfig.max_response_length,
        creativity_level: localConfig.creativity_level,
        include_citations: localConfig.include_citations,
        fallback_response: localConfig.fallback_response,
      };

      const updatedConfig = await updateConfig(updates);
      
      // Reset local config to match saved config
      setLocalConfig(updatedConfig);
      
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to update local config
  const updateLocalConfig = (field: string, value: any) => {
    if (!localConfig) return;
    setLocalConfig(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-chatbot">My Chatbot</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="my-chatbot" className="space-y-6">
          {/* Chatbot Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Chatbot Status
                </CardTitle>
                <Button 
                  onClick={toggleChatbotStatus}
                  variant={config?.current_status === 'active' ? 'destructive' : 'default'}
                  size="sm"
                  disabled={configLoading}
                  className={config?.current_status === 'active' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  }
                >
                  {config?.current_status === 'active' ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  <>
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Knowledge Base Documents</p>
                      <p className="text-2xl font-semibold">{stats?.documentsCount || 0}</p>
                      <p className="text-xs text-gray-400">Total uploaded</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Knowledge Base Last Updated</p>
                      <p className="text-2xl font-semibold">{stats?.lastUpdated || 'Never'}</p>
                      <p className="text-xs text-gray-400">Most recent upload</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Chatbot */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Test Your Chatbot
                    {testMessages.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        {testMessages.length} messages
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Test your chatbot with conversation history (last 20 messages context)
                  </CardDescription>
                </div>
                {testMessages.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearTestHistory}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat History Display */}
              {testMessages.length > 0 && (
                <div className="border rounded-lg overflow-hidden bg-gray-50/50">
                  <div className="bg-gray-100 px-3 py-2 border-b">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Bot className="h-4 w-4" />
                      <span className="font-medium">Test Session</span>
                      <span className="text-xs">• {testMessages.length} messages</span>
                    </div>
                  </div>
                  <ScrollArea ref={testScrollAreaRef} className="h-64 px-3 py-2">
                    <div className="space-y-3">
                      {testMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className="flex items-start gap-2 max-w-[80%]">
                            {message.isBot && (
                              <Bot className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex flex-col">
                              <div
                                className={`px-3 py-2 rounded-lg text-sm break-words ${
                                  message.isBot
                                    ? 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                                    : 'bg-blue-500 text-white'
                                }`}
                              >
                                {message.content}
                              </div>
                              <span className="text-xs text-gray-400 mt-1 px-1">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            {!message.isBot && (
                              <User className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                      {testLoading && (
                        <div className="flex justify-start">
                          <div className="flex items-start gap-2">
                            <Bot className="h-5 w-5 text-blue-500 mt-1" />
                            <div className="bg-white text-gray-800 border border-gray-200 shadow-sm px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Message Input */}
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a test message..." 
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleTestMessage()}
                  disabled={testLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTestMessage} 
                  disabled={!testMessage.trim() || testLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {testLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {testMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Start a conversation to test your chatbot</p>
                  <p className="text-xs text-gray-400 mt-1">
                    This will use the same functionality as your live chatbot
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <ErrorBoundary>
            <DocumentUpload 
              uploading={uploading}
              uploadDocument={uploadDocument}
            />
            <DocumentManager 
              documents={documents}
              loading={documentsLoading}
              deleteDocument={deleteDocument}
            />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Chatbot Identity */}
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Identity</CardTitle>
              <CardDescription>
                Define your chatbot's name and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chatbot-name">Chatbot Name</Label>
                  <Input 
                    id="chatbot-name" 
                    placeholder="e.g., Support Assistant" 
                    value={localConfig?.chatbot_name || ''}
                    onChange={(e) => updateLocalConfig('chatbot_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Brief description of your chatbot" 
                    value={localConfig?.description || ''}
                    onChange={(e) => updateLocalConfig('description', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behavior Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Behavior & Personality</CardTitle>
              <CardDescription>
                Configure how your chatbot interacts with users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personality">Personality</Label>
                  <Select 
                    value={localConfig?.personality || ''}
                    onValueChange={(value) => updateLocalConfig('personality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select personality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    placeholder="e.g., Customer Support Specialist" 
                    value={localConfig?.role || ''}
                    onChange={(e) => updateLocalConfig('role', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-instructions">Custom Instructions</Label>
                <Textarea 
                  id="custom-instructions" 
                  placeholder="Add specific instructions for your chatbot..." 
                  className="min-h-[100px]"
                  value={localConfig?.custom_instructions || ''}
                  onChange={(e) => updateLocalConfig('custom_instructions', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Response Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Response Configuration</CardTitle>
              <CardDescription>
                Control how your chatbot generates responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response-style">Response Style</Label>
                  <Select 
                    value={localConfig?.response_style || ''}
                    onValueChange={(value) => updateLocalConfig('response_style', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-length">Max Response Length</Label>
                  <Select 
                    value={localConfig?.max_response_length || ''}
                    onValueChange={(value) => updateLocalConfig('max_response_length', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                      <SelectItem value="medium">Medium (3-5 sentences)</SelectItem>
                      <SelectItem value="long">Long (paragraph)</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creativity">Creativity Level</Label>
                <div className="flex items-center gap-4">
                  <Slider 
                    id="creativity"
                    value={[localConfig?.creativity_level || 30]}
                    onValueChange={(value) => updateLocalConfig('creativity_level', value[0])}
                    max={100}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {localConfig?.creativity_level || 30}%
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Higher values make responses more creative but less predictable
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="citations">Include Citations</Label>
                  <p className="text-xs text-gray-500">
                    Reference source documents in responses
                  </p>
                </div>
                <Switch 
                  id="citations"
                  checked={localConfig?.include_citations || false}
                  onCheckedChange={(checked) => updateLocalConfig('include_citations', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallback-response">Fallback Response</Label>
                <Textarea 
                  id="fallback-response" 
                  placeholder="What should the chatbot say when it can't answer?" 
                  className="min-h-[80px]"
                  value={localConfig?.fallback_response || ''}
                  onChange={(e) => updateLocalConfig('fallback_response', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Settings Button */}
          {hasUnsavedChanges && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800 font-medium">You have unsaved changes</p>
              <p className="text-xs text-amber-600">Click "Save Settings" to apply your changes</p>
            </div>
          )}
          <div className="flex justify-end">
            <Button 
              size="lg" 
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges || isSaving}
              className={hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Settings' : 'No Changes'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotPanel;
