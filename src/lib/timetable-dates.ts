/** The Timetable collection's day fields, Monday to Friday, in the grid's column order (seed/seed.json). */
export const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

const malayMonths = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis"];

/** A holiday's date in Malaysian time: its weekday as a grid column (null at the weekend) and its label, "8 Mac". */
export function holidayDate(value: string | Date) {
  const local = new Date(new Date(value).getTime() + 8 * 60 * 60 * 1000);
  const day = local.getUTCDay();
  return { weekday: day >= 1 && day <= 5 ? day - 1 : null, label: `${local.getUTCDate()} ${malayMonths[local.getUTCMonth()]}` };
}
