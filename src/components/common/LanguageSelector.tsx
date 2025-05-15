import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Tiếng Việt' }
  ];

  const changeLanguage = (languageCode: string) => {
    console.log(languageCode);
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className='w-[40px] md:w-[80px] flex flex-col items-center justify-between text-zinc-500 hover:text-sky-500 cursor-pointer'>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className='flex flex-col items-center'>
            <Languages size={22} />
            <p className='hidden md:block text-[12px] font-medium'>{t('common.language')}</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className='cursor-pointer'
            >
              {language.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSelector;
