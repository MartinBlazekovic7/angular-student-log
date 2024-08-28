import {
  CalendarDayCustom,
  DataFormModel,
} from '../interfaces/calendar-data.interface';
import { Statistics } from '../interfaces/statistics.interface';

export class CalendarDataHelper {
  public static calculateEvent(
    formValue: DataFormModel,
    hourlyRate: number,
    day: CalendarDayCustom
  ) {
    const startDate = new Date(day.date);
    const endDate = new Date(day.date);

    const [startHour, startMinute] = formValue.startTime.split(':').map(Number);
    const [endHour, endMinute] = formValue.endTime.split(':').map(Number);

    startDate.setHours(startHour, startMinute, 0, 0);
    endDate.setHours(endHour, endMinute, 0, 0);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1); // If end time is past midnight, move it to the next day
    }

    const isSunday = startDate.getDay() === 0;

    // Calculate total work hours
    const workHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    // Initialize overtime and normal hours
    let overtimeHours = 0;
    let normalHours = 0;
    let totalMoney = 0;
    let overtimeMoney = 0;

    let currentTime = new Date(startDate);

    while (currentTime < endDate) {
      let nextTime = new Date(currentTime);
      nextTime.setHours(currentTime.getHours() + 1);

      if (nextTime > endDate) {
        nextTime = endDate;
      }

      const currentHour = currentTime.getHours();

      const isNightShift = currentHour >= 22 || currentHour < 6;
      const currentRate =
        isNightShift || isSunday ? hourlyRate * 1.5 : hourlyRate;

      const hourFraction =
        (nextTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

      if (isNightShift || isSunday) {
        overtimeHours += hourFraction;
        overtimeMoney += currentRate * hourFraction;
      } else {
        normalHours += hourFraction;
      }

      totalMoney += currentRate * hourFraction;

      currentTime = nextTime;
    }

    return {
      title: formValue.title,
      money: totalMoney,
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      workHours: workHours,
      overtimeHours: overtimeHours,
      normalHours: normalHours,
      overtimeMoney: overtimeMoney,
      isFreeDay: false,
      date: new Date(day.date),
      start: new Date(day.date),
      dateString: new Date(day.date).toDateString(),
    };
  }
  public static calculateStatistics(
    statistics: Statistics,
    events: any[]
  ): Statistics {
    const updatedStatistics = { ...statistics };

    events.forEach((event) => {
      updatedStatistics.normalHours += event.normalHours;
      updatedStatistics.overtimeHours += event.overtimeHours;
      updatedStatistics.totalHours += event.workHours;
      updatedStatistics.otherFees += event.otherFees;
    });

    return updatedStatistics;
  }
}
