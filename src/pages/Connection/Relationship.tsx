import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppDispatch, RootState } from '@/store/store';
import { fetchFollowers, fetchFollowings, fetchFriends, resetRelationships } from '@/store/slices/relationshipSlice';
import { ScrollArea } from '@/components/ui/scroll-area';
import MainLogo from '@/assets/images/mainLogo.jpeg';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import RelationshipItem from './components/RelationshipItem';

const ITEMS_PER_PAGE = 10;

const Relationship = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentPage, setCurrentPage] = useState({
    friends: 1,
    followers: 1,
    followings: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recently');
  const [activeTab, setActiveTab] = useState('friends');

  // Refs for infinite scroll
  const observerRefs = {
    friends: useRef<IntersectionObserver | null>(null),
    followers: useRef<IntersectionObserver | null>(null),
    followings: useRef<IntersectionObserver | null>(null)
  };

  const loadingRefs = {
    friends: useRef<HTMLDivElement>(null),
    followers: useRef<HTMLDivElement>(null),
    followings: useRef<HTMLDivElement>(null)
  };

  const footerLinks = [
    'Terms of Service',
    'Privacy Policy',
    'Warranty',
    'Terms of Sale',
    'Cookie Policy',
    'Help Center'
  ];

  const {
    friends,
    followers,
    followings,
    isFetchingFriends,
    isFetchingFollowers,
    isFetchingFollowings,
    hasMoreFriends,
    hasMoreFollowers,
    hasMoreFollowings
  } = useSelector((state: RootState) => state.relationship);

  useEffect(() => {
    loadInitialData();
    return () => {
      dispatch(resetRelationships());
      // Cleanup observers
      Object.values(observerRefs).forEach((ref) => ref.current?.disconnect());
    };
  }, [dispatch]);

  const loadInitialData = () => {
    dispatch(fetchFriends({ page: 1, limit: ITEMS_PER_PAGE }));
    dispatch(fetchFollowers({ page: 1, limit: ITEMS_PER_PAGE }));
    dispatch(fetchFollowings({ page: 1, limit: ITEMS_PER_PAGE }));
  };

  const loadMore = useCallback(
    (type: 'friends' | 'followers' | 'followings') => {
      const newPage = currentPage[type] + 1;
      setCurrentPage((prev) => ({ ...prev, [type]: newPage }));

      switch (type) {
        case 'friends':
          if (!isFetchingFriends && hasMoreFriends) {
            dispatch(fetchFriends({ page: newPage, limit: ITEMS_PER_PAGE }));
          }
          break;
        case 'followers':
          if (!isFetchingFollowers && hasMoreFollowers) {
            dispatch(fetchFollowers({ page: newPage, limit: ITEMS_PER_PAGE }));
          }
          break;
        case 'followings':
          if (!isFetchingFollowings && hasMoreFollowings) {
            dispatch(fetchFollowings({ page: newPage, limit: ITEMS_PER_PAGE }));
          }
          break;
      }
    },
    [
      currentPage,
      dispatch,
      hasMoreFriends,
      hasMoreFollowers,
      hasMoreFollowings,
      isFetchingFriends,
      isFetchingFollowers,
      isFetchingFollowings
    ]
  );

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const types: Array<'friends' | 'followers' | 'followings'> = ['friends', 'followers', 'followings'];

    types.forEach((type) => {
      observerRefs[type].current = new IntersectionObserver((entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          const hasMore =
            (type === 'friends' && hasMoreFriends) ||
            (type === 'followers' && hasMoreFollowers) ||
            (type === 'followings' && hasMoreFollowings);

          const isLoading =
            (type === 'friends' && isFetchingFriends) ||
            (type === 'followers' && isFetchingFollowers) ||
            (type === 'followings' && isFetchingFollowings);

          if (hasMore && !isLoading && activeTab === type) {
            loadMore(type);
          }
        }
      }, options);

      // Observe loading ref if it exists
      if (loadingRefs[type].current) {
        observerRefs[type].current?.observe(loadingRefs[type].current!);
      }
    });

    return () => {
      types.forEach((type) => {
        observerRefs[type].current?.disconnect();
      });
    };
  }, [activeTab, loadMore, hasMoreFriends, hasMoreFollowers, hasMoreFollowings]);

  const renderConnectionList = (connections: any, type: 'friends' | 'followers' | 'followings') => {
    const isLoading =
      (type === 'friends' && isFetchingFriends) ||
      (type === 'followers' && isFetchingFollowers) ||
      (type === 'followings' && isFetchingFollowings);

    const hasMore =
      (type === 'friends' && hasMoreFriends) ||
      (type === 'followers' && hasMoreFollowers) ||
      (type === 'followings' && hasMoreFollowings);

    const filteredConnections = connections.filter((connection: any) =>
      connection.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedConnections = [...filteredConnections].sort((a, b) => {
      switch (sortBy) {
        case 'firstName':
          return a.name.split(' ')[0].localeCompare(b.name.split(' ')[0]);
        case 'lastName':
          return a.name.split(' ').pop()!.localeCompare(b.name.split(' ').pop()!);
        default:
          return 0;
      }
    });

    return (
      <div className='space-y-4'>
        {sortedConnections.map((connection) => (
          <RelationshipItem key={connection.id} relationship={connection} type={type} />
        ))}
        {(isLoading || hasMore) && (
          <div ref={loadingRefs[type]} className='text-center py-4'>
            {isLoading && <Spinner size='medium' />}
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className='bg-slate-50 h-[calc(100vh-60px)] p-6'>
      <div className='flex gap-8'>
        <Card className='max-w-4xl flex-1 mx-auto self-start'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full'>
                <div className='relative w-full md:w-64'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500' />
                  <Input
                    className='pl-9 w-full'
                    placeholder='Search connections'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className='w-full md:w-40'>
                    <SelectValue placeholder='Sort by' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='recently'>Recently added</SelectItem>
                    <SelectItem value='firstName'>First name</SelectItem>
                    <SelectItem value='lastName'>Last name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs
              defaultValue='friends'
              className='w-full'
              onValueChange={(value) => setActiveTab(value as 'friends' | 'followers' | 'followings')}
            >
              <TabsList className='w-full'>
                <TabsTrigger value='friends' className='flex-1'>
                  Friends
                </TabsTrigger>
                <TabsTrigger value='followers' className='flex-1'>
                  Followers
                </TabsTrigger>
                <TabsTrigger value='followings' className='flex-1'>
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value='friends' className='mt-6'>
                {renderConnectionList(friends, 'friends')}
              </TabsContent>

              <TabsContent value='followers' className='mt-6'>
                {renderConnectionList(followers, 'followers')}
              </TabsContent>

              <TabsContent value='followings' className='mt-6'>
                {renderConnectionList(followings, 'followings')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card className='hidden lg:block w-80 sticky top-0 self-start'>
          <CardHeader className='pb-3'>
            <div className='flex items-center space-x-3'>
              <img src={MainLogo} alt='StudyVerse Logo' className='h-12 w-12 rounded-lg object-cover' />
              <p className='text-sm text-muted-foreground font-medium'>© 2024 StudyVerse Corp.</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-2'>
              {footerLinks.map((link, index) => (
                <Button
                  key={index}
                  variant='ghost'
                  className='h-8 justify-start p-2 text-xs font-medium text-muted-foreground hover:text-foreground'
                >
                  {link}
                </Button>
              ))}
            </div>

            <Separator className='my-4' />

            <div className='space-y-4'>
              <p className='text-xs text-muted-foreground leading-relaxed'>
                StudyVerse helps you connect and share knowledge with anyone, anywhere.
              </p>
              <div className='flex gap-2'>
                <Button variant='outline' size='sm' className='w-full text-xs'>
                  About Us
                </Button>
                <Button variant='outline' size='sm' className='w-full text-xs'>
                  Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default Relationship;
