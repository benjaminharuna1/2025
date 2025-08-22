import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonMenuButton,
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import api from '../../services/api';
import { Subject, Class, User as Teacher } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './Subjects.css';

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<Partial<Subject>>({});

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      if (data && Array.isArray(data.subjects)) {
        setSubjects(data.subjects);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/users?role=Teacher');
      setTeachers(data.users || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleSave = async () => {
    if (selectedSubject) {
      await api.put(`/subjects/${selectedSubject._id}`, formData);
    } else {
      await api.post('/subjects', formData);
    }
    fetchSubjects();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/subjects/${id}`);
    fetchSubjects();
  };

  const openModal = (subject: Subject | null = null) => {
    setSelectedSubject(subject);
    setFormData(subject ? { ...subject } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
    setFormData({});
  };

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.detail.value });
  };

  return (
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Subjects</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton onClick={() => openModal()}>
                  <IonIcon slot="start" icon={add} />
                  Add Subject
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <div className="ion-padding">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Teacher</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject) => (
                        <tr key={subject._id}>
                          <td data-label="Name">{subject.name}</td>
                          <td data-label="Class">{typeof subject.classId === 'object' && subject.classId.name}</td>
                          <td data-label="Teacher">{typeof subject.teacherId === 'object' && subject.teacherId.name}</td>
                          <td data-label="Actions">
                            <IonButton onClick={() => openModal(subject)}>
                              <IonIcon slot="icon-only" icon={create} />
                            </IonButton>
                            <IonButton color="danger" onClick={() => handleDelete(subject._id)}>
                              <IonIcon slot="icon-only" icon={trash} />
                            </IonButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>{selectedSubject ? 'Edit' : 'Add'} Subject</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="floating">Name</IonLabel>
                  <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel>Class</IonLabel>
                  <IonSelect name="classId" value={formData.classId} onIonChange={handleInputChange}>
                    {classes.map((c) => (
                      <IonSelectOption key={c._id} value={c._id}>
                        {c.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel>Teacher</IonLabel>
                  <IonSelect name="teacherId" value={formData.teacherId} onIonChange={handleInputChange}>
                    {teachers.map((t) => (
                      <IonSelectOption key={t._id} value={t._id}>
                        {t.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonButton expand="full" onClick={handleSave} className="ion-margin-top">
                  Save
                </IonButton>
                <IonButton expand="full" color="light" onClick={closeModal}>
                  Cancel
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Subjects;
