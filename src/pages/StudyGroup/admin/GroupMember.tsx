import { useState } from 'react';
import GroupMemberItem from '../components/GroupMemberItem';
import { Input } from '@/components/ui/input'; // Shadcn Input component

const GroupMember = () => {
  const mockMembers = [
    {
      name: 'Jessica Drew',
      avatar: 'https://via.placeholder.com/150',
      joinDate: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 5 years ago
      isAdmin: true
    },
    {
      name: 'Peter Parker',
      avatar: 'https://via.placeholder.com/150',
      joinDate: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 2 years ago
      isAdmin: false
    },
    {
      name: 'Mary Jane',
      avatar: 'https://via.placeholder.com/150',
      joinDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
      isAdmin: false
    },
    {
      name: 'John Doe',
      avatar: 'https://via.placeholder.com/150',
      joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      isAdmin: true
    }
  ];

  const [search, setSearch] = useState('');

  // Lọc danh sách Admins và Members
  const filteredAdmins = mockMembers.filter(
    (member) => member.isAdmin && member.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredMembers = mockMembers.filter(
    (member) => !member.isAdmin && member.name.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Admins Section */}
        <h3 className='font-bold text-lg'>Admins</h3>
        <div className='flex flex-col gap-2 bg-blue-50 mt-4'>
          {filteredAdmins.length > 0 ? (
            filteredAdmins.map((member, index) => (
              <GroupMemberItem
                key={index}
                name={member.name}
                avatar={member.avatar}
                joinDate={member.joinDate}
                isAdmin={member.isAdmin}
              />
            ))
          ) : (
            <p className='text-gray-500'>No admins found.</p>
          )}
        </div>

        {/* Other Members Section */}
        <h3 className='font-bold text-lg mt-4'>Other members</h3>
        <div className='flex flex-col gap-2 bg-blue-50 mt-4'>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, index) => (
              <GroupMemberItem
                key={index}
                name={member.name}
                avatar={member.avatar}
                joinDate={member.joinDate}
                isAdmin={member.isAdmin}
              />
            ))
          ) : (
            <p className='text-gray-500'>No members found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupMember;
