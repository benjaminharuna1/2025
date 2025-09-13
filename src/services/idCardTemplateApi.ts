import api from './api';

export const getIdCardTemplate = (branchId: string) => api.get(`/v1/id-card-templates/${branchId}`);

export const updateIdCardTemplate = (branchId: string, data: FormData) => {
  return api.put(`/v1/id-card-templates/${branchId}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
