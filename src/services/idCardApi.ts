import api from './api';

export const generateIdCards = (ids: string) => {
  return api.post('/v1/id-cards/generate', { ids });
};
