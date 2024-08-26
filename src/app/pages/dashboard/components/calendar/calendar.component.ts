import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  CalendarMonthModule,
  CalendarMonthViewDay,
  CalendarView,
} from 'angular-calendar';
import { MenuItem, MessageService } from 'primeng/api';
import { SpeedDialModule } from 'primeng/speeddial';
import { ToastModule } from 'primeng/toast';
import {
  CalendarDayCustom,
  CalendarEventCustom,
} from '../../../../interfaces/calendar-data.interface';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Statistics } from '../../../../interfaces/statistics.interface';
import { DateTimeHelper } from '../../../../helpers/datetime.helper';
import { SharedService } from '../../../../services/shared.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarDataHelper } from '../../../../helpers/calendar-data.helper';

@Component({
  selector: 'app-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CalendarMonthModule,
    SpeedDialModule,
    ToastModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService],
})
export class CalendarComponent implements OnInit {
  view: CalendarView = CalendarView.Month;

  viewDate: Date = new Date();

  events: CalendarEventCustom[] = [];

  selectedDays: any = [];

  selectedMonthViewDay?: CalendarMonthViewDay;

  selectDay(day: CalendarMonthViewDay): void {
    this.selectedMonthViewDay = day;
    const selectedDateTime = this.selectedMonthViewDay.date.getTime();
    const dateIndex = this.selectedDays.findIndex(
      (selectedDay: any) => selectedDay.date.getTime() === selectedDateTime
    );
    if (dateIndex > -1) {
      delete this.selectedMonthViewDay.cssClass;
      this.selectedDays.splice(dateIndex, 1);
    } else {
      this.selectedDays.push(this.selectedMonthViewDay);
      day.cssClass = 'cal-day-selected';
      this.selectedMonthViewDay = day;
    }
  }

  // ----------------------------------------------
  @Input() days: CalendarDayCustom[] = [];
  @Input() statistics: Statistics = {
    hourlyRate: 0,
    normalHours: 0,
    overtimeHours: 0,
    totalHours: 0,
    otherFees: 0,
    startDate: '',
    endDate: '',
  };
  @Output() updateData: EventEmitter<any> = new EventEmitter();

  fb = inject(UntypedFormBuilder);
  sharedService = inject(SharedService);

  messageService = inject(MessageService);

  editingDays: boolean = false;

  dataForm = this.fb.group({
    title: [''],
    startTime: [''],
    endTime: [''],
  });

  items: MenuItem[] = [
    {
      icon: 'pi pi-pencil',
      command: () => {
        this.editingDays = !this.editingDays;
      },
    },
    {
      icon: 'pi pi-refresh',
      command: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Update',
          detail: 'Data Updated',
        });
      },
    },
    {
      icon: 'pi pi-trash',
      command: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Delete',
          detail: 'Data Deleted',
        });
      },
    },
    {
      icon: 'pi pi-upload',
      routerLink: ['/fileupload'],
    },
    {
      icon: 'pi pi-external-link',
      target: '_blank',
      url: 'http://angular.io',
    },
  ];

  ngOnInit(): void {
    this.days
      .filter((day) => day.events.length > 0)
      .forEach((day) => {
        const event = {
          title: `${day.events[0].title}`,
          money: day.events[0].money,
          startTime: `${day.events[0].startTime}`,
          endTime: `${day.events[0].endTime}`,
          workHours: day.events[0].workHours,
          date: day.events[0].date,
          dateString: day.events[0].dateString,
          overtimeHours: day.events[0].overtimeHours,
          normalHours: day.events[0].normalHours,
          overtimeMoney: day.events[0].overtimeMoney,
          start: new Date(day.events[0].dateString),
        };
        this.events = [...this.events, event];
      });
  }

  clickDay(day: CalendarMonthViewDay) {
    if (this.editingDays) {
      this.selectDay(day);
      return;
    }

    this.showDayInfo(day);
  }

  showDayInfo(day: CalendarMonthViewDay): void {
    console.log(day);
  }

  getDateRange(): string {
    return DateTimeHelper.generateDateRangeString(this.selectedDays);
  }

  formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}.`;
  }

  saveData(): void {
    if (!this.dataForm.valid) {
      return;
    }

    this.sharedService.showLoader();

    this.selectedDays.forEach((day: any) => {
      const event = CalendarDataHelper.calculateEvent(
        this.dataForm.value,
        this.statistics.hourlyRate,
        day
      );

      this.events = [...this.events, event];
    });

    this.updateData.emit({ events: this.events, statistics: this.statistics });
    this.selectedDays = [];
    this.editingDays = false;
    this.dataForm.reset();
  }

  cancelData(): void {
    this.selectedDays = [];
    this.editingDays = false;
    this.dataForm.reset();
  }
}
