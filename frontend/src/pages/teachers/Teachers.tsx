import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonToast,
  IonButton,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
    show: false,
    message: '',
    color: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [teachersRes, classesRes, subjectsRes] = await Promise.all([
        axios.get(`${API_URL}/teachers`, { withCredentials: true }),
        axios.get(`${API_URL}/classes`, { withCredentials: true }),
        axios.get(`${API_URL}/subjects`, { withCredentials: true }),
      ]);
      setTeachers(teachersRes.data.teachers || []);
      setClasses(classesRes.data.classes || []);
      setSubjects(subjectsRes.data.subjects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ show: true, message: 'Failed to fetch data.', color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = async (teacherProfile: any) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/teachers/${teacherProfile._id}`, { withCredentials: true });
      const fullProfile = res.data;
      setSelectedTeacher(fullProfile);

      setFormData({
        name: fullProfile.userId.name,
        email: fullProfile.userId.email,
        gender: fullProfile.gender || '',
        phoneNumber: fullProfile.phoneNumber || '',
        classes: fullProfile.classes?.map((c: any) => c._id) || [],
        subjects: fullProfile.subjects?.map((s: any) => s._id) || [],
      });
      setShowModal(true);
    } catch (error) {
      setToast({ show: true, message: 'Failed to fetch teacher details.', color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeacher(null);
  };

  const handleInputChange = (e: any) => {
    const name = e.target.name;
    const value = e.detail?.value ?? e.target.value;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;

    try {
      setIsLoading(true);
      // 1. Update core user info
      const userPayload = { name: formData.name, email: formData.email };
      await axios.put(`${API_URL}/users/${selectedTeacher.userId._id}`, userPayload, { withCredentials: true });

      // 2. Update teacher profile info
      const profilePayload = {
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        classes: formData.classes,
        subjects: formData.subjects,
      };
      await axios.put(`${API_URL}/teachers/${selectedTeacher._id}`, profilePayload, { withCredentials: true });

      setToast({ show: true, message: 'Teacher updated successfully!', color: 'success' });
      closeModal();
      fetchData();
    } catch (error: any) {
      setToast({ show: true, message: error.response?.data?.message || 'Failed to update teacher.', color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this teacher? This action is irreversible.')) {
        try {
            setIsLoading(true);
            await axios.delete(`${API_URL}/users/${userId}`, { withCredentials: true });
            setToast({ show: true, message: 'Teacher deleted successfully.', color: 'medium' });
            fetchData();
        } catch (error: any) {
            setToast({ show: true, message: error.response?.data?.message || 'Failed to delete teacher.', color: 'danger' });
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : (
          <IonList>
            {teachers.map(teacher => (
              <IonItem key={teacher._id}>
                <IonLabel>
                  <h2>{teacher.userId.name}</h2>
                  <p>{teacher.userId.email}</p>
                </IonLabel>
                <IonButton slot="end" onClick={() => openModal(teacher)}>Edit</IonButton>
                <IonButton slot="end" color="danger" onClick={() => handleDelete(teacher.userId._id)}>Delete</IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Teacher</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Name</IonLabel>
                <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput name="email" value={formData.email} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel>Gender</IonLabel>
                <IonSelect name="gender" value={formData.gender} onIonChange={(e) => handleSelectChange('gender', e.detail.value)}>
                  <IonSelectOption value="Male">Male</IonSelectOption>
                  <IonSelectOption value="Female">Female</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Phone Number</IonLabel>
                <IonInput name="phoneNumber" type="tel" value={formData.phoneNumber} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel>Classes</IonLabel>
                <IonSelect name="classes" multiple value={formData.classes} onIonChange={(e) => handleSelectChange('classes', e.detail.value)}>
                  {classes.map(c => (
                    <IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Subjects</IonLabel>
                <IonSelect name="subjects" multiple value={formData.subjects} onIonChange={(e) => handleSelectChange('subjects', e.detail.value)}>
                  {subjects.map(s => (
                    <IonSelectOption key={s._id} value={s._id}>{s.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>
            <IonButton expand="block" onClick={handleSave}>Save Changes</IonButton>
            <IonButton expand="block" color="medium" onClick={closeModal}>Cancel</IonButton>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={toast.show}
          message={toast.message}
          color={toast.color}
          duration={3000}
          onDidDismiss={() => setToast({ show: false, message: '', color: '' })}
        />
    </>
  );
};

export default TeachersPage;
