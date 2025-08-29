import api from './api';
import { Session } from '../types';

export const getSessions = async (): Promise<Session[]> => {
  try {
    const response = await api.get('/sessions');
    // The backend might return { sessions: [] } or just []
    return response.data.sessions || response.data || [];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return []; // Return an empty array on error
  }
};

export const createSession = (data: {
  academicYear: string;
  term: string;
  branchId?: string | null;
}) => {
  return api.post('/sessions', data);
};

export const updateSession = (id: string, data: Partial<Session>) => {
  return api.put(`/sessions/${id}`, data);
};
