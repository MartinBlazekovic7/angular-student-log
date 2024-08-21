import { Injectable } from '@angular/core';
import { DashboardData } from '../interfaces/dashboard-data.interface';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}

  getDashboardData(): DashboardData {
    return {
      statistics: {
        hourlyRate: 6,
        normalHours: 40,
        overtimeHours: 10,
        totalHours: 50,
        otherFees: 100,
        startDate: '2021-01-01',
        endDate: '2021-01-31',
      },
      calendar: {
        year: 2021,
        month: 1,
        days: [],
      },
    };
  }
}
