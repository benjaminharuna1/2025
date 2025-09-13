import api from './api';

export const getTeachers = (params: any) => api.get('/teachers', { params });

export const getTeacherById = (id: string) => api.get(`/teachers/${id}`);

export const createTeacher = (data: any) => api.post('/teachers', data);

export const updateTeacher = (id: string, data: any) => api.put(`/teachers/${id}`, data);

export const deleteTeacher = (id: string) => api.delete(`/teachers/${id}`);

export const uploadTeacherProfilePicture = (id: string, file: File) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  return api.put(`/teachers/${id}/profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
