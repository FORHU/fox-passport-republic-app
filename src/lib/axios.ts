// src/lib/axios.ts
import axios from 'axios';
import { config } from '@/src/config'; // Import from your config file

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, // Necessary for passing cookies (sessions)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;