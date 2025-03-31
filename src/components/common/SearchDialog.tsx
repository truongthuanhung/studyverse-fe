import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Trash2, HistoryIcon, User, Users, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearSearchResults,
  fetchSearchResults,
  fetchSearchHistory,
  clearAllSearchHistory,
  removeSearchHistoryItem
} from '@/store/slices/searchSlice';
import { AppDispatch, RootState } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Define types for search results
interface UserResult {
  _id: string;
  name: string;
  username?: string;
  bio?: string;
  avatar?: string;
  role: string;
  location?: string;
  created_at: string;
}

interface GroupResult {
  _id: string;
  name: string;
  description?: string;
  privacy: number;
  created_at: string;
}

interface PostResult {
  _id: string;
  content: string;
  privacy: number;
  created_at: string;
  medias: any[];
}

interface SearchHistory {
  _id: string;
  content: string;
  updated_at: string;
}

interface SearchDialogProps {
  children?: React.ReactNode;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const {
    data: searchData,
    isLoading,
    hasMore,
    total,
    currentPage,
    searchHistory,
    isLoadingHistory
  } = useSelector((state: RootState) => state.search);

  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const [resultTypeTab, setResultTypeTab] = useState('all');
  const loaderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load search history when dialog opens
  useEffect(() => {
    if (isSearchOpen) {
      dispatch(fetchSearchHistory());
    }
  }, [isSearchOpen, dispatch]);

  // Infinite scrolling setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoading && submittedQuery) {
          dispatch(
            fetchSearchResults({
              page: currentPage + 1,
              limit: 10,
              query: submittedQuery
            })
          );
        }
      },
      {
        threshold: 0.1
      }
    );

    const currentTarget = loaderRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, currentPage, dispatch, submittedQuery]);

  // Clear search results when dialog closes
  useEffect(() => {
    if (!isSearchOpen) {
      dispatch(clearSearchResults());
      setSearchQuery('');
      setSubmittedQuery('');
      setActiveTab('results');
      setResultTypeTab('all');
    }
  }, [isSearchOpen, dispatch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Update the submitted query when search is performed
    setSubmittedQuery(searchQuery);
    setActiveTab('results');
    setResultTypeTab('all');

    dispatch(clearSearchResults());

    // Execute search
    await dispatch(
      fetchSearchResults({
        query: searchQuery,
        page: 1,
        limit: 10
      })
    );

    // Refresh search history immediately after search
    dispatch(fetchSearchHistory());
  };

  const handleHistoryItemClick = async (content: string) => {
    setSearchQuery(content);
    setSubmittedQuery(content);
    setActiveTab('results');
    setResultTypeTab('all');

    dispatch(clearSearchResults());

    // Execute search
    await dispatch(
      fetchSearchResults({
        query: content,
        page: 1,
        limit: 10
      })
    );

    // Refresh search history
    dispatch(fetchSearchHistory());
  };

  const handleClearAllHistory = async () => {
    try {
      await dispatch(clearAllSearchHistory()).unwrap();
      toast({
        title: 'History cleared',
        description: 'All search history has been deleted',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear search history',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteHistoryItem = async (searchHistoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dispatch(removeSearchHistoryItem(searchHistoryId)).unwrap();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete search history item',
        variant: 'destructive'
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSubmittedQuery('');
    dispatch(clearSearchResults());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Highlight keywords in text
  const highlightKeywords = (text: string, keywords: string) => {
    if (!keywords.trim() || !text) return text || '';

    const regex = new RegExp(`(${keywords.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="bg-yellow-200 px-0.5 rounded">$1</span>');
  };

  // Function to strip HTML tags for plain text display
  const stripHtml = (html: string) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const renderUserItem = (user: UserResult) => {
    const highlightedName = submittedQuery ? highlightKeywords(user.name, submittedQuery) : user.name;
    const highlightedBio = submittedQuery && user.bio ? highlightKeywords(user.bio, submittedQuery) : user.bio;

    return (
      <Card
        key={user._id}
        className='mb-3 hover:bg-gray-50 cursor-pointer transition-colors'
        onClick={() => {
          navigate(`/${user.username || user._id}`);
          setIsSearchOpen(false);
        }}
      >
        <CardContent className='p-4 flex items-center'>
          <Avatar className='h-12 w-12 mr-4'>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className='h-full w-full object-cover rounded-full' />
            ) : (
              <div className='h-full w-full bg-gray-200 rounded-full flex items-center justify-center'>
                <User size={24} className='text-gray-500' />
              </div>
            )}
          </Avatar>
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <h3 className='font-medium text-blue-600' dangerouslySetInnerHTML={{ __html: highlightedName }} />
              <Badge variant={user.role === 'teacher' ? 'secondary' : 'outline'} className='text-xs'>
                {user.role === 'teacher' ? 'Teacher' : 'Student'}
              </Badge>
            </div>
            {user.bio && (
              <p
                className='text-sm text-gray-600 mt-1 line-clamp-1'
                dangerouslySetInnerHTML={{ __html: highlightedBio as string }}
              />
            )}
            <div className='text-xs text-gray-500 mt-1'>
              {user.username && <span className='mr-3'>@{user.username}</span>}
              {user.location && <span className='mr-3'>{user.location}</span>}
              <span>Joined {formatDate(user.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderGroupItem = (group: GroupResult) => {
    const highlightedName = submittedQuery ? highlightKeywords(group.name, submittedQuery) : group.name;
    const highlightedDesc =
      submittedQuery && group.description ? highlightKeywords(group.description, submittedQuery) : group.description;

    return (
      <Card
        key={group._id}
        className='mb-3 hover:bg-gray-50 cursor-pointer transition-colors'
        onClick={() => {
          navigate(`/groups/${group._id}`);
          setIsSearchOpen(false);
        }}
      >
        <CardContent className='p-4 flex'>
          <div className='h-12 w-12 bg-blue-100 rounded-md flex items-center justify-center mr-4'>
            <Users size={24} className='text-blue-500' />
          </div>
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <h3 className='font-medium text-blue-600' dangerouslySetInnerHTML={{ __html: highlightedName }} />
              <Badge variant={group.privacy === 0 ? 'outline' : 'secondary'} className='text-xs'>
                {group.privacy === 0 ? 'Public' : 'Private'}
              </Badge>
            </div>
            {group.description && (
              <p
                className='text-sm text-gray-600 mt-1 line-clamp-2'
                dangerouslySetInnerHTML={{ __html: highlightedDesc as string }}
              />
            )}
            <div className='text-xs text-gray-500 mt-1'>
              <span>Created {formatDate(group.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPostItem = (post: PostResult) => {
    const contentText = stripHtml(post.content);
    const highlightedContent = submittedQuery ? highlightKeywords(contentText, submittedQuery) : contentText;

    return (
      <Card
        key={post._id}
        className='mb-3 hover:bg-gray-50 cursor-pointer transition-colors'
        onClick={() => {
          navigate(`/posts/${post._id}`);
          setIsSearchOpen(false);
        }}
      >
        <CardContent className='p-4 flex'>
          <div className='h-12 w-12 bg-green-100 rounded-md flex items-center justify-center mr-4'>
            <FileText size={24} className='text-green-500' />
          </div>
          <div className='flex-1'>
            <p className='text-gray-800 line-clamp-3' dangerouslySetInnerHTML={{ __html: highlightedContent }} />
            <div className='flex justify-between items-center mt-2'>
              <div className='text-xs text-gray-500'>
                <Badge variant={post.privacy === 0 ? 'outline' : 'secondary'} className='text-xs mr-2'>
                  {post.privacy === 0 ? 'Public' : 'Private'}
                </Badge>
                <span>Posted {formatRelativeTime(post.created_at)}</span>
              </div>
              {post.medias.length > 0 && (
                <Badge variant='outline' className='text-xs'>
                  {post.medias.length} media
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHistoryItem = (item: SearchHistory) => {
    return (
      <div
        key={item._id}
        className='flex items-center py-3 px-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer group transition-colors'
        onClick={() => handleHistoryItemClick(item.content)}
      >
        <Clock size={16} className='text-gray-400 mr-3' />
        <div className='flex-1'>
          <p className='text-gray-800 font-medium'>{item.content}</p>
          <p className='text-xs text-gray-500'>{formatRelativeTime(item.updated_at)}</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity'
                onClick={(e) => handleDeleteHistoryItem(item._id, e)}
              >
                <Trash2 size={16} className='text-gray-500 hover:text-red-500' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete this search</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  // Calculate if we have results
  const hasUsers = searchData?.users && searchData.users.length > 0;
  const hasGroups = searchData?.groups && searchData.groups.length > 0;
  const hasPosts = searchData?.posts && searchData.posts.length > 0;
  const hasAnyResults = hasUsers || hasGroups || hasPosts;

  // Handle tab change for main tabs (results/history)
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // If switching to history tab, refresh the history data
    if (value === 'history') {
      dispatch(fetchSearchHistory());
    }
  };

  return (
    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className='rounded-full' variant='outline'>
            <Search size={16} className='mr-2' />
            Search
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className='flex gap-2 mt-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Enter search keywords...'
              className='pl-10 pr-10'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={clearSearch}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <X size={18} />
              </button>
            )}
          </div>
          <Button
            className='rounded-[20px] bg-sky-500 hover:bg-sky-600'
            type='submit'
            disabled={isLoading && currentPage === 1}
          >
            {isLoading && currentPage === 1 ? 'Searching...' : 'Search'}
          </Button>
        </form>

        <Tabs value={activeTab} onValueChange={handleTabChange} className='mt-4'>
          <TabsList className='mb-4'>
            <TabsTrigger value='results' className='flex items-center'>
              <Search size={16} className='mr-2' />
              Results
              {total > 0 && (
                <span className='ml-2 bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full'>{total}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value='history' className='flex items-center'>
              <HistoryIcon size={16} className='mr-2' />
              History
              {searchHistory.length > 0 && (
                <span className='ml-2 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full'>
                  {searchHistory.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='results' className='mt-0'>
            {hasAnyResults && submittedQuery && (
              <div className='mb-4'>
                <Tabs value={resultTypeTab} onValueChange={setResultTypeTab}>
                  <TabsList className='w-full'>
                    <TabsTrigger value='all' className='flex-1'>
                      All ({total || 0})
                    </TabsTrigger>
                    <TabsTrigger value='users' className='flex-1'>
                      <User size={14} className='mr-1' />
                      Users
                    </TabsTrigger>
                    <TabsTrigger value='groups' className='flex-1'>
                      <Users size={14} className='mr-1' />
                      Groups
                    </TabsTrigger>
                    <TabsTrigger value='posts' className='flex-1'>
                      <FileText size={14} className='mr-1' />
                      Posts
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            <ScrollArea className='h-80'>
              {!submittedQuery && (
                <div className='text-center py-10'>
                  <Search size={40} className='mx-auto text-gray-300' />
                  <p className='text-gray-500 mt-3'>Enter keywords to search</p>
                </div>
              )}

              {isLoading && submittedQuery && currentPage === 1 && (
                <div className='text-center py-10'>
                  <div className='w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto'></div>
                  <p className='text-gray-500 mt-3'>Searching...</p>
                </div>
              )}

              {submittedQuery && !isLoading && currentPage === 1 && !hasAnyResults && (
                <div className='text-center py-10'>
                  <p className='text-gray-500'>No matching results found</p>
                  <p className='text-sm text-gray-400 mt-1'>Try with different keywords</p>
                </div>
              )}

              {/* Display results based on selected tab */}
              {hasAnyResults && (resultTypeTab === 'all' || resultTypeTab === 'users') && hasUsers && (
                <div className='mb-4'>
                  {resultTypeTab === 'all' && <h3 className='text-sm font-medium mb-2'>Users</h3>}
                  {searchData.users.map((user: UserResult) => renderUserItem(user))}
                </div>
              )}

              {hasAnyResults && (resultTypeTab === 'all' || resultTypeTab === 'groups') && hasGroups && (
                <div className='mb-4'>
                  {resultTypeTab === 'all' && <h3 className='text-sm font-medium mb-2'>Groups</h3>}
                  {searchData.groups.map((group: GroupResult) => renderGroupItem(group))}
                </div>
              )}

              {hasAnyResults && (resultTypeTab === 'all' || resultTypeTab === 'posts') && hasPosts && (
                <div className='mb-4'>
                  {resultTypeTab === 'all' && <h3 className='text-sm font-medium mb-2'>Posts</h3>}
                  {searchData.posts.map((post: PostResult) => renderPostItem(post))}
                </div>
              )}

              {/* Intersection observer target for infinite scrolling */}
              {hasMore && (
                <div ref={loaderRef} className='h-10 w-full flex justify-center items-center'>
                  {isLoading && currentPage > 1 && (
                    <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sky-500'></div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value='history' className='mt-0'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-sm font-medium'>Recent searches</h3>
              {searchHistory.length > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-xs h-8'
                  onClick={handleClearAllHistory}
                  disabled={isLoadingHistory}
                >
                  <Trash2 size={14} className='mr-1' />
                  Clear all
                </Button>
              )}
            </div>

            <ScrollArea className='h-80'>
              {isLoadingHistory ? (
                <div className='text-center py-10'>
                  <div className='w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto'></div>
                  <p className='text-gray-500 mt-3'>Loading search history...</p>
                </div>
              ) : searchHistory.length > 0 ? (
                <div className='border rounded-md overflow-hidden'>
                  {searchHistory.map((item: SearchHistory) => renderHistoryItem(item))}
                </div>
              ) : (
                <div className='text-center py-10'>
                  <HistoryIcon size={40} className='mx-auto text-gray-300' />
                  <p className='text-gray-500 mt-3'>No search history</p>
                  <p className='text-gray-400 text-sm mt-1'>Your recent searches will appear here</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
