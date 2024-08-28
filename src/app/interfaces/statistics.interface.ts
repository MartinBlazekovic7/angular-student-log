export interface Statistics {
  hourlyRate: number;
  normalHours: number;
  overtimeHours: number;
  totalHours: number;
  otherFees: OtherFee[];
  otherFeesTotal: number;
  startDate: string;
  endDate: string;
}

export interface OtherFee {
  amount: number;
  reason: string;
}
