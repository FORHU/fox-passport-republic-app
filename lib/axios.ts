// src/lib/axios.ts
import axios from 'axios';
import { config } from '@/src/config';

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;