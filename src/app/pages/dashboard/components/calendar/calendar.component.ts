import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  CalendarMonthModule,
  CalendarMonthViewDay,
  CalendarView,
} from 'angular-calendar';
import { MessageService } from 'primeng/api';
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
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CalendarMonthModule,
    ToastModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    TableModule,
    DividerModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService],
})
export class CalendarComponent implements OnInit, OnChanges {
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
  @Input() editingCalendar: boolean = false;
  @Input() addingFreeDays: boolean = false;
  @Input() addingOtherFees: boolean = false;
  @Input() changingHourlyRate: boolean = false;
  @Input() exportingData: boolean = false;
  @Input() showingHelp: boolean = false;
  @Input() statistics: Statistics = {
    hourlyRate: 0,
    normalHours: 0,
    overtimeHours: 0,
    totalHours: 0,
    otherFeesTotal: 0,
    otherFees: [],
    startDate: '',
    endDate: '',
  };
  @Output() updateData: EventEmitter<any> = new EventEmitter();

  fb = inject(UntypedFormBuilder);
  sharedService = inject(SharedService);

  messageService = inject(MessageService);

  editingDays: boolean = false;
  addingFreeDaysWindow: boolean = false;
  addingOtherFeesWindow: boolean = false;
  changingHourlyRateWindow: boolean = false;
  exportingDataWindow: boolean = false;
  showingHelpWindow: boolean = false;

  dataForm = this.fb.group({
    title: [''],
    startTime: [''],
    endTime: [''],
  });

  freeDaysForm = this.fb.group({
    reason: [''],
  });

  otherFeesForm = this.fb.group({
    amount: [''],
    reason: [''],
  });

  hourlyRateForm = this.fb.group({
    hourlyRate: [''],
  });

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
          isFreeDay: day.events[0].isFreeDay,
          freeDayReason: day.events[0].freeDayReason ?? '',
          start: new Date(day.events[0].dateString),
        };
        this.events = [...this.events, event];
      });
    console.log(this.statistics);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleChange(changes);
  }

  handleEditingCalendar(): void {
    this.editingDays = !this.editingDays;
    if (!this.editingCalendar) {
      this.cancelData();
    }
  }

  handleAddingFreeDays(): void {
    this.editingDays = !this.editingDays;
    if (!this.addingFreeDays) {
      this.cancelData();
    }
  }

  handleAddingOtherFees(): void {
    this.addingOtherFeesWindow = !this.addingOtherFeesWindow;
  }

  handleChangingHourlyRate(): void {
    this.hourlyRateForm.patchValue({ hourlyRate: this.statistics.hourlyRate });
    this.changingHourlyRateWindow = !this.changingHourlyRateWindow;
  }

  handleExportingData(): void {
    this.exportingDataWindow = !this.exportingDataWindow;
  }

  handleShowingHelp(): void {
    this.showingHelpWindow = !this.showingHelpWindow;
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

  updateOtherFees(): void {
    if (!this.otherFeesForm.valid) {
      return;
    }

    this.sharedService.showLoader();

    const otherFeesTotal =
      this.statistics.otherFeesTotal + this.otherFeesForm.value.amount;

    this.statistics.otherFees.push({
      amount: this.otherFeesForm.value.amount,
      reason: this.otherFeesForm.value.reason,
    });
    this.statistics.otherFeesTotal = otherFeesTotal;

    this.addingOtherFeesWindow = false;
    this.updateData.emit({ events: this.events, statistics: this.statistics });
    this.otherFeesForm.reset();
  }

  updateHourlyRate(): void {
    if (!this.hourlyRateForm.valid) {
      return;
    }

    this.sharedService.showLoader();

    this.statistics.hourlyRate = this.hourlyRateForm.value.hourlyRate;

    this.events = CalendarDataHelper.updateEvents(
      this.events,
      this.statistics.hourlyRate
    );

    this.changingHourlyRateWindow = false;
    this.updateData.emit({ events: this.events, statistics: this.statistics });
    this.hourlyRateForm.reset();
  }

  markAsFreeDay(): void {
    if (!this.freeDaysForm.valid) {
      return;
    }

    this.selectedDays.forEach((day: any) => {
      const event = {
        title: 'Free Day',
        money: 0,
        startTime: '00:00',
        endTime: '00:00',
        workHours: 0,
        date: day.date,
        dateString: day.dateString,
        overtimeHours: 0,
        normalHours: 0,
        overtimeMoney: 0,
        start: new Date(day.dateString),
        isFreeDay: true,
        freeDayReason: this.freeDaysForm.value.reason,
      };
      this.events = [...this.events, event];
    });

    this.updateData.emit({ events: this.events, statistics: this.statistics });
    this.selectedDays = [];
    this.editingDays = false;
  }

  handleChange(changes: SimpleChanges): void {
    if (changes['editingCalendar'] && !changes['editingCalendar'].firstChange) {
      this.handleEditingCalendar();
    }
    if (changes['addingFreeDays'] && !changes['addingFreeDays'].firstChange) {
      this.handleAddingFreeDays();
    }
    if (changes['addingOtherFees'] && !changes['addingOtherFees'].firstChange) {
      this.handleAddingOtherFees();
    }
    if (
      changes['changingHourlyRate'] &&
      !changes['changingHourlyRate'].firstChange
    ) {
      this.handleChangingHourlyRate();
    }
    if (changes['exportingData'] && !changes['exportingData'].firstChange) {
      this.handleExportingData();
    }
    if (changes['showingHelp'] && !changes['showingHelp'].firstChange) {
      this.handleShowingHelp();
    }
  }

  cancelData(): void {
    this.selectedDays = [];
    this.editingDays = false;
    this.dataForm.reset();
  }

  closeDialog(): void {
    this.addingFreeDaysWindow = false;
    this.addingOtherFeesWindow = false;
    this.changingHourlyRateWindow = false;
    this.exportingDataWindow = false;
    this.showingHelpWindow = false;

    this.freeDaysForm.reset();
    this.otherFeesForm.reset();
  }
}
