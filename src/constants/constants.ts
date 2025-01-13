import { Globe, Users, Lock } from 'lucide-react';

export const PRIVACY_OPTIONS = [
  { value: 'anyone', label: 'Anyone', icon: Globe },
  { value: 'friends', label: 'Friends', icon: Users },
  { value: 'only_me', label: 'Only me', icon: Lock }
] as const;

export const MAX_FILES = 4;