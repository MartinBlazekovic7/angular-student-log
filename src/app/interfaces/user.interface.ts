export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string;
  details: UserDetails;
}

export interface UserDetails {
  university: string;
  degree: string;
  companyName: string;
  hourlyRate: number;
}
