import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = yup.object({
  name: yup.string().required('Name is required').min(3, 'Name must be at least 3 characters'),
  privacy: yup.string().required('Privacy setting is required'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters')
});

const initialValues = {
  name: 'Cùng học Toán cao cấp',
  privacy: 'private',
  description: 'Cùng học Toán cao cấp'
};

const GroupSettings = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues
  });

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  const formValues = watch();
  const isFormChanged = JSON.stringify(formValues) !== JSON.stringify(initialValues);

  return (
    <div className='min-h-screen bg-slate-50 py-8'>
      <Card className='max-w-2xl mx-auto shadow-lg'>
        <CardHeader>
          <CardTitle className='text-2xl font-semibold text-slate-800'>Group Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-700'>Name</label>
              <Input {...register('name')} className='w-full focus:ring-2 focus:ring-blue-500' />
              {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-700'>Group Privacy</label>
              <Select value={watch('privacy')} onValueChange={(value) => setValue('privacy', value)}>
                <SelectTrigger className='w-full bg-white'>
                  <SelectValue placeholder='Select privacy level' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='public'>Public</SelectItem>
                  <SelectItem value='private'>Private</SelectItem>
                </SelectContent>
              </Select>
              {errors.privacy && <p className='text-sm text-red-500'>{errors.privacy.message}</p>}
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-slate-700'>Description</label>
              <Textarea
                {...register('description')}
                className='min-h-32 w-full resize-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter group description...'
              />
              {errors.description && <p className='text-sm text-red-500'>{errors.description.message}</p>}
            </div>

            <div className='flex justify-end pt-4'>
              <Button
                type='submit'
                disabled={!isFormChanged}
                className='rounded-full px-6 bg-sky-500 hover:bg-sky-600 disabled:opacity-50'
              >
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupSettings;
