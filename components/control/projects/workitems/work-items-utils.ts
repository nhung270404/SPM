export const normalizeDate = (d: Date | null) => {
  if (!d) return null;
  const date = new Date(d);
  date.setHours(12, 0, 0, 0);
  return date;
};

export const toDateOnly = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
