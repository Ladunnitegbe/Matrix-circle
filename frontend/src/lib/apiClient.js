/**
 * apiClient — the one place every screen's API calls go through.
 * Matches the FoodShare API documentation exactly:
 *
 *   - Success responses are always `{ success: true, ...data }`.
 *   - Error responses are always `{ success: false, msg, errors? }`.
 *     `errors` (an array of `{ field, message }`) only appears on 400
 *     validation failures; every other error just has `msg`.
 *
 * Throws an `ApiError` (status + msg + errors) for anything that
 * isn't a success response — including network failures (mapped to
 * status 0) and non-JSON responses — so calling code has one
 * consistent shape to handle regardless of what went wrong.
 *
 * Base URL comes from `VITE_API_BASE_URL` if set, falling back to the
 * documented local default. Set the env var once a real deployment
 * URL exists — no code changes needed elsewhere.
 */


const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";


export class ApiError extends Error {
  constructor(status, msg, errors) {
    super(msg);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(path, { method = 'GET', body, token, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    // Network failure, CORS failure, DNS failure, etc. — the fetch
    // itself never completed, so there's no status code from the server.
    throw new ApiError(0, 'Unable to reach the server. Check your connection and try again.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(response.status, 'Unexpected response from the server.');
  }

  if (!data.success) {
    throw new ApiError(response.status, data.msg || 'Something went wrong.', data.errors);
  }

  return data;
}
