import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { filter } from 'rxjs';
import { LoaderComponent } from './components/loader/loader.component';
import { AuthService } from './services/auth.service';
import { DataService } from './services/data.service';
import { Collections } from './enums/collections.enum';
import { UserProfile } from './interfaces/user.interface';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    ButtonModule,
    ReactiveFormsModule,
    DialogModule,
    SelectButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);
  dataService = inject(DataService);
  fb = inject(UntypedFormBuilder);

  user: UserProfile | null = null;

  showHeaderFooter: boolean = true;

  userTypeForm = this.fb.group({
    userType: ['student', Validators.required],
  });

  showUserTypeForm = false;

  stateOptions: any[] = [
    { label: 'Student', value: 'student' },
    { label: 'Administrator', value: 'administrator' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkUserType();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.checkRoute(event.urlAfterRedirects);
        }
      });
  }

  checkRoute(url: string) {
    const routesToHide = ['/auth'];

    this.showHeaderFooter = !routesToHide.includes(url);
  }

  checkUserType() {
    this.authService.authStatus$.subscribe((user) => {
      if (!user) return;

      this.dataService
        .getData(Collections.USERS, user?.uid)
        .subscribe((userData) => {
          if (!userData) return;

          this.user = userData as UserProfile;
          this.showUserTypeForm = !this.user.isStudent && !this.user.isAdmin;
        });
    });
  }

  updateUserType() {
    const userTypeFormModel = this.userTypeForm.value;
    const user = {
      ...this.user,
      isStudent: userTypeFormModel.userType === 'student',
      isAdmin: userTypeFormModel.userType === 'administrator',
    };

    this.dataService.updateUser(user as UserProfile).subscribe(() => {
      this.showUserTypeForm = false;
    });
  }
}
