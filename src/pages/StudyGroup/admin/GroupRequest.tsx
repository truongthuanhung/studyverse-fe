import JoinRequest from '../components/JoinRequest';

const mockRequests = [
  {
    name: 'Jessica Drew',
    avatar: 'https://via.placeholder.com/150',
    time: new Date(Date.now() - 8 * 60 * 1000).toISOString() // 8 minutes ago
  },
  {
    name: 'Peter Parker',
    avatar: 'https://via.placeholder.com/150',
    time: new Date(Date.now() - 2 * 3600 * 1000).toISOString() // 2 hours ago
  },
  {
    name: 'Mary Jane',
    avatar: 'https://via.placeholder.com/150',
    time: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() // 1 day ago
  },
  {
    name: 'John Doe',
    avatar: 'https://via.placeholder.com/150',
    time: new Date().toISOString() // just now
  }
];

const GroupRequest = () => {
  return (
    <div className='bg-slate-100'>
      <div className='flex flex-col gap-4 max-w-4xl mx-auto p-6'>
        {mockRequests.map((request, index) => (
          <JoinRequest key={index} name={request.name} avatar={request.avatar} time={request.time} />
        ))}
      </div>
    </div>
  );
};

export default GroupRequest;
