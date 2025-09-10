import api from './api';

export const getTeachers = (params: any) => api.get('/teachers', { params });

export const getTeacherById = (id: string) => api.get(`/teachers/${id}`);

export const createTeacher = (data: any) => api.post('/teachers', data);

export const updateTeacher = (id: string, data: any) => api.put(`/teachers/${id}`, data);

export const deleteTeacher = (id: string) => api.delete(`/teachers/${id}`);
