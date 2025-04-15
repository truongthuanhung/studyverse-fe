import { Globe, Users, Lock, Handshake } from 'lucide-react';

export const PRIVACY_OPTIONS = [
  { value: '0', label: 'Public', icon: Globe },
  { value: '1', label: 'Friends', icon: Handshake },
  { value: '2', label: 'Followers', icon: Users },
  { value: '3', label: 'Only me', icon: Lock }
] as const;

export const MAX_FILES = 4;
