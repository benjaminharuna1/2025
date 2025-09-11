import api from './api';

export const getAdmins = () => api.get('/admins');

export const getAdminById = (id: string) => api.get(`/admins/${id}`);

export const createAdmin = (data: any) => api.post('/admins', data);

export const updateAdmin = (id: string, data: any) => api.put(`/admins/${id}`, data);

export const deleteAdmin = (id: string) => api.delete(`/admins/${id}`);

export const uploadAdminProfilePicture = (id: string, file: File) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  return api.put(`/admins/${id}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
