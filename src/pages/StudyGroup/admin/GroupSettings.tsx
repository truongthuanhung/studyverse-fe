import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GroupSettings = () => {
  const [formData, setFormData] = useState({
    name: 'Cùng học Toán cao cấp',
    privacy: 'private',
    description: 'Cùng học Toán cao cấp'
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className='p-6 bg-sky-50'>
      {/* Header */}
      <h2 className='text-2xl font-semibold mb-6'>Group settings</h2>

      <form onSubmit={handleSubmit} className='w-full'>
        {/* Name Field */}
        <div className='mb-6'>
          <Label htmlFor='name' className='text-sm font-medium mb-2 block'>
            Name
          </Label>
          <Input
            type='text'
            id='name'
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className='w-full bg-white'
          />
        </div>

        {/* Privacy Field */}
        <div className='mb-6'>
          <Label htmlFor='privacy' className='text-sm font-medium mb-2 block'>
            Group privacy
          </Label>
          <Select value={formData.privacy} onValueChange={(value) => handleChange('privacy', value)}>
            <SelectTrigger className='w-full bg-white'>
              <SelectValue placeholder='Select privacy' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='public'>Public</SelectItem>
              <SelectItem value='private'>Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description Field */}
        <div className='mb-6'>
          <Label htmlFor='description' className='text-sm font-medium mb-2 block'>
            Description
          </Label>
          <Textarea
            id='description'
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className='min-h-[120px] w-full bg-white'
            placeholder='Enter group description'
          />
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-3 mt-8'>
          <Button variant='outline' className='text-gray-500 border-gray-300 hover:bg-gray-100 rounded-[20px]'>
            Cancel
          </Button>
          <Button className='bg-sky-500 hover:bg-sky-600 text-white rounded-[20px]'>Save changes</Button>
        </div>
      </form>
    </div>
  );
};

export default GroupSettings;
