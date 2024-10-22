import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Component } from '@angular/core';
import { CalendarMonthModule, CalendarView } from 'angular-calendar';
import { CalendarEventCustom } from '../../interfaces/calendar-data.interface';
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '@angular/fire/auth';
import { Collections } from '../../enums/collections.enum';
import { MessageService } from 'primeng/api';
import { SharedService } from '../../services/shared.service';
import { MonthData } from '../../interfaces/month-data.interface';
import { StatisticsComponent } from '../dashboard/components/statistics/statistics.component';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Statistics } from '../../interfaces/statistics.interface';
import { TagModule } from 'primeng/tag';
import { ExcelService } from '../../services/excel.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    CalendarMonthModule,
    ButtonModule,
    TooltipModule,
    StatisticsComponent,
    DividerModule,
    DialogModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class HistoryComponent implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);
  sharedService = inject(SharedService);
  messageService = inject(MessageService);
  excelService = inject(ExcelService);

  user: UserProfile | null = null;

  view: CalendarView = CalendarView.Month;

  viewDate: Date = this.setInitialViewDate();

  events: CalendarEventCustom[] = [];

  showingMonth = DateTimeHelper.getMonthName(new Date().getMonth() - 1);
  showingYear = new Date().getFullYear();

  userMonths: MonthData[] = [];
  currentMonthData: MonthData | null = null;
  currentMonthStatistics: Statistics = {
    hourlyRate: 0,
    normalHours: 0,
    overtimeHours: 0,
    totalHours: 0,
    otherFeesTotal: 0,
    otherFees: [],
    startDate: '',
    endDate: '',
  };

  selectedDayWindow: boolean = false;
  selectedDay: any = null;

  addingOtherFeesWindow: boolean = false;

  exportDialogVisible: boolean = false;

  ngOnInit() {
    this.sharedService.showLoader();
    this.authService.authStatus$.subscribe((user) => {
      if (!user) return;

      this.dataService
        .getData(Collections.USERS, user?.uid)
        .subscribe((userData) => {
          if (!userData) return;

          this.user = userData as UserProfile;
          this.getData();
        });
    });
  }

  getData() {
    if (!this.user) return;

    this.dataService
      .getData(Collections.MONTH_DATA, this.user['uid'] as string)
      .subscribe((data) => {
        if (!data) {
          this.sharedService.hideLoader();
          return;
        }

        this.userMonths = data['months'];
        this.setDataForMonth();
        this.sharedService.hideLoader();
      });
  }

  setInitialViewDate() {
    const previousMonth = new Date().getMonth() - 1;
    const currentYear = new Date().getFullYear();

    return new Date(currentYear, previousMonth, 1);
  }

  setDataForMonth() {
    const currentMonthData = this.userMonths.find(
      (month) =>
        month.month === this.viewDate.getMonth() &&
        month.year === this.viewDate.getFullYear()
    );

    if (!currentMonthData) {
      this.events = [];
      this.currentMonthData = null;
      return;
    }

    this.currentMonthData = currentMonthData;
    this.currentMonthStatistics = currentMonthData.statistics;

    const events = this.currentMonthData.days
      .flatMap((day) => day.events)
      .filter((event) => event !== null)
      .map((event) => ({
        ...event,
        start: new Date(event.dateString),
        date: new Date(event.dateString),
      }));

    this.events = events as CalendarEventCustom[];
  }

  changeMonth(direction: string) {
    this.sharedService.showLoader();

    if (direction === 'next') {
      this.viewDate = new Date(
        this.viewDate.getFullYear(),
        this.viewDate.getMonth() + 1,
        1
      );
    } else {
      this.viewDate = new Date(
        this.viewDate.getFullYear(),
        this.viewDate.getMonth() - 1,
        1
      );
    }
    this.showingMonth = DateTimeHelper.getMonthName(this.viewDate.getMonth());
    this.showingYear = this.viewDate.getFullYear();
    this.setDataForMonth();
    setTimeout(() => {
      this.sharedService.hideLoader();
    }, 500);
  }

  toggleExportingData() {
    this.exportDialogVisible = !this.exportDialogVisible;
  }

  closeExportDialog() {
    this.exportDialogVisible = false;
  }

  exportToExcel() {
    this.excelService.generateExcel(
      this.currentMonthData!.days,
      'September_2024'
    );
    this.closeExportDialog();
  }

  toggleOtherFees() {
    this.addingOtherFeesWindow = true;
  }

  showDayInfo(day: any): void {
    if (!this.currentMonthData) {
      return;
    }

    this.selectedDayWindow = true;
    this.selectedDay = day;
  }
}
