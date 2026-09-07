export interface PasswordValidationState {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
}

export interface AuthUserProfile {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  emailConfirmedAt?: string | null;
}

export interface AuthSessionData {
  accessToken: string;
  refreshToken: string;
  user: AuthUserProfile;
}

export type AuthScreenType =
  | 'login'
  | 'signUp'
  | 'confirmationPending'
  | 'forgotPassword'
  | 'resetPassword'
  | 'home';
