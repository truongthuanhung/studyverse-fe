import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Trash2, HistoryIcon } from 'lucide-react';
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
  fetchGroupSearchResults,
  fetchGroupSearchHistory,
  clearAllGroupSearchHistory,
  removeGroupSearchHistoryItem
} from '@/store/slices/searchSlice';
import { AppDispatch, RootState } from '@/store/store';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getRelativeTime } from '@/utils/date';
import { useTranslation } from 'react-i18next';

interface GroupSearchProps {
  groupId: string;
  children?: React.ReactNode;
}

interface SearchResult {
  _id: string;
  title: string;
  content: string;
  created_at: string;
  reply_count: number;
}

interface SearchHistory {
  _id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const GroupSearch: React.FC<GroupSearchProps> = ({ groupId, children }) => {
  // Refs
  const loaderRef = useRef<HTMLDivElement>(null);

  // States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('results');

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Selectors
  const { data, isLoading, totalQuestions, currentQuestionPage, hasMoreQuestion, searchHistory, isLoadingHistory } =
    useSelector((state: RootState) => state.search);
  const searchResults = data.questions;

  // Effects
  useEffect(() => {
    if (isLoading || !hasMoreQuestion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMoreQuestion && !isLoading) {
          dispatch(
            fetchGroupSearchResults({
              page: currentQuestionPage + 1,
              limit: 10,
              groupId,
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
  }, [hasMoreQuestion, isLoading, currentQuestionPage, dispatch, submittedQuery, groupId]);

  useEffect(() => {
    if (!isSearchOpen) {
      dispatch(clearSearchResults());
      setSearchQuery('');
      setSubmittedQuery('');
      setActiveTab('results');
    }
  }, [isSearchOpen, dispatch]);

  // Handlers
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Update the submitted query when search is performed
    setSubmittedQuery(searchQuery);
    setActiveTab('results');

    dispatch(clearSearchResults());

    // Execute search
    await dispatch(
      fetchGroupSearchResults({
        groupId,
        query: searchQuery,
        page: 1,
        limit: 10
      })
    );

    // Refresh search history immediately after search
    dispatch(fetchGroupSearchHistory(groupId));
  };

  const handleHistoryItemClick = async (content: string) => {
    setSearchQuery(content);
    setSubmittedQuery(content);
    setActiveTab('results');

    dispatch(clearSearchResults());

    // Execute search
    await dispatch(
      fetchGroupSearchResults({
        groupId,
        query: content,
        page: 1,
        limit: 10
      })
    );

    // Refresh search history immediately after using a history item
    dispatch(fetchGroupSearchHistory(groupId));
  };

  const handleClearAllHistory = async () => {
    try {
      await dispatch(clearAllGroupSearchHistory(groupId)).unwrap();
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
      await dispatch(removeGroupSearchHistoryItem({ groupId, searchHistoryId })).unwrap();
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

  const highlightKeywords = (text: string, keywords: string) => {
    if (!keywords.trim()) return text;

    const regex = new RegExp(`(${keywords.trim().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="bg-yellow-200 px-0.5 rounded">$1</span>');
  };

  const renderQuestionItem = (item: SearchResult) => {
    const highlightedTitle = submittedQuery ? highlightKeywords(item.title, submittedQuery) : item.title;
    const highlightedContent = submittedQuery ? highlightKeywords(item.content, submittedQuery) : item.content;

    return (
      <Card
        key={item._id}
        className='mb-3 hover:bg-gray-50 cursor-pointer transition-colors'
        onClick={() => {
          navigate(`/groups/${groupId}/questions/${item._id}`);
          setIsSearchOpen(false);
        }}
      >
        <CardContent className='p-4'>
          <h3
            className='font-medium text-blue-600 line-clamp-2'
            dangerouslySetInnerHTML={{ __html: highlightedTitle }}
          />
          <p
            className='text-sm text-gray-600 mt-1 line-clamp-2'
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
          <div className='text-sm text-gray-500 mt-2 flex justify-between'>
            <span>{getRelativeTime(item.created_at)}</span>
            <span>{item.reply_count} Replies</span>
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
              <p>Delete this search</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    if (value === 'history') {
      dispatch(fetchGroupSearchHistory(groupId));
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
          <DialogTitle>{t('search.groupSearch')}</DialogTitle>
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
            disabled={isLoading && currentQuestionPage === 1}
          >
            {isLoading && currentQuestionPage === 1 ? t('search.searching') : t('search.buttonText')}
          </Button>
        </form>

        <Tabs value={activeTab} onValueChange={handleTabChange} className='mt-4'>
          <TabsList className='mb-4'>
            <TabsTrigger value='results' className='flex items-center'>
              <Search size={16} className='mr-2' />
              {t('search.tabs.results')}
              {totalQuestions > 0 && (
                <span className='ml-2 bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full'>{totalQuestions}</span>
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
            {searchResults.length > 0 && (
              <div className='flex justify-between items-center mb-4'>
                <p className='text-sm text-gray-500'>{totalQuestions} results</p>
                {submittedQuery && searchQuery !== submittedQuery && (
                  <p className='text-xs text-blue-500'>
                    Showing results for: <strong>{submittedQuery}</strong>
                  </p>
                )}
              </div>
            )}

            <ScrollArea className='h-80'>
              {searchResults.length > 0 ? (
                <>
                  <div className='space-y-3'>{searchResults.map((item) => renderQuestionItem(item))}</div>

                  {/* Loading indicator and intersection observer target */}
                  <div ref={loaderRef} className={`${isLoading && hasMoreQuestion && 'py-4'} flex justify-center`}>
                    {isLoading && hasMoreQuestion && (
                      <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500'></div>
                    )}
                  </div>
                </>
              ) : submittedQuery && !isLoading && currentQuestionPage === 1 ? (
                <div className='text-center py-10'>
                  <p className='text-gray-500'>No matching results found</p>
                  <p className='text-sm text-gray-400 mt-1'>Try with different keywords</p>
                </div>
              ) : null}

              {!submittedQuery && (
                <div className='text-center py-10'>
                  <Search size={40} className='mx-auto text-gray-300' />
                  <p className='text-gray-500 mt-3'>{t('search.emptyStates.initial')}</p>
                </div>
              )}

              {isLoading && submittedQuery && currentQuestionPage === 0 && (
                <div className='text-center py-10'>
                  <div className='w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto'></div>
                  <p className='text-gray-500 mt-3'>{t('search.searching')}</p>
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
                  Clear all
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
                <div className='border rounded-md overflow-hidden'>{searchHistory.map(renderHistoryItem)}</div>
              ) : (
                <div className='text-center py-10'>
                  <HistoryIcon size={40} className='mx-auto text-gray-300' />
                  <p className='text-gray-500 mt-3'>{t('search.emptyStates.noHistory')}</p>
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

export default GroupSearch;
