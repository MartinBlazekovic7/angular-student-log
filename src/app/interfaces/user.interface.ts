export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string;
  isAdmin: boolean;
  isStudent: boolean;
  isGoogle: boolean;
  teamId?: string;
  details: UserDetails;
  settings: UserSettings;
}

export interface UserDetails {
  university: string;
  degree: string;
  companyName: string;
  hourlyRate: number;
}

export interface UserSettings {
  darkMode: boolean;
  language: string;
}
