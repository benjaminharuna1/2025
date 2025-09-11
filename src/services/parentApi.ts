import api from './api';

export const getParents = () => api.get('/parents');

export const getParentById = (id: string) => api.get(`/parents/${id}`);

export const createParent = (data: any) => api.post('/parents', data);

export const updateParent = (id: string, data: any) => api.put(`/parents/${id}`, data);

export const deleteParent = (id: string) => api.delete(`/parents/${id}`);

export const linkStudent = (id: string, studentId: string) => api.put(`/parents/${id}/link`, { studentId });

export const unlinkStudent = (id: string, studentId: string) => api.put(`/parents/${id}/unlink`, { studentId });

export const uploadParentProfilePicture = (id: string, file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return api.put(`/parents/${id}/profile-picture`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
