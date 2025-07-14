import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PenTool, Plus, Eye, Trash2, Calendar, User, Clock, Search } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  author: string;
  category: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  publish_date: string | null;
  read_time: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
}

const BlogManager: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
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

  const { toast } = useToast();

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load blog posts",
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
      // Prepare the data
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

      // Handle scheduling logic
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
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Loading blog posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <PenTool className="h-6 w-6 mr-3" />
            Blog Management
          </h2>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewPost}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
              <DialogDescription>
                {editingPost ? 'Update the blog post details' : 'Fill in the details to create a new blog post'}
              </DialogDescription>
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
              
              {/* SEO Section */}
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

              {/* Publishing Options */}
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

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts ({posts.length})</CardTitle>
          <CardDescription>Manage your blog content</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium">{post.title}</div>
                    {post.excerpt && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {post.excerpt}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <User className="h-3 w-3 mr-1" />
                      {post.author}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{post.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const { status, variant } = getPostStatus(post);
                      return (
                        <div className="flex items-center space-x-2">
                          <Badge variant={variant}>{status}</Badge>
                          {status === 'Scheduled' && (
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {post.publish_date 
                        ? new Date(post.publish_date).toLocaleDateString()
                        : new Date(post.created_at).toLocaleDateString()
                      }
                    </div>
                    {post.publish_date && new Date(post.publish_date) > new Date() && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(post.publish_date).toLocaleTimeString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Eye className="h-4 w-4" />
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManager;