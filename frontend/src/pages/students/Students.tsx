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

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
    show: false,
    message: '',
    color: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        axios.get(`${API_URL}/students`, { withCredentials: true }),
        axios.get(`${API_URL}/classes`, { withCredentials: true }),
      ]);
      setStudents(studentsRes.data.students || []);
      setClasses(classesRes.data.classes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ show: true, message: 'Failed to fetch students or classes.', color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = async (studentProfile: any) => {
    try {
      setIsLoading(true);
      // The student profile from the list should be complete enough for editing
      setSelectedStudent(studentProfile);
      setFormData({
        name: studentProfile.userId.name,
        email: studentProfile.userId.email,
        classId: studentProfile.classId._id, // The classId object is populated
        admissionNumber: studentProfile.admissionNumber,
        dateOfBirth: studentProfile.dateOfBirth?.split('T')[0],
      });
      setShowModal(true);
    } catch (error) {
      setToast({ show: true, message: 'Failed to fetch student details.', color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selectedStudent) return;

    try {
      setIsLoading(true);
      // 1. Update core user info
      const userPayload = { name: formData.name, email: formData.email };
      await axios.put(`${API_URL}/users/${selectedStudent.userId._id}`, userPayload, { withCredentials: true });

      // 2. Update student profile info
      const profilePayload = {
        classId: formData.classId,
        admissionNumber: formData.admissionNumber,
        dateOfBirth: formData.dateOfBirth,
      };
      await axios.put(`${API_URL}/students/${selectedStudent._id}`, profilePayload, { withCredentials: true });

      setToast({ show: true, message: 'Student updated successfully!', color: 'success' });
      closeModal();
      fetchData(); // Refresh list
    } catch (error: any) {
      setToast({ show: true, message: error.response?.data?.message || 'Failed to update student.', color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This action is irreversible.')) {
        try {
            setIsLoading(true);
            await axios.delete(`${API_URL}/users/${userId}`, { withCredentials: true });
            setToast({ show: true, message: 'Student deleted successfully.', color: 'medium' });
            fetchData();
        } catch (error: any) {
            setToast({ show: true, message: error.response?.data?.message || 'Failed to delete student.', color: 'danger' });
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manage Students</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isLoading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : (
          <IonList>
            {students.map(student => (
              <IonItem key={student._id}>
                <IonLabel>
                  <h2>{student.userId.name}</h2>
                  <p>{student.userId.email}</p>
                </IonLabel>
                <IonButton slot="end" onClick={() => openModal(student)}>Edit</IonButton>
                <IonButton slot="end" color="danger" onClick={() => handleDelete(student.userId._id)}>Delete</IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Student</IonTitle>
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
                <IonLabel>Class</IonLabel>
                <IonSelect name="classId" value={formData.classId} onIonChange={(e) => handleSelectChange('classId', e.detail.value)}>
                  {classes.map(c => (
                    <IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Admission Number</IonLabel>
                <IonInput name="admissionNumber" value={formData.admissionNumber} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Date of Birth</IonLabel>
                <IonInput name="dateOfBirth" type="date" value={formData.dateOfBirth} onIonChange={handleInputChange} />
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
      </IonContent>
    </IonPage>
  );
};

export default StudentsPage;
