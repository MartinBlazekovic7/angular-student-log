import { map } from 'rxjs';
import { Component, inject, Input, OnInit } from '@angular/core';
import { UserProfile } from '../../../../interfaces/user.interface';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { DataService } from '../../../../services/data.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterModule } from '@angular/router';
import { Team, UserDTO } from '../../../../interfaces/teams.interface';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { ConfirmationService, TreeNode } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SharedService } from '../../../../services/shared.service';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-student-teams',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    RouterModule,
    ConfirmDialogModule,
    OrganizationChartModule,
    AvatarModule,
  ],
  templateUrl: './student-teams.component.html',
  styleUrl: './student-teams.component.scss',
  providers: [ConfirmationService],
})
export class StudentTeamsComponent implements OnInit {
  @Input() user: UserProfile | null = null;

  dataService = inject(DataService);
  fb = inject(UntypedFormBuilder);
  confirmationService = inject(ConfirmationService);
  sharedService = inject(SharedService);

  codeForm = this.fb.group({
    code: ['', Validators.required],
  });

  team: Team | null = null;

  showConfirmation = false;

  selectedNodes!: TreeNode[];

  data: TreeNode[] = [];

  ngOnInit() {
    if (!this.user) {
      return;
    }

    if (this.user.teamId) {
      this.getTeam(this.user.teamId);
    }
  }

  joinTeam() {
    const code = this.codeForm.get('code')?.value;
    if (!code) return;

    this.getTeam(code);
  }

  getTeam(code: string) {
    this.dataService.getTeamByCode(code).subscribe({
      next: (response) => {
        this.team = response;
        this.setData();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  setData() {
    const admin = this.team?.users.find((user) => user.isAdmin);
    if (!admin) return;

    this.data = [
      {
        expanded: true,
        type: 'person',
        data: {
          image: admin.photoURL,
          name: `${admin.firstName} ${admin.lastName}`,
          title: 'Administrator',
        },
        children: this.team?.users
          .filter((user) => !user.isAdmin)
          .map((user) => ({
            expanded: true,
            type: 'person',
            data: {
              image: user.photoURL,
              name: `${user.firstName} ${user.lastName}`,
              title: 'Student',
            },
          })),
      },
    ];
  }

  confirmDialog(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to join this team?',
      header: 'Join Team',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.addUserToTeam();
      },
      reject: () => {},
    });
  }

  addUserToTeam() {
    this.sharedService.showLoader();

    const userDTO: UserDTO = {
      email: this.user?.email ?? '',
      firstName: this.user?.firstName ?? '',
      lastName: this.user?.lastName ?? '',
      photoURL: this.user?.photoURL ?? '',
      uid: this.user?.uid ?? '',
      isAdmin: this.user?.isAdmin ?? false,
      isStudent: this.user?.isStudent ?? true,
    };

    this.dataService.joinTeam(this.team!, userDTO).subscribe({
      next: () => {
        this.team!.users.push(userDTO);
        this.user!.teamId = this.team!.uid;
        this.updateUser();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  updateUser() {
    this.dataService.updateUser(this.user!).subscribe({
      next: () => {
        setTimeout(() => {
          this.sharedService.hideLoader();
        }, 1000);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
