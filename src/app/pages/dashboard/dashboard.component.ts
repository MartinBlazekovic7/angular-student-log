import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarComponent } from './components/calendar/calendar.component';
import { StatisticsComponent } from './components/statistics/statistics.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CalendarComponent, StatisticsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
