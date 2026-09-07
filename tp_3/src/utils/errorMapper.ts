export interface MappedAuthError {
  userMessage: string;
  isRateLimit: boolean;
  isEmailNotConfirmed: boolean;
  isInvalidCredentials: boolean;
  originalCode?: string;
}

export const mapSupabaseAuthError = (error: any): MappedAuthError => {
  if (!error) {
    return {
      userMessage: 'Ocurrió un error inesperado. Por favor, intentá nuevamente.',
      isRateLimit: false,
      isEmailNotConfirmed: false,
      isInvalidCredentials: false,
    };
  }

  const rawMessage = (error.message || '').toLowerCase();
  const rawCode = (error.code || error.status || '').toString().toLowerCase();

  const isEmailNotConfirmed =
    rawCode === 'email_not_confirmed' ||
    rawMessage.includes('email not confirmed') ||
    rawMessage.includes('confirm your email');

  const isInvalidCredentials =
    rawCode === 'invalid_credentials' ||
    rawCode === 'invalid_grant' ||
    rawMessage.includes('invalid login credentials') ||
    rawMessage.includes('invalid credentials');

  const isRateLimit =
    rawCode === 'over_request_rate_limit' ||
    rawCode === '429' ||
    error.status === 429 ||
    rawMessage.includes('rate limit') ||
    rawMessage.includes('too many requests') ||
    rawMessage.includes('over_email_send_rate_limit');

  const isWeakPassword =
    rawCode === 'weak_password' ||
    rawMessage.includes('weak_password') ||
    rawMessage.includes('password should be at least');

  const isUserAlreadyExists =
    rawCode === 'user_already_exists' ||
    rawMessage.includes('already registered');

  const isNetworkError =
    rawMessage.includes('network') ||
    rawMessage.includes('fetch failed') ||
    rawMessage.includes('connection');

  let userMessage = 'Ocurrió un error al procesar tu solicitud.';

  if (isRateLimit) {
    userMessage = 'Demasiados intentos. Por motivos de seguridad, esperá 60 segundos antes de reintentar.';
  } else if (isEmailNotConfirmed) {
    userMessage = 'Tu cuenta aún no fue confirmada. Revisá tu casilla de correo para activarla.';
  } else if (isInvalidCredentials) {
    userMessage = 'Email o contraseña incorrectos.';
  } else if (isWeakPassword) {
    userMessage = 'La contraseña no cumple con los requisitos mínimos de seguridad exigidos.';
  } else if (isUserAlreadyExists) {
    userMessage = 'Si el correo ingresado ya existe, te enviamos un enlace para continuar.';
  } else if (isNetworkError) {
    userMessage = 'Problema de conexión. Verificá tu acceso a internet e intentá nuevamente.';
  }

  return {
    userMessage,
    isRateLimit,
    isEmailNotConfirmed,
    isInvalidCredentials,
    originalCode: rawCode || undefined,
  };
};
