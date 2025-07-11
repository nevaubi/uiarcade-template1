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
  AlertCircle
} from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import DocumentManager from './DocumentManager';
import { useDocuments } from '@/hooks/useDocuments';
import ErrorBoundary from '../ErrorBoundary';

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

interface ChatbotSettings {
  name: string;
  avatar: string;
  description: string;
  personality: string;
  role: string;
  customInstructions: string;
  responseStyle: string;
  maxLength: string;
  includeCitations: boolean;
  creativityLevel: number;
  fallbackResponse: string;
}

const ChatbotPanel = () => {
  const [activeTab, setActiveTab] = useState('my-chatbot');
  const [chatbotStatus, setChatbotStatus] = useState<'active' | 'draft' | 'training' | 'error'>('draft');
  const [testMessage, setTestMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ChatbotStats | null>(null);
  const [settings, setSettings] = useState<ChatbotSettings>({
    name: '',
    avatar: '',
    description: '',
    personality: '',
    role: '',
    customInstructions: '',
    responseStyle: '',
    maxLength: '',
    includeCitations: false,
    creativityLevel: 30,
    fallbackResponse: ''
  });

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
        // setSettings(data.settings);
        // setChatbotStatus(data.status);
        
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

  const handleSettingsUpdate = async (field: keyof ChatbotSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    // TODO: Update settings in backend
    // await updateChatbotSettings({ [field]: value });
  };

  const handleTestMessage = async () => {
    if (!testMessage.trim()) return;
    
    // TODO: Send test message to chatbot
    console.log('Test message:', testMessage);
    setTestMessage('');
  };

  const toggleChatbotStatus = async () => {
    const newStatus = chatbotStatus === 'active' ? 'draft' : 'active';
    setChatbotStatus(newStatus);
    // TODO: Update status in backend
    // await updateChatbotStatus(newStatus);
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
                  variant={chatbotStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                >
                  {chatbotStatus === 'active' ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Active
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Draft
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
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a test message..." 
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                />
                <Button onClick={handleTestMessage} disabled={!testMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="border-b pb-2 last:border-b-0">
                      <p className="text-sm font-medium">{conv.user}</p>
                      <p className="text-xs text-gray-600 truncate">{conv.message}</p>
                      <p className="text-xs text-gray-500">{conv.time}</p>
                    </div>
                  ))}
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
                    value={settings.name}
                    onChange={(e) => handleSettingsUpdate('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Brief description of your chatbot" 
                    value={settings.description}
                    onChange={(e) => handleSettingsUpdate('description', e.target.value)}
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
                    value={settings.personality}
                    onValueChange={(value) => handleSettingsUpdate('personality', value)}
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
                    value={settings.role}
                    onChange={(e) => handleSettingsUpdate('role', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-instructions">Custom Instructions</Label>
                <Textarea 
                  id="custom-instructions" 
                  placeholder="Add specific instructions for your chatbot..." 
                  className="min-h-[100px]"
                  value={settings.customInstructions}
                  onChange={(e) => handleSettingsUpdate('customInstructions', e.target.value)}
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
                    value={settings.responseStyle}
                    onValueChange={(value) => handleSettingsUpdate('responseStyle', value)}
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
                    value={settings.maxLength}
                    onValueChange={(value) => handleSettingsUpdate('maxLength', value)}
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
                    value={[settings.creativityLevel]}
                    onValueChange={(value) => handleSettingsUpdate('creativityLevel', value[0])}
                    max={100}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">
                    {settings.creativityLevel}%
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
                  checked={settings.includeCitations}
                  onCheckedChange={(checked) => handleSettingsUpdate('includeCitations', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallback-response">Fallback Response</Label>
                <Textarea 
                  id="fallback-response" 
                  placeholder="What should the chatbot say when it can't answer?" 
                  className="min-h-[80px]"
                  value={settings.fallbackResponse}
                  onChange={(e) => handleSettingsUpdate('fallbackResponse', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Settings Button */}
          <div className="flex justify-end">
            <Button size="lg">
              Save Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotPanel;
