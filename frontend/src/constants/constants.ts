export const REQUEST_METHOD = {
  GET: 'GET',
} as const;

export const ERROR_MESSAGE = {
  NETWORK_ERROR: 'Can’t reach the forecast service. Check your connection.',
  INTERNAL_SERVER_ERROR: 'The forecast service hit an error. Try again.',
  VALIDATION_ERROR: 'That date range or horizon isn’t available.',
} as const;

/** Data window served by the API (UTC; Great Britain is on GMT in January). */
export const DATA_WINDOW = {
  START: '2026-01-01T00:00:00Z',
  END: '2026-01-31T23:30:00Z',
} as const;

export const HORIZON = {
  MIN: 0,
  MAX: 48,
  DEFAULT: 24,
} as const;
