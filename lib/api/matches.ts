import api from '@/lib/axios';

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
