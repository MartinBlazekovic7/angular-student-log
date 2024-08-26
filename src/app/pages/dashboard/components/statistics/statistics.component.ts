import { Component, Input } from '@angular/core';
import { Statistics } from '../../../../interfaces/statistics.interface';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent {
  @Input() statistics: Statistics = {
    hourlyRate: 0,
    normalHours: 0,
    overtimeHours: 0,
    totalHours: 0,
    otherFees: 0,
    startDate: '',
    endDate: '',
  };

  constructor() {}

  getSalary(): number {
    return (
      this.statistics.hourlyRate * this.statistics.normalHours +
      this.statistics.overtimeHours * this.statistics.hourlyRate * 1.5
    );
  }
}
