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
  fetchSearchPreview,
  fetchSearchHistory,
  clearAllSearchHistory,
  removeSearchHistoryItem
} from '@/store/slices/searchSlice';
import { AppDispatch, RootState } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getRelativeTime } from '@/utils/date';
import { useTranslation } from 'react-i18next';

interface UserResult {
  _id: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
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
  user_id: string;
  group_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

interface SearchDialogProps {
  children?: React.ReactNode;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const searchState = useSelector((state: RootState) => state.search);
  const { t } = useTranslation();

  const {
    data,
    previewData,
    isLoading,
    hasMoreUser,
    hasMorePost,
    hasMoreGroup,
    totalUsers,
    totalPosts,
    totalGroups,
    currentUserPage,
    currentPostPage,
    currentGroupPage,
    searchHistory,
    isLoadingHistory
  } = searchState;

  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const [resultTypeTab, setResultTypeTab] = useState('all');
  const userLoaderRef = useRef<HTMLDivElement>(null);
  const postLoaderRef = useRef<HTMLDivElement>(null);
  const groupLoaderRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Calculate total results based on the active tab
  const total = (() => {
    switch (resultTypeTab) {
      case 'users':
        return totalUsers;
      case 'posts':
        return totalPosts;
      case 'groups':
        return totalGroups;
      case 'all':
        return totalUsers + totalPosts + totalGroups;
      default:
        return 0;
    }
  })();

  // Get current page based on active tab
  const currentPage = (() => {
    switch (resultTypeTab) {
      case 'users':
        return currentUserPage;
      case 'posts':
        return currentPostPage;
      case 'groups':
        return currentGroupPage;
      default:
        return 1;
    }
  })();

  useEffect(() => {
    if (isSearchOpen) {
      dispatch(fetchSearchHistory());
    }
  }, [isSearchOpen, dispatch]);

  // Setup intersection observers for each result type
  useEffect(() => {
    // Observer for User results
    const userObserver = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMoreUser && !isLoading && submittedQuery && resultTypeTab === 'users') {
          dispatch(
            fetchSearchResults({
              query: submittedQuery,
              type: 'user',
              page: currentUserPage + 1,
              limit: 10
            })
          );
        }
      },
      { threshold: 0.1 }
    );

    // Observer for Post results
    const postObserver = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMorePost && !isLoading && submittedQuery && resultTypeTab === 'posts') {
          dispatch(
            fetchSearchResults({
              query: submittedQuery,
              type: 'post',
              page: currentPostPage + 1,
              limit: 10
            })
          );
        }
      },
      { threshold: 0.1 }
    );

    // Observer for Group results
    const groupObserver = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMoreGroup && !isLoading && submittedQuery && resultTypeTab === 'groups') {
          dispatch(
            fetchSearchResults({
              query: submittedQuery,
              type: 'group',
              page: currentGroupPage + 1,
              limit: 10
            })
          );
        }
      },
      { threshold: 0.1 }
    );

    // Connect observers to their respective ref elements
    if (userLoaderRef.current) userObserver.observe(userLoaderRef.current);
    if (postLoaderRef.current) postObserver.observe(postLoaderRef.current);
    if (groupLoaderRef.current) groupObserver.observe(groupLoaderRef.current);

    return () => {
      if (userLoaderRef.current) userObserver.unobserve(userLoaderRef.current);
      if (postLoaderRef.current) postObserver.unobserve(postLoaderRef.current);
      if (groupLoaderRef.current) groupObserver.unobserve(groupLoaderRef.current);
    };
  }, [
    hasMoreUser,
    hasMorePost,
    hasMoreGroup,
    isLoading,
    submittedQuery,
    resultTypeTab,
    currentUserPage,
    currentPostPage,
    currentGroupPage,
    dispatch
  ]);

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

  // Handle change of result type tab
  useEffect(() => {
    if (submittedQuery && resultTypeTab && activeTab === 'results') {
      dispatch(clearSearchResults());

      if (resultTypeTab === 'all') {
        dispatch(fetchSearchPreview({ query: submittedQuery }));
      } else {
        dispatch(
          fetchSearchResults({
            query: submittedQuery,
            type: resultTypeTab.slice(0, -1) as 'user' | 'post' | 'group',
            page: 1,
            limit: 10
          })
        );
      }
    }
  }, [resultTypeTab, dispatch, submittedQuery, activeTab]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Update the submitted query when search is performed
    setSubmittedQuery(searchQuery);
    setActiveTab('results');

    dispatch(clearSearchResults());

    // Execute appropriate search based on the selected tab
    if (resultTypeTab === 'all') {
      await dispatch(fetchSearchPreview({ query: searchQuery }));
    } else {
      await dispatch(
        fetchSearchResults({
          query: searchQuery,
          type: resultTypeTab.slice(0, -1) as 'user' | 'post' | 'group', // Convert plural to singular
          page: 1,
          limit: 10
        })
      );
    }

    // Refresh search history immediately after search
    dispatch(fetchSearchHistory());
  };

  const handleHistoryItemClick = async (content: string) => {
    setSearchQuery(content);
    setSubmittedQuery(content);
    setActiveTab('results');

    dispatch(clearSearchResults());

    // Execute appropriate search based on the selected tab
    if (resultTypeTab === 'all') {
      await dispatch(fetchSearchPreview({ query: content }));
    } else {
      await dispatch(
        fetchSearchResults({
          query: content,
          type: resultTypeTab.slice(0, -1) as 'user' | 'post' | 'group', // Convert plural to singular
          page: 1,
          limit: 10
        })
      );
    }

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
              <span>
                {t('search.timeIndicators.joined')} {formatDate(user.created_at)}
              </span>
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
              <span>
                {t('search.timeIndicators.created')} {formatDate(group.created_at)}
              </span>
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
                <span>
                  {t('search.timeIndicators.posted')} {getRelativeTime(post.created_at)}
                </span>
              </div>
              {post.medias.length > 0 && (
                <Badge variant='outline' className='text-xs'>
                  {post.medias.length} {t('search.badges.media')}
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
          <p className='text-xs text-gray-500'>{getRelativeTime(item.updated_at)}</p>
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
              <p>{t('search.tooltips.deleteSearch')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  // Helper function to get the relevant data based on the current result type tab
  const getResultsData = () => {
    if (resultTypeTab === 'all') {
      return previewData;
    } else {
      return data;
    }
  };

  // Get the appropriate data based on the selected tab
  const currentData = getResultsData();

  // Calculate if we have results
  const hasUsers =
    resultTypeTab === 'all'
      ? currentData?.users && currentData.users.length > 0
      : resultTypeTab === 'users' && data?.users && data.users.length > 0;

  const hasGroups =
    resultTypeTab === 'all'
      ? currentData?.groups && currentData.groups.length > 0
      : resultTypeTab === 'groups' && data?.groups && data.groups.length > 0;

  const hasPosts =
    resultTypeTab === 'all'
      ? currentData?.posts && currentData.posts.length > 0
      : resultTypeTab === 'posts' && data?.posts && data.posts.length > 0;

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
            {t('search.title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle>{t('search.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className='flex gap-2 mt-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
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
            disabled={(isLoading && currentPage === 1) || !searchQuery}
          >
            {isLoading && currentPage === 1 ? t('search.searching') : t('search.buttonText')}
          </Button>
        </form>

        <Tabs value={activeTab} onValueChange={handleTabChange} className='mt-4'>
          <TabsList className='mb-4'>
            <TabsTrigger value='results' className='flex items-center'>
              <Search size={16} className='mr-2' />
              {t('search.tabs.results')}
              {total > 0 && (
                <span className='ml-2 bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full'>{total}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value='history' className='flex items-center'>
              <HistoryIcon size={16} className='mr-2' />
              {t('search.tabs.history')}
              {searchHistory.length > 0 && (
                <span className='ml-2 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full'>
                  {searchHistory.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='results' className='mt-0'>
            {submittedQuery && (
              <div className='mb-4'>
                <Tabs value={resultTypeTab} onValueChange={setResultTypeTab}>
                  <TabsList className='w-full'>
                    <TabsTrigger value='all' className='flex-1'>
                      {t('search.resultTypes.all')}
                    </TabsTrigger>
                    <TabsTrigger value='users' className='flex-1'>
                      <User size={14} className='mr-1' />
                      {t('search.resultTypes.users')} {totalUsers > 0 && `(${totalUsers})`}
                    </TabsTrigger>
                    <TabsTrigger value='groups' className='flex-1'>
                      <Users size={14} className='mr-1' />
                      {t('search.resultTypes.groups')} {totalGroups > 0 && `(${totalGroups})`}
                    </TabsTrigger>
                    <TabsTrigger value='posts' className='flex-1'>
                      <FileText size={14} className='mr-1' />
                      {t('search.resultTypes.posts')} {totalPosts > 0 && `(${totalPosts})`}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            <ScrollArea className='h-80'>
              {!submittedQuery && (
                <div className='text-center py-10'>
                  <Search size={40} className='mx-auto text-gray-300' />
                  <p className='text-gray-500 mt-3'>{t('search.emptyStates.initial')}</p>
                </div>
              )}

              {isLoading && submittedQuery && currentPage === 1 && (
                <div className='text-center py-10'>
                  <div className='w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto'></div>
                  <p className='text-gray-500 mt-3'>{t('search.searching')}</p>
                </div>
              )}

              {submittedQuery && !isLoading && currentPage === 1 && !hasAnyResults && (
                <div className='text-center py-10'>
                  <p className='text-gray-500'>{t('search.emptyStates.noResults')}</p>
                  <p className='text-sm text-gray-400 mt-1'>{t('search.emptyStates.tryAgain')}</p>
                </div>
              )}

              {/* Display users */}
              {hasAnyResults && (resultTypeTab === 'all' || resultTypeTab === 'users') && hasUsers && (
                <div className='mb-4'>
                  {resultTypeTab === 'all' && (
                    <h3 className='text-sm font-medium mb-2'>{t('search.resultTypes.users')}</h3>
                  )}
                  {resultTypeTab === 'all'
                    ? previewData.users.map((user: UserResult) => renderUserItem(user))
                    : data.users.map((user: UserResult) => renderUserItem(user))}
                  {resultTypeTab === 'users' && hasMoreUser && (
                    <div ref={userLoaderRef} className='h-10 w-full flex justify-center items-center'>
                      {isLoading && (
                        <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sky-500'></div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Display groups */}
              {hasAnyResults && (resultTypeTab === 'all' || resultTypeTab === 'groups') && hasGroups && (
                <div className='mb-4'>
                  {resultTypeTab === 'all' && (
                    <h3 className='text-sm font-medium mb-2'>{t('search.resultTypes.groups')}</h3>
                  )}
                  {resultTypeTab === 'all'
                    ? previewData.groups.map((group: GroupResult) => renderGroupItem(group))
                    : data.groups.map((group: GroupResult) => renderGroupItem(group))}
                  {resultTypeTab === 'groups' && hasMoreGroup && (
                    <div ref={groupLoaderRef} className='h-10 w-full flex justify-center items-center'>
                      {isLoading && (
                        <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sky-500'></div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Display posts */}
              {hasAnyResults && (resultTypeTab === 'all' || resultTypeTab === 'posts') && hasPosts && (
                <div className='mb-4'>
                  {resultTypeTab === 'all' && (
                    <h3 className='text-sm font-medium mb-2'>{t('search.resultTypes.posts')}</h3>
                  )}
                  {resultTypeTab === 'all'
                    ? previewData.posts.map((post: PostResult) => renderPostItem(post))
                    : data.posts.map((post: PostResult) => renderPostItem(post))}
                  {resultTypeTab === 'posts' && hasMorePost && (
                    <div ref={postLoaderRef} className='h-10 w-full flex justify-center items-center'>
                      {isLoading && (
                        <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-sky-500'></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value='history' className='mt-0'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-sm font-medium'>{t('search.history.recentSearches')}</h3>
              {searchHistory.length > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-xs h-8'
                  onClick={handleClearAllHistory}
                  disabled={isLoadingHistory}
                >
                  <Trash2 size={14} className='mr-1' />
                  {t('search.history.clearAll')}
                </Button>
              )}
            </div>

            <ScrollArea className='h-80'>
              {isLoadingHistory ? (
                <div className='text-center py-10'>
                  <div className='w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto'></div>
                  <p className='text-gray-500 mt-3'>{t('search.history.loadingHistory')}</p>
                </div>
              ) : searchHistory.length > 0 ? (
                <div className='border rounded-md overflow-hidden'>
                  {searchHistory.map((item: SearchHistory) => renderHistoryItem(item))}
                </div>
              ) : (
                <div className='text-center py-10'>
                  <HistoryIcon size={40} className='mx-auto text-gray-300' />
                  <p className='text-gray-500 mt-3'>{t('search.emptyStates.noHistory')}</p>
                  <p className='text-gray-400 text-sm mt-1'>{t('search.emptyStates.historyWillAppear')}</p>
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
