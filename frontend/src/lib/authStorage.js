/**
 * authStorage — persists the token and account object returned by
 * `/auth/login` / `/auth/register`.
 *
 * Uses localStorage: simplest option that survives a page refresh,
 * which matters here since there's no refresh-token flow — per the
 * API docs, once the token expires the user just has to log in again,
 * so there's no session state more complex than "do we have a token."
 * A more secure httpOnly-cookie approach would need backend
 * cooperation that isn't part of the documented API, so not used here.
 */
const TOKEN_KEY = 'foodshare_token';
const ACCOUNT_KEY = 'foodshare_account';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAccount() {
  const raw = localStorage.getItem(ACCOUNT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token, account) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ACCOUNT_KEY);
}
