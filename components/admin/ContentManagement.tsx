import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Add01Icon, 
  Edit01Icon, 
  Delete01Icon, 
  Search01Icon,
  FilterIcon,
  ViewIcon,
  ViewOffIcon
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { CreatePostModal } from '../community/create-post/CreatePostModal';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { PostType } from '../community/create-post/CreatePostModal';
import { ImageLayoutType } from '../community/create-post/image/ImageLayoutSelector';
import imageCompression from 'browser-image-compression';

interface Post {
  id: string;
  title: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  likes: number;
  created_at: string;
}

export const ContentManagement: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Map data to Post interface
      setPosts(data?.map((post: any) => ({
        id: post.id,
        title: post.content?.substring(0, 50) || 'Untitled',
        author: post.user_id || 'Unknown',
        status: post.status || 'published',
        views: post.views || 0,
        likes: post.likes || 0,
        created_at: post.created_at,
      })) || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Post deleted successfully', 'success');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Failed to delete post', 'error');
    }
  };

  const handleEditPost = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setEditingPost(data);
      setIsCreateModalOpen(true);
    } catch (error) {
      console.error('Error fetching post for edit:', error);
      showToast('Failed to fetch post details', 'error');
    }
  };

  const handleNewPost = async (content: string, type: PostType, images?: any[], layout?: ImageLayoutType, extraData?: any, status?: 'published' | 'draft') => {
    if (!user) return;

    try {
      setUploading(true);
      let mediaUrls: string[] = editingPost?.media_urls || [];

      // Handle image uploads if any (only new ones)
      if (images && images.length > 0) {
        const newImages = images.filter(img => img.file);
        if (newImages.length > 0) {
          for (const img of newImages) {
            const formData = new FormData();
            formData.append('image', img.file);
            const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
              const url = data.type === 'r2' ? data.url : `/api/image/${data.fileId}`;
              mediaUrls.push(url);
            }
          }
        }
        
        // Also keep existing URLs that were not removed
        const existingUrls = images.filter(img => !img.file).map(img => img.url);
        mediaUrls = [...existingUrls, ...mediaUrls.filter(url => !existingUrls.includes(url))];
      }

      const postData = {
        user_id: user.id,
        content,
        type: ['text', 'image', 'video'].includes(type) ? type : 'text',
        media_urls: mediaUrls,
        extra_data: {
          originalType: type,
          imageLayout: layout,
          ...extraData
        },
        status: status || 'published'
      };

      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
        showToast('Post updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('posts')
          .insert(postData);
        if (error) throw error;
        showToast('Post created successfully', 'success');
      }

      setIsCreateModalOpen(false);
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      showToast('Failed to save post', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-khmer">Content Management</h1>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Manage all posts, articles, and content on Ponloe.
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
          theme === 'dark'
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} className="w-5 h-5" />
          Create New Post
        </button>
      </div>

      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPost(null);
        }}
        onPost={handleNewPost}
        initialData={editingPost}
      />

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <HugeiconsIcon 
                icon={Search01Icon} 
                strokeWidth={1.5} 
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                } focus:outline-none`}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all capitalize ${
                    filterStatus === status
                      ? 'bg-emerald-600 text-white'
                      : theme === 'dark'
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-gray-200 bg-gray-50'}`}>
                  <th className="px-6 py-4 text-left text-sm font-bold">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Author</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Likes</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No posts found.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr 
                      key={post.id} 
                      className={`border-b transition-colors ${
                        theme === 'dark'
                          ? 'border-slate-800 hover:bg-slate-800/50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold">{post.title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">{post.author}</td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(post.status) as any} size="sm">
                          {post.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">{post.views.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-bold">{post.likes.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          }`}>
                            <HugeiconsIcon icon={ViewIcon} strokeWidth={1.5} className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditPost(post.id)}
                            className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-slate-700 text-slate-400 hover:text-emerald-400'
                              : 'hover:bg-gray-100 text-gray-600 hover:text-emerald-600'
                          }`}>
                            <HugeiconsIcon icon={Edit01Icon} strokeWidth={1.5} className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className={`p-2 rounded-lg transition-colors ${
                            theme === 'dark'
                              ? 'hover:bg-red-900/20 text-red-400'
                              : 'hover:bg-red-50 text-red-600'
                          }`}>
                            <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.5} className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
