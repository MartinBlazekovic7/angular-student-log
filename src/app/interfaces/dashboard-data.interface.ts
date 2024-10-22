import { CalendarData } from './calendar-data.interface';
import { Statistics } from './statistics.interface';

export interface DashboardData {
  statistics: Statistics;
  calendar: CalendarData;
}
