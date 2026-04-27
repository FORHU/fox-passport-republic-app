import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
});

// Add interceptor to include token if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const createMatch = async (data: {
  foxerId: string | number;
  style: string;
  date: string;
  guestCount: number;
  requestContent: string;
  totalAmount: number;
}) => {
  const response = await api.post('/matches', data);
  return response.data;
};

export const getMyMatches = async () => {
  const response = await api.get('/matches/my');
  return response.data;
};
