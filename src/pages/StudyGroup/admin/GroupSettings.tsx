import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { StudyGroupPrivacy } from '@/types/enums';
import { editGroupById } from '@/store/slices/studyGroupSlice';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@/components/ui/spinner';

const schema = yup.object({
  name: yup.string().required('Name is required').min(3, 'Name must be at least 3 characters'),
  privacy: yup.string().required('Privacy setting is required'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters')
});

const GroupSettings = () => {
  // States
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { groupId } = useParams();
  const { t } = useTranslation();

  // Selectors
  const { info, isLoading } = useSelector((state: RootState) => state.studyGroup);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      privacy: '',
      description: ''
    }
  });

  // Effects
  useEffect(() => {
    if (info && !isDataLoaded) {
      const privacyValue = info.privacy.toString();

      reset({
        name: info.name,
        privacy: privacyValue,
        description: info.description
      });

      setIsDataLoaded(true);
    }
  }, [info, reset, isDataLoaded]);

  // Forms
  const formValues = watch();
  const isFormChanged =
    info && isDataLoaded
      ? JSON.stringify({
          name: formValues.name,
          privacy: formValues.privacy,
          description: formValues.description
        }) !==
        JSON.stringify({
          name: info.name,
          privacy: info.privacy.toString(),
          description: info.description
        })
      : false;
  const isFormReady = isDataLoaded && !isLoading;

  const onSubmit = async (data: any) => {
    try {
      if (!groupId || !info) return;

      const body = {
        name: data.name,
        privacy: parseInt(data.privacy),
        description: data.description
      };

      await dispatch(editGroupById({ groupId: info._id, body })).unwrap();
      toast({
        description: t('groups.updateSuccess'),
        variant: 'default'
      });
      navigate(`/groups/${groupId}/home`);
    } catch (error: any) {
      console.error('Failed to update group:', error);
      toast({
        description: t('groups.updateError'),
        variant: 'destructive'
      });
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 py-8'>
      <Card className='max-w-2xl mx-auto shadow-lg'>
        <CardHeader>
          <CardTitle className='text-2xl font-semibold text-slate-800'>{t('groups.settingsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!isFormReady ? (
            <div className='flex justify-center p-6'>
              <div className='animate-pulse'>Loading group data...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>{t('groups.nameLabel')}</label>
                <Input {...register('name')} className='w-full focus:ring-2 focus:ring-blue-500' />
                {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>{t('groups.privacyLabel')}</label>
                <Select
                  defaultValue={formValues.privacy}
                  onValueChange={(value) => setValue('privacy', value, { shouldValidate: true })}
                >
                  <SelectTrigger className='w-full bg-white'>
                    <SelectValue placeholder={t('groups.privacyPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StudyGroupPrivacy.Public.toString()}>{t('groups.public')}</SelectItem>
                    <SelectItem value={StudyGroupPrivacy.Private.toString()}>{t('groups.private')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.privacy && <p className='text-sm text-red-500'>{errors.privacy.message}</p>}
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>{t('groups.descriptionLabel')}</label>
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
                  disabled={!isFormChanged || isLoading}
                  className='rounded-full px-6 bg-sky-500 hover:bg-sky-600 disabled:opacity-50'
                >
                  {isLoading ? <Spinner size='small' /> : t('common.saveChanges')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupSettings;
