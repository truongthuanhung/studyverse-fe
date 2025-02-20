import { useEffect, useState } from 'react';
import GroupMemberItem from '../components/GroupMemberItem';
import { Input } from '@/components/ui/input'; // Shadcn Input component
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import GroupMemberItemSkeleton from '@/components/common/GroupMemberItemSkeleton';

const GroupMember = () => {
  const { groupId } = useParams();
  const { admins, members, isFetchingMembers } = useSelector((state: RootState) => state.studyGroup);
  const [search, setSearch] = useState('');

  // Lọc danh sách Admins và Members theo từ khóa tìm kiếm
  const filteredAdmins = admins.filter((admin) => admin.user_info.name.toLowerCase().includes(search.toLowerCase()));
  const filteredMembers = members.filter((member) =>
    member.user_info.name.toLowerCase().includes(search.toLowerCase())
  );
  console.log({ filteredAdmins, filteredMembers });

  return (
    <div className='bg-slate-100'>
      <div className='gap-4 max-w-4xl mx-auto p-6'>
        {/* Search Bar */}
        <div className='w-full mb-4'>
          <Input
            placeholder='Search members...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full bg-white'
          />
        </div>

        {/* Loading State */}
        {isFetchingMembers ? (
          <div className='flex flex-col gap-2'>
            <GroupMemberItemSkeleton />
            <GroupMemberItemSkeleton />
            <GroupMemberItemSkeleton />
          </div>
        ) : (
          <>
            <h3 className='font-bold text-lg'>Admins</h3>
            <div className='flex flex-col gap-2 bg-blue-50 p-4 rounded-lg'>
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
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
                ))
              ) : (
                <p className='text-gray-500'>No admins found.</p>
              )}
            </div>

            {/* Other Members Section */}
            <h3 className='font-bold text-lg mt-4'>Other members</h3>
            <div className='flex flex-col gap-2 bg-blue-50 p-4 rounded-lg'>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
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
                ))
              ) : (
                <p className='text-gray-500'>No members found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupMember;
