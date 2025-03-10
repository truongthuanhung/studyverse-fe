import { useEffect, useState } from 'react';
import GroupMemberItem from '../components/GroupMemberItem';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import GroupMemberItemSkeleton from '@/components/common/GroupMemberItemSkeleton';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const GroupMember = () => {
  const { groupId } = useParams();
  const { admins, members, isFetchingMembers } = useSelector((state: RootState) => state.studyGroup);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Filter admins and members by search keyword
  const filteredAdmins = admins.filter((admin) => admin.user_info.name.toLowerCase().includes(search.toLowerCase()));

  const filteredMembers = members.filter((member) =>
    member.user_info.name.toLowerCase().includes(search.toLowerCase())
  );

  // Determine which members to show based on active tab
  const displayedAdmins = activeTab === 'all' || activeTab === 'admins' ? filteredAdmins : [];
  const displayedMembers = activeTab === 'all' || activeTab === 'members' ? filteredMembers : [];

  return (
    <div className='bg-slate-50 min-h-screen py-6'>
      <Card className='max-w-4xl mx-auto border-none shadow-sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-2xl font-bold'>Group Members</CardTitle>
          <CardDescription>Manage the members of your study group</CardDescription>

          {/* Search with icon */}
          <div className='relative mt-4'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search members by name...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10 bg-white'
            />
          </div>
        </CardHeader>

        <CardContent>
          {isFetchingMembers ? (
            <div className='space-y-3 mt-4'>
              <GroupMemberItemSkeleton />
              <GroupMemberItemSkeleton />
              <GroupMemberItemSkeleton />
            </div>
          ) : (
            <Tabs defaultValue='all' className='mt-2' onValueChange={setActiveTab}>
              <TabsList className='grid grid-cols-3 mb-6'>
                <TabsTrigger value='all'>
                  All
                  <Badge variant='secondary' className='ml-2 bg-slate-200'>
                    {filteredAdmins.length + filteredMembers.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value='admins'>
                  Admins
                  <Badge variant='secondary' className='ml-2 bg-slate-200'>
                    {filteredAdmins.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value='members'>
                  Members
                  <Badge variant='secondary' className='ml-2 bg-slate-200'>
                    {filteredMembers.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value='all' className='space-y-6 mt-2'>
                {displayedAdmins.length > 0 && (
                  <div>
                    <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3'>
                      Administrators
                    </h3>
                    <div className='space-y-2'>
                      {displayedAdmins.map((admin) => (
                        <GroupMemberItem
                          key={admin._id}
                          id={admin._id}
                          username={admin.user_info.username}
                          userId={admin.user_info._id}
                          groupId={groupId as string}
                          name={admin.user_info.name}
                          avatar={admin.user_info.avatar}
                          joinDate={admin.created_at}
                          isAdmin={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {displayedMembers.length > 0 && (
                  <div>
                    <h3 className='font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3'>
                      Regular Members
                    </h3>
                    <div className='space-y-2'>
                      {displayedMembers.map((member) => (
                        <GroupMemberItem
                          key={member._id}
                          id={member._id}
                          userId={member.user_info._id}
                          username={member.user_info.username}
                          groupId={groupId as string}
                          name={member.user_info.name}
                          avatar={member.user_info.avatar}
                          joinDate={member.created_at}
                          isAdmin={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {displayedAdmins.length === 0 && displayedMembers.length === 0 && (
                  <div className='text-center py-8'>
                    <p className='text-muted-foreground'>No members found matching your search.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='admins' className='mt-2'>
                {displayedAdmins.length > 0 ? (
                  <div className='space-y-2'>
                    {displayedAdmins.map((admin) => (
                      <GroupMemberItem
                        key={admin._id}
                        id={admin._id}
                        username={admin.user_info.username}
                        userId={admin.user_info._id}
                        groupId={groupId as string}
                        name={admin.user_info.name}
                        avatar={admin.user_info.avatar}
                        joinDate={admin.created_at}
                        isAdmin={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <p className='text-muted-foreground'>No admins found matching your search.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='members' className='mt-2'>
                {displayedMembers.length > 0 ? (
                  <div className='space-y-2'>
                    {displayedMembers.map((member) => (
                      <GroupMemberItem
                        key={member._id}
                        id={member._id}
                        userId={member.user_info._id}
                        username={member.user_info.username}
                        groupId={groupId as string}
                        name={member.user_info.name}
                        avatar={member.user_info.avatar}
                        joinDate={member.created_at}
                        isAdmin={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <p className='text-muted-foreground'>No members found matching your search.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupMember;
