import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  FileText, 
  MessageSquare, 
  Activity, 
  Settings, 
  Play, 
  Pause, 
  Send,
  Clock,
  Users,
  TrendingUp,
  RotateCcw,
  AlertCircle,
  Power,
  PowerOff
} from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import DocumentManager from './DocumentManager';
import { useDocuments } from '@/hooks/useDocuments';
import { useChatbotConfig } from '@/hooks/useChatbotConfig';
import ErrorBoundary from '../ErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  status: 'processed' | 'processing' | 'error';
}

interface Conversation {
  id: string;
  user: string;
  message: string;
  time: string;
}

interface ChatbotStats {
  totalChats: number;
  avgResponseTime: string;
  userSatisfaction: string;
  documentsCount: number;
  lastActivity: string;
}

const ChatbotPanel = () => {
  const [activeTab, setActiveTab] = useState('my-chatbot');
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ChatbotStats | null>(null);
  
  // Test message state
  const [testResponse, setTestResponse] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState('');

  // Use the existing useChatbotConfig hook
  const { config, loading: configLoading, updating, updateConfig } = useChatbotConfig();

  // Move useDocuments hook here - single source of truth
  const { 
    documents, 
    loading: documentsLoading, 
    uploading, 
    uploadDocument, 
    deleteDocument, 
    refreshDocuments 
  } = useDocuments();

  useEffect(() => {
    // Placeholder for data fetching
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Fetch chatbot data from backend
        // const data = await fetchChatbotData();
        // setConversations(data.conversations);
        // setStats(data.stats);
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock stats with actual document count
        setStats({
          totalChats: 0,
          avgResponseTime: '0s',
          userSatisfaction: '0%',
          documentsCount: documents.length,
          lastActivity: 'Never'
        });
      } catch (error) {
        console.error('Error fetching chatbot data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [documents.length]);

  const handleConfigUpdate = async (field: string, value: any) => {
    if (config) {
      await updateConfig({ [field]: value });
    }
  };

  const handleTestMessage = async () => {
    if (!testMessage.trim() || testLoading) return;
    
    setTestLoading(true);
    setTestError('');
    setTestResponse('');
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { 
          message: testMessage.trim(),
          conversationHistory: [] // Fresh test with no history
        },
      });

      if (error) {
        setTestError(data?.error || error.message || 'Failed to get response from chatbot');
        return;
      }

      if (data?.response) {
        setTestResponse(data.response);
      } else {
        setTestError('No response received from chatbot');
      }
    } catch (error) {
      console.error('Test message error:', error);
      setTestError('Network error. Please check your connection and try again.');
    } finally {
      setTestLoading(false);
      setTestMessage('');
    }
  };

  const toggleChatbotStatus = async () => {
    if (config) {
      const newStatus = config.current_status === 'active' ? 'draft' : 'active';
      await updateConfig({ current_status: newStatus });
    }
  };

  const handleSaveSettings = async () => {
    if (!config) return;
    
    // The config is already being updated in real-time through handleConfigUpdate
    // This button can be used to provide user feedback or trigger a manual save
    console.log('Settings saved successfully');
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {isLoading ? (
                  <>
                    {[...Array(4)].map((_, i) => (
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
                      <p className="text-sm text-gray-500">Total Conversations</p>
                      <p className="text-2xl font-semibold">{stats?.totalChats || 0}</p>
                      <p className="text-xs text-gray-400">All time</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Avg Response Time</p>
                      <p className="text-2xl font-semibold">{stats?.avgResponseTime || '0s'}</p>
                      <p className="text-xs text-gray-400">Last 24h</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">User Satisfaction</p>
                      <p className="text-2xl font-semibold">{stats?.userSatisfaction || '0%'}</p>
                      <p className="text-xs text-gray-400">Based on feedback</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Knowledge Base</p>
                      <p className="text-2xl font-semibold">{stats?.documentsCount || 0}</p>
                      <p className="text-xs text-gray-400">Documents</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Chatbot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Test Your Chatbot
              </CardTitle>
              <CardDescription>
                Send a test message to see how your chatbot responds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a test message..." 
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                  disabled={testLoading}
                />
                <Button 
                  onClick={handleTestMessage} 
                  disabled={!testMessage.trim() || testLoading}
                >
                  {testLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Test Response Display */}
              {(testResponse || testError) && (
                <div className="mt-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Chatbot Response:</span>
                  </div>
                  {testError ? (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded border">
                      {testError}
                    </div>
                  ) : (
                    <div className="text-gray-700 text-sm bg-gray-50 p-3 rounded border">
                      {testResponse}
                    </div>
                  )}
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
                    value={config?.chatbot_name || ''}
                    onChange={(e) => handleConfigUpdate('chatbot_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Brief description of your chatbot" 
                    value={config?.description || ''}
                    onChange={(e) => handleConfigUpdate('description', e.target.value)}
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
                    value={config?.personality || ''}
                    onValueChange={(value) => handleConfigUpdate('personality', value)}
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
                    value={config?.role || ''}
                    onChange={(e) => handleConfigUpdate('role', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-instructions">Custom Instructions</Label>
                <Textarea 
                  id="custom-instructions" 
                  placeholder="Add specific instructions for your chatbot..." 
                  className="min-h-[100px]"
                  value={config?.custom_instructions || ''}
                  onChange={(e) => handleConfigUpdate('custom_instructions', e.target.value)}
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
                    value={config?.response_style || ''}
                    onValueChange={(value) => handleConfigUpdate('response_style', value)}
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
                    value={config?.max_response_length || ''}
                    onValueChange={(value) => handleConfigUpdate('max_response_length', value)}
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
                    value={[config?.creativity_level || 30]}
                    onValueChange={(value) => handleConfigUpdate('creativity_level', value[0])}
                    max={100}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {config?.creativity_level || 30}%
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
                  checked={config?.include_citations || false}
                  onCheckedChange={(checked) => handleConfigUpdate('include_citations', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallback-response">Fallback Response</Label>
                <Textarea 
                  id="fallback-response" 
                  placeholder="What should the chatbot say when it can't answer?" 
                  className="min-h-[80px]"
                  value={config?.fallback_response || ''}
                  onChange={(e) => handleConfigUpdate('fallback_response', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Settings Button */}
          <div className="flex justify-end">
            <Button 
              size="lg" 
              onClick={handleSaveSettings}
              disabled={updating}
            >
              {updating ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotPanel;
