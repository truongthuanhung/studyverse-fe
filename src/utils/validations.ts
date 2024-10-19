export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const toISO8601 = (day: number, month: number, year: number) => {
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');

  const isoString = `${year}-${formattedMonth}-${formattedDay}`;

  return isoString;
};
