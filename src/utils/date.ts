export const formatDate = (isoString: string) => {
  const date: Date = new Date(isoString);
  const now: Date = new Date();

  // Helper để check cùng ngày
  const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  // Helper để check cùng tuần
  const isSameWeek = (d1: Date, d2: Date): boolean => {
    const weekStart1: Date = new Date(d1);
    weekStart1.setDate(d1.getDate() - d1.getDay());
    const weekStart2: Date = new Date(d2);
    weekStart2.setDate(d2.getDate() - d2.getDay());
    return weekStart1.getTime() === weekStart2.getTime();
  };

  // Định dạng giờ phút
  const formatTime = (d: Date): string => {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // Định dạng thứ
  const weekdays: readonly string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

  if (isSameDay(date, now)) {
    return formatTime(date);
  } else if (isSameWeek(date, now)) {
    return weekdays[date.getDay()];
  } else {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
};
