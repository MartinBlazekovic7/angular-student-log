import { CalendarMonthViewDay } from 'angular-calendar';
import { Statistics } from './statistics.interface';
import { CalendarDayCustom } from './calendar-data.interface';

export interface MonthData {
  month: number;
  year: number;
  days: CalendarDayCustom[];
  statistics: Statistics;
  isApproved?: boolean;
}

export interface MonthDataResponse {
  months: MonthData[];
  uid: string;
}
