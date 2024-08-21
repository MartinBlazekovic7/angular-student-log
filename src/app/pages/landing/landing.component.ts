import { ButtonModule } from 'primeng/button';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ButtonModule, CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  @ViewChild('learnMore') learnMore?: ElementRef;

  authService = inject(AuthService);

  isLoggedIn = false;

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  scrollToLearnMore() {
    if (this.learnMore) {
      this.learnMore.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}
