export interface CalendarData {
  month: number;
  year: number;
  days: CalendarDay[];
}

export interface CalendarDay {
  date: string;
  day: number;
  hours: number;
  isWeekend: boolean;
  isHoliday: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  isCurrentYear: boolean;
  description: string;
  money: number;
}
