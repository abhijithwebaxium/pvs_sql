// API Configuration
// This will use environment variables in production (Vercel)
// and fallback to localhost in development

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export { API_URL };

export default API_URL;
