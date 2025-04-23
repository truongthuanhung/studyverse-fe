import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import GroupGridItem from './components/GroupGridItem';
import { useNavigate } from 'react-router-dom';
import { Plus, Sparkles, TrendingUp, Compass, School, Tag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { useEffect, useRef } from 'react';
import { getRecommededGroups } from '@/store/slices/studyGroupsListSlice';

// Mock data for popular topics
const popularTopics = [
  { id: 1, name: 'Computer Science', count: 156 },
  { id: 2, name: 'Data Science', count: 124 },
  { id: 3, name: 'Mathematics', count: 98 },
  { id: 4, name: 'Physics', count: 87 },
  { id: 5, name: 'Chemistry', count: 76 },
  { id: 6, name: 'Biology', count: 65 }
];

const GroupDiscover = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const recommendedContainerRef = useRef<HTMLDivElement>(null);

  const { recommendedGroups, isLoadingRecommendedGroups, hasMoreRecommendedGroups, recommendedGroupsCurrentPage } =
    useSelector((state: RootState) => state.studyGroupsList);

  // Infinite scroll logic for recommended groups
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMoreRecommendedGroups && !isLoadingRecommendedGroups) {
          dispatch(
            getRecommededGroups({
              page: recommendedGroupsCurrentPage + 1,
              limit: 9
            })
          );
        }
      },
      {
        threshold: 0.5
      }
    );

    const currentTarget = recommendedContainerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMoreRecommendedGroups, isLoadingRecommendedGroups, recommendedGroupsCurrentPage, dispatch]);

  // Initial data load for recommended groups
  useEffect(() => {
    if (recommendedGroups.length === 0 && !isLoadingRecommendedGroups) {
      dispatch(getRecommededGroups({ page: 1, limit: 9 }));
    }
  }, [dispatch, recommendedGroups.length, isLoadingRecommendedGroups]);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 flex items-center gap-2'>
            <Compass className='text-sky-500' />
            Discover Study Groups
          </h1>
          <p className='text-slate-500 mt-1'>Find the perfect study groups to boost your learning</p>
        </div>

        <Button
          onClick={() => navigate('/groups/create')}
          className='mt-4 md:mt-0 bg-sky-500 hover:bg-sky-600 shadow-sm'
        >
          <Plus className='mr-2 h-4 w-4' /> Create New Group
        </Button>
      </div>

      {/* Featured Topics */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Tag className='h-5 w-5 text-sky-500' />
            Popular Topics
          </CardTitle>
          <CardDescription>Find groups based on your interests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2'>
            {popularTopics.map((topic) => (
              <Badge key={topic.id} variant='secondary' className='cursor-pointer hover:bg-sky-100 py-2 px-3'>
                {topic.name} <span className='ml-1 text-sky-500'>({topic.count})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Groups Tabs */}
      <Tabs defaultValue='recommended' className='w-full'>
        <TabsList className='grid grid-cols-2 mb-6'>
          <TabsTrigger value='recommended' className='flex items-center gap-2'>
            <Sparkles className='h-4 w-4' /> Recommended for You
          </TabsTrigger>
          <TabsTrigger value='popular' className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4' /> Popular Groups
          </TabsTrigger>
        </TabsList>

        {/* Recommended Groups Tab */}
        <TabsContent value='recommended'>
          {isLoadingRecommendedGroups && recommendedGroups.length === 0 ? (
            <div className='flex justify-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500'></div>
            </div>
          ) : recommendedGroups.length > 0 ? (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {recommendedGroups.map((group) => (
                  <GroupGridItem key={group._id} group={group} isJoined={false} />
                ))}
              </div>

              {/* Loading indicator and intersection observer target for infinite scroll */}
              <div
                ref={recommendedContainerRef}
                className={`${isLoadingRecommendedGroups && hasMoreRecommendedGroups && 'py-8'} flex justify-center`}
              >
                {isLoadingRecommendedGroups && hasMoreRecommendedGroups && (
                  <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500'></div>
                )}
              </div>
            </>
          ) : (
            <div className='text-center py-12 bg-white rounded-lg border'>
              <School className='mx-auto h-12 w-12 text-slate-300' />
              <h3 className='mt-4 text-lg font-medium text-slate-700'>No recommended groups found</h3>
              <Button onClick={() => navigate('/profile/edit')} className='mt-6 bg-sky-500 hover:bg-sky-600'>
                Complete Your Profile
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Popular Groups Tab */}
        <TabsContent value='popular'>
          {/* This section would implement similar infinite scroll logic for popular groups */}
          <div className='text-center py-12 bg-white rounded-lg border'>
            <TrendingUp className='mx-auto h-12 w-12 text-slate-300' />
            <h3 className='mt-4 text-lg font-medium text-slate-700'>Popular groups coming soon</h3>
            <p className='text-slate-500 mt-2'>We're working on bringing you the most popular study groups</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDiscover;
