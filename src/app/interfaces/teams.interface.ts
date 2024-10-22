export interface Team {
  users: UserDTO[];
  name: string;
  uid: string;
}

export interface UserDTO {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string;
  isStudent: boolean;
  isAdmin: boolean;
}
