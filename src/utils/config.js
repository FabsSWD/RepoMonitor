export const config = {
  github: {
    apiUrl: import.meta.env.VITE_GITHUB_API_URL || 'https://api.github.com',
    apiVersion: import.meta.env.VITE_GITHUB_API_VERSION || 'v3',
  },
  ui: {
    refreshInterval: import.meta.env.VITE_REFRESH_INTERVAL || 30000,
    maxEvents: import.meta.env.VITE_MAX_EVENTS || 10,
  }
};