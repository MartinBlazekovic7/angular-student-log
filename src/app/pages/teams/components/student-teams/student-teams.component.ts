import { Component, inject, Input } from '@angular/core';
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
import { switchMap } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SharedService } from '../../../../services/shared.service';

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
  ],
  templateUrl: './student-teams.component.html',
  styleUrl: './student-teams.component.scss',
  providers: [ConfirmationService],
})
export class StudentTeamsComponent {
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

  joinTeam() {
    const code = this.codeForm.get('code')?.value;
    if (!code) return;

    this.dataService.getTeamByCode(code).subscribe({
      next: (response) => {
        this.team = response;

        if (!this.team) {
          return;
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
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
