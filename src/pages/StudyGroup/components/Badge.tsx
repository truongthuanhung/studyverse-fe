import { Award, BookOpen, GraduationCap, Lightbulb, Star, Trophy } from 'lucide-react';

export const badgeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  'Knowledge Explorer': {
    icon: <BookOpen size={12} />,
    color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
  },
  'Active Contributor': {
    icon: <Star size={12} />,
    color: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
  },
  'Topic Expert': {
    icon: <Lightbulb size={12} />,
    color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
  },
  'Community Leader': {
    icon: <Trophy size={12} />,
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
  },
  'Academic Excellence': {
    icon: <GraduationCap size={12} />,
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  // Default for any other badge
  default: {
    icon: <Award size={12} />,
    color: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
};
