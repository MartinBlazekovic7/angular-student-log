import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { UserProfile } from '../../../../interfaces/user.interface';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { SharedService } from '../../../../services/shared.service';
import { Team, UserDTO } from '../../../../interfaces/teams.interface';
import { FirebaseHelper } from '../../../../helpers/firebase.helper';
import { CalendarMonthModule, CalendarView } from 'angular-calendar';
import { TooltipModule } from 'primeng/tooltip';
import { StatisticsComponent } from '../../../dashboard/components/statistics/statistics.component';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../services/auth.service';
import { Collections } from '../../../../enums/collections.enum';
import { DateTimeHelper } from '../../../../helpers/datetime.helper';
import { CalendarEventCustom } from '../../../../interfaces/calendar-data.interface';
import { MonthData } from '../../../../interfaces/month-data.interface';
import { Statistics } from '../../../../interfaces/statistics.interface';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { set } from 'date-fns';

@Component({
  selector: 'app-admin-teams',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    RouterModule,
    DialogModule,
    CalendarMonthModule,
    TooltipModule,
    StatisticsComponent,
    DividerModule,
    TableModule,
    AvatarModule,
    TagModule,
    AvatarGroupModule,
    ToastModule,
  ],
  templateUrl: './admin-teams.component.html',
  styleUrl: './admin-teams.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class AdminTeamsComponent implements OnInit {
  @Input() user: UserProfile | null = null;

  fb = inject(UntypedFormBuilder);
  dataService = inject(DataService);
  authService = inject(AuthService);
  sharedService = inject(SharedService);
  messageService = inject(MessageService);

  createTeamDialog = false;

  teamForm = this.fb.group({
    name: [''],
  });

  userTeam: Team | null = null;

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

  showingUser: UserProfile | null = null;

  ngOnInit() {
    if (!this.user) {
      return;
    }

    if (this.user.teamId) {
      this.dataService
        .getDocument('teams', this.user.teamId)
        .subscribe((team) => {
          this.userTeam = team;
          console.log('User team:', this.userTeam);
        });
    }
  }

  approveMonthData() {
    if (!this.currentMonthData) {
      return;
    }

    this.sharedService.showLoader();

    this.userMonths = this.userMonths.map((month) => {
      if (
        month.month === this.currentMonthData?.month &&
        month.year === this.currentMonthData?.year
      ) {
        month.isApproved = true;
      }
      return month;
    });

    this.currentMonthData.isApproved = true;
    this.dataService
      .updateUserMonthData({
        months: this.userMonths,
        uid: this.showingUser!.uid,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Month data approved',
          });
          setTimeout(() => {
            this.sharedService.hideLoader();
          }, 500);
        },
        error: (error) => {
          console.error('Error approving month data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error approving month data',
          });
          setTimeout(() => {
            this.sharedService.hideLoader();
          }, 500);
        },
      });
  }

  selectUser(user: UserDTO) {
    if (user === this.showingUser) {
      this.showingUser = null;
      this.events = [];
      this.currentMonthData = null;
      return;
    }

    this.showingUser = user as UserProfile;
    this.sharedService.showLoader();
    this.getData();
  }

  toggleDialog() {
    this.createTeamDialog = !this.createTeamDialog;
  }

  closeDialog() {
    this.createTeamDialog = false;
    this.teamForm.reset();
  }

  createTeam() {
    this.sharedService.showLoader();
    if (!this.teamForm.valid) {
      return;
    }

    const name = this.teamForm.value.name;

    if (!name) {
      return;
    }

    const userDTO: UserDTO = {
      uid: this.user?.uid ?? '',
      firstName: this.user?.firstName ?? '',
      lastName: this.user?.lastName ?? '',
      email: this.user?.email ?? '',
      photoURL: this.user?.photoURL ?? '',
      isStudent: false,
      isAdmin: true,
    };

    const team: Team = {
      name,
      uid: FirebaseHelper.generateUid(),
      users: [userDTO],
    };

    this.dataService.createTeam(team).subscribe((response) => {
      this.closeDialog();
      this.updateUser(team);
    });
  }

  updateUser(team: Team) {
    if (!this.user) {
      return;
    }

    this.userTeam = team;
    this.user.teamId = team.uid;
    this.dataService.updateUser(this.user).subscribe({
      next: () => {
        setTimeout(() => {
          this.sharedService.hideLoader();
        }, 1000);
      },
      error: (error) => {
        console.error('Error updating user:', error);
      },
    });
  }

  getData() {
    if (!this.showingUser) return;

    this.dataService
      .getData(Collections.MONTH_DATA, this.showingUser['uid'] as string)
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

  toggleExportingData() {}

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
