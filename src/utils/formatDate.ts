// 날짜 표시 유틸

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad = (n: number): string => String(n).padStart(2, '0');

const formatDay = (d: Date): string =>
  `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} (${WEEKDAYS[d.getDay()]})`;

const formatTime = (d: Date): string => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/**
 * 행사 일정 문구
 * @example formatEventPeriod(...) // "2026.11.20 (금) 18:00 ~ 21:00"
 * @example 날짜가 다르면 // "2026.11.20 (금) 18:00 ~ 2026.11.21 (토) 02:00"
 */
export const formatEventPeriod = (startsAt: string, endsAt: string): string => {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime())) return '';
  if (Number.isNaN(end.getTime())) return `${formatDay(start)} ${formatTime(start)}`;

  const head = `${formatDay(start)} ${formatTime(start)}`;
  return formatDay(start) === formatDay(end)
    ? `${head} ~ ${formatTime(end)}`
    : `${head} ~ ${formatDay(end)} ${formatTime(end)}`;
};