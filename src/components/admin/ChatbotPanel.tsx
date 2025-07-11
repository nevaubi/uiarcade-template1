
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Bot, 
  Upload, 
  FileText, 
  MessageSquare, 
  Activity, 
  Settings, 
  Play, 
  Pause, 
  Trash2,
  Download,
  Send,
  Clock,
  Users,
  TrendingUp,
  FileIcon,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

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
  const [documents, setDocuments] = useState<Document[]>([]);
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

  useEffect(() => {
    // Placeholder for data fetching
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Fetch chatbot data from backend
        // const data = await fetchChatbotData();
        // setDocuments(data.documents);
        // setConversations(data.conversations);
        // setStats(data.stats);
        // setSettings(data.settings);
        // setChatbotStatus(data.status);
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error fetching chatbot data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSettingsUpdate = async (field: keyof ChatbotSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    // TODO: Update settings in backend
    // await updateChatbotSettings({ [field]: value });
  };

  const handleTestMessage = async () => {
    if (!testMessage.trim()) return;
    // TODO: Send test message to chatbot
    // const response = await testChatbot(testMessage);
    setTestMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'training': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'error': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chatbot Management</h2>
        <p className="text-gray-600">Configure and manage your AI chatbot assistant</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-chatbot">My Chatbot</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="my-chatbot" className="space-y-6">
          {/* Chatbot Status Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Chatbot Status
              </CardTitle>
              <CardDescription>
                Current status and overview of your chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={getStatusColor(chatbotStatus)}>
                        {chatbotStatus === 'active' && <Play className="h-3 w-3 mr-1" />}
                        {chatbotStatus === 'draft' && <Pause className="h-3 w-3 mr-1" />}
                        {chatbotStatus === 'training' && <RotateCcw className="h-3 w-3 mr-1" />}
                        {chatbotStatus === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {chatbotStatus.charAt(0).toUpperCase() + chatbotStatus.slice(1)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Documents</p>
                      <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Conversations</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalChats || 0}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Last Activity</p>
                      <p className="text-sm text-gray-900">{stats?.lastActivity || 'No activity'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => setChatbotStatus(chatbotStatus === 'active' ? 'draft' : 'active')}
                      variant={chatbotStatus === 'active' ? 'destructive' : 'default'}
                      className="flex-1 sm:flex-initial"
                    >
                      {chatbotStatus === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Chatbot
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Deploy Chatbot
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-initial">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Document Library Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Library
              </CardTitle>
              <CardDescription>
                Upload and manage documents for your chatbot's knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Upload Documents</p>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop files here or click to browse
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Supported formats: PDF, DOCX, TXT, MD (Max 10MB per file)
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Uploaded Documents</h4>
                  <Badge variant="outline">{documents.length} files</Badge>
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No documents uploaded</p>
                    <p className="text-sm">Upload your first document to get started with your chatbot's knowledge base.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="flex items-center gap-2">
                              <FileIcon className="h-4 w-4 text-gray-500" />
                              {doc.name}
                            </TableCell>
                            <TableCell>{doc.size}</TableCell>
                            <TableCell>{doc.uploadDate}</TableCell>
                            <TableCell>
                              <Badge className={getFileStatusColor(doc.status)}>
                                {doc.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Test Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Quick Test
              </CardTitle>
              <CardDescription>
                Test your chatbot with sample questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask your chatbot a question..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                  />
                  <Button onClick={handleTestMessage} disabled={!testMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] flex items-center justify-center text-gray-500">
                  {chatbotStatus === 'draft' ? (
                    <div className="text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Deploy your chatbot to start testing</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Chat responses will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : stats ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Chats</span>
                      <span className="font-medium">{stats.totalChats}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Response Time</span>
                      <span className="font-medium">{stats.avgResponseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">User Satisfaction</span>
                      <span className="font-medium">{stats.userSatisfaction}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

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
          </div>
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
                  <Label htmlFor="chatbot-avatar">Avatar Style</Label>
                  <Select value={settings.avatar} onValueChange={(value) => handleSettingsUpdate('avatar', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select avatar style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Bot</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chatbot-description">Description</Label>
                <Textarea 
                  id="chatbot-description" 
                  placeholder="Brief description of your chatbot's purpose..."
                  value={settings.description}
                  onChange={(e) => handleSettingsUpdate('description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personality & Role */}
          <Card>
            <CardHeader>
              <CardTitle>Personality & Role</CardTitle>
              <CardDescription>
                Configure how your chatbot behaves and responds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personality">Personality</Label>
                  <Select value={settings.personality} onValueChange={(value) => handleSettingsUpdate('personality', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select personality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Primary Role</Label>
                  <Select value={settings.role} onValueChange={(value) => handleSettingsUpdate('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Support Agent</SelectItem>
                      <SelectItem value="sales">Sales Assistant</SelectItem>
                      <SelectItem value="general">General Helper</SelectItem>
                      <SelectItem value="technical">Technical Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-instructions">Custom Instructions</Label>
                <Textarea 
                  id="custom-instructions" 
                  placeholder="Additional instructions for how your chatbot should behave..."
                  value={settings.customInstructions}
                  onChange={(e) => handleSettingsUpdate('customInstructions', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Response Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Response Settings</CardTitle>
              <CardDescription>
                Configure how your chatbot responds to questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response-style">Response Style</Label>
                  <Select value={settings.responseStyle} onValueChange={(value) => handleSettingsUpdate('responseStyle', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select response style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-length">Max Response Length</Label>
                  <Select value={settings.maxLength} onValueChange={(value) => handleSettingsUpdate('maxLength', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select max length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (100 words)</SelectItem>
                      <SelectItem value="medium">Medium (250 words)</SelectItem>
                      <SelectItem value="long">Long (500 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Include Source Citations</Label>
                  <p className="text-sm text-gray-600">Show which documents were used to answer questions</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSettingsUpdate('includeCitations', !settings.includeCitations)}
                >
                  {settings.includeCitations ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>
                Fine-tune your chatbot's behavior and responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Creativity Level</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Conservative</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${settings.creativityLevel}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">Creative</span>
                </div>
                <p className="text-xs text-gray-500">Controls how creative vs factual the responses are</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fallback-response">Fallback Response</Label>
                <Textarea 
                  id="fallback-response" 
                  placeholder="Response when no relevant information is found..."
                  value={settings.fallbackResponse}
                  onChange={(e) => handleSettingsUpdate('fallbackResponse', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="w-full sm:w-auto">
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotPanel;
