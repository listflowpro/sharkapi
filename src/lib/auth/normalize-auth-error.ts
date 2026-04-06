export function normalizeAuthError(message: string) {
  if (/confirmation email/i.test(message)) {
    return "Supabase is still trying to send a confirmation email. If you want instant sign-up, disable Confirm email in Supabase Auth and try again.";
  }

  if (/recovery email|reset email/i.test(message)) {
    return "Supabase could not send the reset email. Check the Email provider configuration in Supabase Auth.";
  }

  return message;
}
