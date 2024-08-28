import { DateTimeHelper } from './../../helpers/datetime.helper';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CalendarComponent } from './components/calendar/calendar.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { UserProfile } from '../../interfaces/user.interface';
import { Collections } from '../../enums/collections.enum';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import {
  MonthData,
  MonthDataResponse,
} from '../../interfaces/month-data.interface';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CalendarDataHelper } from '../../helpers/calendar-data.helper';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CalendarComponent,
    StatisticsComponent,
    ButtonModule,
    RippleModule,
    RouterModule,
    ToastModule,
    TooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [MessageService],
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  dataService = inject(DataService);
  sharedService = inject(SharedService);
  messageService = inject(MessageService);

  user: UserProfile | null = null;

  userHasCurrentMonthData = false;
  userHasData = false;

  currentMonth = DateTimeHelper.getMonthName(new Date().getMonth());
  currentYear = new Date().getFullYear();

  userAllMonthsData: MonthDataResponse | null = null;
  currentMonthData: MonthData | null = null;

  editingCalendar: boolean = false;
  addingFreeDays: boolean = false;
  addingOtherFees: boolean = false;
  changingHourlyRate: boolean = false;
  exportingData: boolean = false;
  showingHelp: boolean = false;

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
      .getData(Collections.MONTH_DATA, this.user.uid)
      .subscribe((data) => {
        if (!data) {
          this.userHasData = false;
          this.sharedService.hideLoader();
          return;
        }

        this.userHasData = true;
        this.userAllMonthsData = data as MonthDataResponse;

        const monthData = data as MonthDataResponse;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        monthData.months.forEach((month) => {
          if (month.month === currentMonth && month.year === currentYear) {
            this.userHasCurrentMonthData = true;
            this.currentMonthData = month;
            this.sharedService.hideLoader();
          }
        });
      });
  }

  startCollectingData() {
    if (!this.user) return;

    if (this.userHasData && !this.userHasCurrentMonthData) {
      this.handleUpdateUserMonthData();
      return;
    }

    this.handleCreateUserMonthData();
  }

  handleCreateUserMonthData() {
    if (!this.user) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthData = {
      month: currentMonth,
      year: currentYear,
      days: DateTimeHelper.generateMonthDays(currentMonth, currentYear),
      statistics: {
        hourlyRate: 0,
        normalHours: 0,
        overtimeHours: 0,
        totalHours: 0,
        otherFees: 0,
        startDate: '',
        endDate: '',
      },
    };

    const monthData: MonthDataResponse = {
      uid: this.user.uid,
      months: [currentMonthData],
    };

    this.dataService.addData(Collections.MONTH_DATA, monthData).subscribe({
      next: () => {
        this.userHasCurrentMonthData = true;
        this.currentMonthData = currentMonthData;
        this.sharedService.hideLoader();
      },
      error: (error) => {
        this.sharedService.hideLoader();
        console.error('Error adding data', error);
      },
    });
  }

  handleUpdateUserMonthData() {
    if (!this.user || !this.userAllMonthsData) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthData = {
      month: currentMonth,
      year: currentYear,
      days: DateTimeHelper.generateMonthDays(currentMonth, currentYear),
      statistics: {
        hourlyRate: 0,
        normalHours: 0,
        overtimeHours: 0,
        totalHours: 0,
        otherFees: 0,
        startDate: '',
        endDate: '',
      },
    };

    this.userAllMonthsData.months.push(currentMonthData);

    const monthData: MonthDataResponse = {
      uid: this.user.uid,
      months: this.userAllMonthsData?.months,
    };

    this.dataService.updateUserMonthData(monthData).subscribe({
      next: () => {
        this.userHasCurrentMonthData = true;
        this.currentMonthData = currentMonthData;
        this.sharedService.hideLoader();
      },
      error: (error) => {
        this.sharedService.hideLoader();
        console.error('Error updating data', error);
      },
    });
  }

  updateData(event: any) {
    const daysWithEvents = DateTimeHelper.addEventsToDays(
      this.currentMonthData!.days,
      event.events
    );

    const updatedStatistics = CalendarDataHelper.calculateStatistics(
      event.statistics,
      event.events
    );

    this.currentMonthData!.days = daysWithEvents;
    this.currentMonthData!.statistics = updatedStatistics;

    this.dataService.updateUserMonthData(this.userAllMonthsData!).subscribe({
      next: () => {
        this.sharedService.hideLoader();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Successfully added days to calendar.',
        });
      },
      error: (error) => {
        this.sharedService.hideLoader();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error adding days to calendar.',
        });
        console.error('Error updating data', error);
      },
    });
  }

  toggleEditingCalendar() {
    this.editingCalendar = !this.editingCalendar;
  }

  toggleAddingFreeDays() {
    this.addingFreeDays = !this.addingFreeDays;
  }

  toggleAddingOtherFees() {
    this.addingOtherFees = !this.addingOtherFees;
  }

  toggleChangingHourlyRate() {
    this.changingHourlyRate = !this.changingHourlyRate;
  }

  toggleExportingData() {
    this.exportingData = !this.exportingData;
  }

  toggleShowingHelp() {
    this.showingHelp = !this.showingHelp;
  }
}
