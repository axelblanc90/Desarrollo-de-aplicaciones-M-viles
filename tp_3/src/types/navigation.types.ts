export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ConfirmationPending: { email: string };
  ForgotPassword: { prefilledEmail?: string };
  ResetPassword: { recoveryToken?: string };
  Home: undefined;
};
