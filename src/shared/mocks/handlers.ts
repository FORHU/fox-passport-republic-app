import { http, HttpResponse } from 'msw';

// Example handlers – adjust to your real API routes as needed
export const handlers = [
  http.get('/api/example', () => {
    return HttpResponse.json({ message: 'Mocked response' });
  }),
];

