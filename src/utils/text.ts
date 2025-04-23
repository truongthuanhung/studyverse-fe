export const getInitialsAvatarFallback = (name: string): string => {
  if (!name) return 'UN';

  const names = name.trim().split(' ');

  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  }

  const firstInitial = names[0].charAt(0);
  const lastInitial = names[names.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
};
