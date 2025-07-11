
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  RotateCcw
} from 'lucide-react';

const ChatbotPanel = () => {
  const [activeTab, setActiveTab] = useState('my-chatbot');
  const [chatbotStatus, setChatbotStatus] = useState('active');
  const [testMessage, setTestMessage] = useState('');

  // Mock data for demonstration
  const mockDocuments = [
    { id: 1, name: 'Product_Manual.pdf', size: '2.4 MB', uploadDate: '2024-01-15', status: 'processed' },
    { id: 2, name: 'FAQ_Document.docx', size: '1.8 MB', uploadDate: '2024-01-14', status: 'processing' },
    { id: 3, name: 'Company_Policy.txt', size: '0.5 MB', uploadDate: '2024-01-13', status: 'processed' },
  ];

  const mockConversations = [
    { id: 1, user: 'User #1234', message: 'How do I reset my password?', time: '2 hours ago' },
    { id: 2, user: 'User #5678', message: 'What are your business hours?', time: '4 hours ago' },
    { id: 3, user: 'User #9012', message: 'Can you help me with billing?', time: '1 day ago' },
  ];

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(chatbotStatus)}>
                    {chatbotStatus === 'active' && <Play className="h-3 w-3 mr-1" />}
                    {chatbotStatus === 'draft' && <Pause className="h-3 w-3 mr-1" />}
                    {chatbotStatus === 'training' && <RotateCcw className="h-3 w-3 mr-1" />}
                    {chatbotStatus.charAt(0).toUpperCase() + chatbotStatus.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">127</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Last Activity</p>
                  <p className="text-sm text-gray-900">2 hours ago</p>
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
                  <Badge variant="outline">{mockDocuments.length} files</Badge>
                </div>

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
                      {mockDocuments.map((doc) => (
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
                  />
                  <Button disabled={!testMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] flex items-center justify-center text-gray-500">
                  Chat responses will appear here
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Chats</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">User Satisfaction</span>
                    <span className="font-medium">94%</span>
                  </div>
                </div>
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
                <div className="space-y-3">
                  {mockConversations.map((conv) => (
                    <div key={conv.id} className="border-b pb-2 last:border-b-0">
                      <p className="text-sm font-medium">{conv.user}</p>
                      <p className="text-xs text-gray-600 truncate">{conv.message}</p>
                      <p className="text-xs text-gray-500">{conv.time}</p>
                    </div>
                  ))}
                </div>
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
                  <Input id="chatbot-name" placeholder="e.g., Support Assistant" defaultValue="My Assistant" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatbot-avatar">Avatar Style</Label>
                  <Select defaultValue="default">
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
                  defaultValue="A helpful assistant that answers questions about our products and services."
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
                  <Select defaultValue="professional">
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
                  <Select defaultValue="support">
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
                  defaultValue="Always be helpful and polite. If you don't know the answer, suggest contacting our support team."
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
                  <Select defaultValue="detailed">
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
                  <Select defaultValue="medium">
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
                <Button variant="outline" size="sm">
                  Enabled
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
                    <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
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
                  defaultValue="I don't have information about that topic. Please contact our support team for assistance."
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
