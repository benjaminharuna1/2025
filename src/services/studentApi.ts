import api from './api';

export const getStudents = (params: any) => api.get('/students', { params });

export const getStudentById = (id: string) => api.get(`/students/${id}`);

export const createStudent = (data: any) => api.post('/students', data);

export const updateStudent = (id: string, data: any) => api.put(`/students/${id}`, data);

export const deleteStudent = (id: string) => api.delete(`/students/${id}`);
