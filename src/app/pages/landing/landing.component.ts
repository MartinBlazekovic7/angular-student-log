import { ButtonModule } from 'primeng/button';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ButtonModule, CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  @ViewChild('learnMore') learnMore?: ElementRef;

  scrollToLearnMore() {
    if (this.learnMore) {
      this.learnMore.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
}
