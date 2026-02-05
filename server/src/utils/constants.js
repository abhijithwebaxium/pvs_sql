// API constants
export const API_VERSION = 'v1';
export const API_PREFIX = '/api';

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 4000;

// CORS origins
export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://app.modkitsonline.com',
  'https://cpsas038:8080',
  'https://127.0.0.1:8080',
  process.env.CLIENT_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values
