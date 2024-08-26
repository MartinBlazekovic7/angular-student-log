export class DateTimeHelper {
  static getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return months[month];
  }

  getFirstDayOfMonth(month: number, year: number): string {
    return new Date(year, month, 1).toISOString();
  }

  public static generateDateRangeString(
    datesArray: { date: string }[]
  ): string {
    if (!datesArray || datesArray.length === 0) {
      return '';
    }

    const sortedDates = datesArray
      .map((item) => new Date(item.date))
      .sort((a, b) => a.getTime() - b.getTime());

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}.${month}.`;
    };

    let result = '';
    let rangeStart = sortedDates[0];
    let previousDate = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const diffDays =
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 3600 * 24);

      if (diffDays === 1) {
        previousDate = currentDate;
      } else {
        if (rangeStart.getTime() === previousDate.getTime()) {
          result += formatDate(rangeStart) + ', ';
        } else {
          result += `${formatDate(rangeStart)} - ${formatDate(previousDate)}, `;
        }
        rangeStart = currentDate;
        previousDate = currentDate;
      }
    }

    if (rangeStart.getTime() === previousDate.getTime()) {
      result += formatDate(rangeStart);
    } else {
      result += `${formatDate(rangeStart)} - ${formatDate(previousDate)}`;
    }

    return result.replace(/,\s*$/, '');
  }

  public static generateMonthDays(month: number, year: number): any[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const monthDaysArray = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);

      const dayObject = {
        date: currentDate,
        dateString: currentDate.toDateString(),
        day: day,
        isPast:
          currentDate <
          new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        isToday: currentDate.toDateString() === today.toDateString(),
        isFuture:
          currentDate >
          new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        inMonth: currentDate.getMonth() === month,
        events: [],
        badgeTotal: 0,
      };

      monthDaysArray.push(dayObject);
    }

    return monthDaysArray;
  }

  public static addEventsToDays(days: any[], events: any[]): any[] {
    const eventsWithDateObjects = events.map((event) => ({
      ...event,
      date: new Date(event.dateString),
    }));

    days.forEach((day) => {
      const matchingEvents = eventsWithDateObjects.filter(
        (event) => event.date.toDateString() === day.dateString
      );

      day.events = [...matchingEvents];
    });

    return days;
  }
}
