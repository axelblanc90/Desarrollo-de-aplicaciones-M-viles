import { PasswordValidationState } from '../types/auth.types';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmailFormat = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

export const validatePasswordCriteria = (password: string): PasswordValidationState => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~]/.test(password);

  const isValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isValid,
  };
};

export const doPasswordsMatch = (password: string, confirmation: string): boolean => {
  return password.length > 0 && password === confirmation;
};
