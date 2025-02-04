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

export const formatDateMessage = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const getHourFromISOString = (isoString: string) => {
  const date = new Date(isoString);

  // Cộng thêm 7 giờ (7 * 60 * 60 * 1000 milliseconds)
  const adjustedDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  // Lấy giờ và phút theo định dạng HH:mm
  const hours = adjustedDate.getUTCHours().toString().padStart(2, '0');
  const minutes = adjustedDate.getUTCMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
};

export const getRelativeTime = (isoTime: string): string => {
  const now = new Date();
  const target = new Date(isoTime);

  // Kiểm tra tính hợp lệ của thời gian đầu vào
  if (isNaN(target.getTime())) {
    throw new Error('Invalid ISO String');
  }

  const diff = now.getTime() - target.getTime(); // Khoảng thời gian chênh lệch tính bằng ms

  if (diff < 0) return 'In the future'; // Nếu thời gian là tương lai
  if (diff < 60000) return 'Just now'; // <1 phút
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`; // <1 giờ
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`; // <1 ngày
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`; // <1 tháng
  const months = Math.floor(days / 30.44); // Trung bình 30.44 ngày/tháng
  if (months < 12) return `${months}mo`; // <1 năm
  const years = Math.floor(months / 12);
  return `${years}y`; // >=1 năm
};

export const getFullTime = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid ISO String');
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Asia/Bangkok'
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const MMDDYYYYConvert = (dateString: string) => {
  // Parse the ISO string into a Date object
  const date = new Date(dateString);

  // Convert to GMT+7 by adjusting the timezone offset
  const gmt7Date = new Date(date.getTime() + (7 - date.getTimezoneOffset() / 60) * 60 * 60 * 1000);

  // Format the date to 'Month Day, Year'
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return gmt7Date.toLocaleDateString('en-US', options);
};
