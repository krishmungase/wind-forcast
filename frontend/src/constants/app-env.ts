export const appEnv = {
  NODE_ENV: import.meta.env.VITE_NODE_ENV,

  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'Wind Forecast Monitor',

  // Empty = same origin (Vercel serves the API under /api; Vite proxies it in dev).
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL ?? '',
  BACKEND_BASE_URL: `${import.meta.env.VITE_BACKEND_URL ?? ''}/api`,
};
