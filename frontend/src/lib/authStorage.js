const TOKEN_KEY = 'foodshare_token';
const ACCOUNT_KEY = 'foodshare_account';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function getAccount() {
  const raw = localStorage.getItem(ACCOUNT_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export function setSession(token, account) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ACCOUNT_KEY);
}
