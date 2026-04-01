const AUTH_ERRORS: Record<string, string> = {
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'Email not confirmed': 'Email non confirme. Verifie ta boite mail.',
  'User already registered': 'Un compte existe deja avec cet email',
  'Password should be at least 6 characters': 'Le mot de passe doit faire au moins 6 caracteres',
  'Unable to validate email address: invalid format': "Format d'email invalide",
  'Email rate limit exceeded': 'Trop de tentatives. Reessaie dans quelques minutes.',
  'For security purposes, you can only request this after': 'Trop de tentatives. Reessaie dans quelques minutes.',
  'Signup requires a valid password': 'Le mot de passe est requis',
}

export function translateAuthError(message: string): string {
  if (AUTH_ERRORS[message]) return AUTH_ERRORS[message]

  for (const [key, value] of Object.entries(AUTH_ERRORS)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return value
  }

  return 'Une erreur est survenue. Reessaie.'
}
