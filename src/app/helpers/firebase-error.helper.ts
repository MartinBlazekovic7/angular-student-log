export class FirebaseErrorHelper {
  public static getErrorMessage(error: any): string {
    switch (error) {
      case 'Firebase: Error (auth/invalid-email)':
        return 'Invalid email address!';
      case 'Firebase: Error (auth/user-disabled).':
        return 'User account is disabled!';
      case 'Firebase: Error (auth/user-not-found).':
        return 'User account not found!';
      case 'Firebase: Error (auth/wrong-password).':
        return 'Incorrect password!';
      case 'Firebase: Error (auth/invalid-credential).':
        return 'Invalid credentials!';
      case 'Firebase: Password should be at least 6 characters (auth/weak-password).':
        return 'Password must be at least 6 characters long!';
      case 'Firebase: Error (auth/email-already-in-use).':
        return 'Email address is already in use!';
      case 'Firebase: Error (auth/weak-password).':
        return 'Password must be at least 6 characters long!';
      case 'Firebase: Error (auth/expired-action-code).':
        return 'Password reset code has expired!';
      case 'Firebase: Error (auth/invalid-action-code).':
        return 'Invalid password reset code!';
      default:
        return 'An error occurred!';
    }
  }
}
