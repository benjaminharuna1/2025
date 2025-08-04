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
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import axios from 'axios';
import './Subjects.css';

const API_URL = 'http://localhost:3000/api';

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/subjects`, { withCredentials: true });
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

  const handleSave = async () => {
    if (selectedSubject) {
      await axios.put(`${API_URL}/subjects/${selectedSubject._id}`, formData, { withCredentials: true });
    } else {
      await axios.post(`${API_URL}/subjects`, formData, { withCredentials: true });
    }
    fetchSubjects();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`${API_URL}/subjects/${id}`, { withCredentials: true });
    fetchSubjects();
  };

  const openModal = (subject: any | null = null) => {
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
    <IonPage>
      <IonHeader>
        <IonToolbar>
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
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject._id}>
                        <td data-label="Name">{subject.name}</td>
                        <td data-label="Description">{subject.description}</td>
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
                <IonLabel position="floating">Description</IonLabel>
                <IonInput name="description" value={formData.description} onIonChange={handleInputChange} />
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
  );
};

export default Subjects;
