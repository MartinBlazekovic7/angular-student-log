import { CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';

export interface CalendarDayCustom extends CalendarMonthViewDay {
  events: CalendarEventCustom[];
  dateString: string;
}

export interface CalendarEventCustom extends CalendarEvent {
  money: number;
  startTime: string;
  endTime: string;
  workHours: number;
  date: Date;
  dateString: string;
  overtimeHours: number;
  normalHours: number;
  overtimeMoney: number;
}

export interface DataFormModel {
  title: string;
  startTime: string;
  endTime: string;
}
