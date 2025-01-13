import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const GroupAnalytics = () => {
  const metrics = [
    { label: 'Active Users', value: '27', total: '/80' },
    { label: 'Questions Answered', value: '3,298' },
    { label: "Av. Question's Reply", value: '2m 34s' }
  ];

  const performanceMetrics = [
    { label: 'Response Rate', value: '64%' },
    { label: 'Vote per question', value: '86%' },
    { label: 'Engagement Rate', value: '+34%' }
  ];

  const strongestTopics = [
    { name: 'Covid Protocols', percentage: 95 },
    { name: 'Cyber Security', percentage: 92 },
    { name: 'Social Media Policies', percentage: 89 }
  ];

  const weakestTopics = [
    { name: 'Food Safety', percentage: 74 },
    { name: 'Compliance Basics', percentage: 52 },
    { name: 'Company Networking', percentage: 36 }
  ];

  const leaderboard = [
    { name: 'Ken Stewart', points: 637, correct: '98%', role: 'Community Leader', rank: 1 },
    { name: 'Hung Truong', points: 637, correct: '98%', role: 'Active Participant', rank: 2 },
    { name: 'Truong Thuan Hung', points: 637, correct: '98%', role: 'Community Leader', rank: 3 },
    { name: 'Hung', points: 637, correct: '98%', role: 'Knowledge Explorer', rank: 4 },
    { name: 'David Nguyen', points: 637, correct: '98%', role: 'Group Helper', rank: 5 },
    { name: 'Anthony Nguyen', points: 637, correct: '98%', role: 'Community Leader', rank: 6 }
  ];

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'Community Leader': 'bg-red-100 text-red-800',
      'Active Participant': 'bg-blue-100 text-blue-800',
      'Knowledge Explorer': 'bg-orange-100 text-orange-800',
      'Group Helper': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className='p-6 space-y-6 bg-slate-100'>
      {/* Filters */}
      <div className='flex gap-4'>
        <Select defaultValue='7'>
          <SelectTrigger className='w-48 bg-white'>
            <SelectValue placeholder='Timeframe' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='7'>Last 7 days</SelectItem>
            <SelectItem value='30'>Last 30 days</SelectItem>
            <SelectItem value='90'>Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue='all'>
          <SelectTrigger className='w-48 bg-white'>
            <SelectValue placeholder='People' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue='all'>
          <SelectTrigger className='w-48 bg-white'>
            <SelectValue placeholder='Topic' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='covid'>Covid</SelectItem>
            <SelectItem value='security'>Security</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics */}
      <div className='grid grid-cols-3 gap-4'>
        {metrics.map((metric, index) => (
          <Card key={index} className='p-4'>
            <p className='text-sm text-gray-600'>{metric.label}</p>
            <p className='text-2xl font-semibold mt-1'>
              {metric.value}
              {metric.total && <span className='text-gray-400 text-lg'>{metric.total}</span>}
            </p>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className='grid grid-cols-3 gap-4'>
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className='p-4'>
            <p className='text-sm text-gray-600'>{metric.label}</p>
            <p className='text-2xl font-semibold mt-1'>{metric.value}</p>
            <div className='mt-2 h-8 bg-blue-50 rounded-md relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='h-1 bg-blue-500 w-3/4 mx-4'></div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Topics */}
      <div className='grid grid-cols-2 gap-4'>
        <Card className='p-4'>
          <h3 className='font-medium mb-4'>Strongest Topics</h3>
          <div className='space-y-4'>
            {strongestTopics.map((topic, index) => (
              <div key={index} className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>{topic.name}</span>
                  <span>{topic.percentage}% Correct</span>
                </div>
                <div className='h-2 bg-gray-100 rounded-full'>
                  <div className='h-2 bg-green-500 rounded-full' style={{ width: `${topic.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className='p-4'>
          <h3 className='font-medium mb-4'>Weakest Topics</h3>
          <div className='space-y-4'>
            {weakestTopics.map((topic, index) => (
              <div key={index} className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>{topic.name}</span>
                  <span>{topic.percentage}% Correct</span>
                </div>
                <div className='h-2 bg-gray-100 rounded-full'>
                  <div className='h-2 bg-red-500 rounded-full' style={{ width: `${topic.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className='p-4'>
        <h3 className='font-medium mb-4'>User Leaderboard</h3>
        <div className='space-y-4'>
          {leaderboard.map((user, index) => (
            <div key={index} className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Avatar className='w-10 h-10'>
                  <img src={`https://github.com/shadcn.png`} alt={user.name} />
                </Avatar>
                <div>
                  <p className='font-medium'>{user.name}</p>
                  <p className='text-sm text-gray-600'>
                    {user.points} Points - {user.correct} Correct
                  </p>
                </div>
                <Badge className={`ml-2 ${getRoleBadgeColor(user.role as any)}`}>{user.role}</Badge>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{user.rank}</span>
                {user.rank < 6 ? <span className='text-green-500'>▲</span> : <span className='text-red-500'>▼</span>}
              </div>
            </div>
          ))}
          <button className='text-blue-500 text-sm font-medium w-full text-center mt-4'>View full leaderboard →</button>
        </div>
      </Card>
    </div>
  );
};

export default GroupAnalytics;
