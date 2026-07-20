import api from '@/shared/lib/axios';

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

export const acceptMatch = async (matchId: string) => {
  const response = await api.patch(`/matches/${matchId}/accept`);
  return response.data;
};

export const declineMatch = async (matchId: string, reason?: string) => {
  const response = await api.patch(`/matches/${matchId}/decline`, { reason });
  return response.data;
};
