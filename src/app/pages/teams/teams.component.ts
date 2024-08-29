import { Component, inject, OnInit } from '@angular/core';
import { Collections } from '../../enums/collections.enum';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { UserProfile } from '../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { AdminTeamsComponent } from './components/admin-teams/admin-teams.component';
import { StudentTeamsComponent } from './components/student-teams/student-teams.component';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, AdminTeamsComponent, StudentTeamsComponent],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss',
})
export class TeamsComponent implements OnInit {
  authService = inject(AuthService);
  dataService = inject(DataService);

  user: UserProfile | null = null;

  ngOnInit() {
    this.authService.authStatus$.subscribe((user) => {
      if (!user) return;

      this.dataService
        .getData(Collections.USERS, user?.uid)
        .subscribe((userData) => {
          if (!userData) return;

          this.user = userData as UserProfile;
        });
    });
  }
}
