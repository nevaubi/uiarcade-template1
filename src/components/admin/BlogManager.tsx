import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, Edit2, Trash2, Plus, Search, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  author: string;
  category: string;
  image_url: string | null;
  read_time: string | null;
  is_published: boolean;
  publish_date: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
}



const BlogManager: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: 'General',
    image_url: '',
    is_published: false,
    read_time: '5 min read',
    publish_date: '',
    schedule_for_later: false,
    meta_title: '',
    meta_description: '',
    canonical_url: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Error", 
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const saveData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        author: formData.author,
        category: formData.category,
        image_url: formData.image_url || null,
        read_time: formData.read_time,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        canonical_url: formData.canonical_url || null
      };

      if (formData.schedule_for_later && formData.publish_date) {
        const scheduledDate = new Date(formData.publish_date);
        const now = new Date();
        
        if (scheduledDate <= now) {
          toast({
            title: "Error",
            description: "Scheduled date must be in the future",
            variant: "destructive",
          });
          return;
        }
        
        Object.assign(saveData, {
          is_published: false,
          publish_date: scheduledDate.toISOString()
        });
      } else {
        Object.assign(saveData, {
          is_published: formData.is_published,
          publish_date: formData.is_published ? new Date().toISOString() : null
        });
      }

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(saveData)
          .eq('id', editingPost.id);
        
        if (error) throw error;
        toast({ 
          title: "Success", 
          description: formData.schedule_for_later ? "Post scheduled successfully" : "Post updated successfully" 
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([saveData]);
        
        if (error) throw error;
        toast({ 
          title: "Success", 
          description: formData.schedule_for_later ? "Post scheduled successfully" : "Post created successfully" 
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Post deleted successfully" });
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    const publishDate = post.publish_date ? new Date(post.publish_date) : null;
    const isScheduled = publishDate && publishDate > new Date() && !post.is_published;
    
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      author: post.author,
      category: post.category,
      image_url: post.image_url || '',
      is_published: post.is_published,
      read_time: post.read_time || '5 min read',
      publish_date: publishDate ? publishDate.toISOString().slice(0, 16) : '',
      schedule_for_later: isScheduled || false,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      canonical_url: post.canonical_url || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: '',
      category: 'General',
      image_url: '',
      is_published: false,
      read_time: '5 min read',
      publish_date: '',
      schedule_for_later: false,
      meta_title: '',
      meta_description: '',
      canonical_url: ''
    });
  };

  const getPostStatus = (post: BlogPost) => {
    if (post.is_published) return { status: 'Published', variant: 'default' as const };
    
    const publishDate = post.publish_date ? new Date(post.publish_date) : null;
    if (publishDate && publishDate > new Date()) {
      return { status: 'Scheduled', variant: 'secondary' as const };
    }
    
    return { status: 'Draft', variant: 'secondary' as const };
  };

  const handleNewPost = () => {
    setEditingPost(null);
    resetForm();
    setIsDialogOpen(true);
  };



  return (
    <div className="space-y-6">
      {/* Blog Management Header - Enhanced */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-xl p-6 border border-blue-200/40">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground flex items-center tracking-tight">
          <div className="p-2 bg-blue-100/80 rounded-lg mr-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          Blog Management
        </h1>
        <p className="text-muted-foreground mt-3 text-lg font-medium">Create and manage blog posts and content</p>
      </div>

      <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Blog Posts</h3>
            <Button onClick={handleNewPost}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => {
                      const status = getPostStatus(post);
                      return (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>{post.category}</TableCell>
                          <TableCell>{post.author}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant as any}>
                              {status.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(post)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter post title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  placeholder="Author name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Payments">Payments</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Tutorial">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="read_time">Read Time</Label>
                <Input
                  id="read_time"
                  value={formData.read_time}
                  onChange={(e) => setFormData({...formData, read_time: e.target.value})}
                  placeholder="5 min read"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                placeholder="Brief description of the post"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (HTML)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Enter your blog post content in HTML format"
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <Label className="text-base font-medium">SEO Settings</Label>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title (for SEO)</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                    placeholder="Leave empty to use post title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                    placeholder="Brief description for search engines (150-160 characters)"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="canonical_url">Canonical URL (optional)</Label>
                  <Input
                    id="canonical_url"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({...formData, canonical_url: e.target.value})}
                    placeholder="https://yourdomain.com/blog/post-slug"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-base font-medium">Publishing Options</Label>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="schedule_for_later"
                  checked={formData.schedule_for_later}
                  onCheckedChange={(checked) => {
                    setFormData({
                      ...formData, 
                      schedule_for_later: checked,
                      is_published: checked ? false : formData.is_published
                    });
                  }}
                />
                <Label htmlFor="schedule_for_later">Schedule for later</Label>
              </div>

              {formData.schedule_for_later ? (
                <div className="space-y-2">
                  <Label htmlFor="publish_date">Schedule Date & Time</Label>
                  <Input
                    id="publish_date"
                    type="datetime-local"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({...formData, publish_date: e.target.value})}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({...formData, is_published: checked})}
                  />
                  <Label htmlFor="is_published">Publish immediately</Label>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManager;
