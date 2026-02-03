// API constants
export const API_VERSION = 'v1';
export const API_PREFIX = '/api';

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 4000;

// CORS origins
export const ALLOWED_ORIGINS = [
  'http://localhost:5173', // Vite default
  'http://localhost:3000', // React default
  'http://localhost:4173', // Vite preview
  'https://app.modkitsonline.com', // Vite preview
  process.env.CLIENT_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values
