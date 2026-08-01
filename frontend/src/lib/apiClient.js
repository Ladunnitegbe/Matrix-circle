const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
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
