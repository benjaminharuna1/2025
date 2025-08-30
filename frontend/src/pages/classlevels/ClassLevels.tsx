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
  IonButtons,
  IonMenuButton,
  IonToast,
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import api from '../../services/api';
import { ClassLevel } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './ClassLevels.css';

const ClassLevels: React.FC = () => {
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClassLevel, setSelectedClassLevel] = useState<ClassLevel | null>(null);
  const [formData, setFormData] = useState<Partial<ClassLevel>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchClassLevels();
  }, []);

  const fetchClassLevels = async () => {
    try {
      const { data } = await api.get('/classlevels');
      if (Array.isArray(data)) {
        setClassLevels(data);
      } else {
        setClassLevels([]);
      }
    } catch (error) {
      console.error('Error fetching class levels:', error);
      setClassLevels([]);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedClassLevel) {
        await api.put(`/classlevels/${selectedClassLevel._id}`, formData);
      } else {
        await api.post('/classlevels', formData);
      }
      fetchClassLevels();
      setToastMessage('Class level saved successfully.');
      setShowToast(true);
      closeModal();
    } catch (error) {
      console.error('Error saving class level:', error);
      const errorMsg = (error as any).response?.data?.message || 'Failed to save class level.';
      setToastMessage(errorMsg);
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class level?')) {
      try {
        await api.delete(`/classlevels/${id}`);
        fetchClassLevels();
        setToastMessage('Class level deleted successfully.');
        setShowToast(true);
      } catch (error) {
        console.error('Error deleting class level:', error);
        const errorMsg = (error as any).response?.data?.message || 'Failed to delete class level.';
        setToastMessage(errorMsg);
        setShowToast(true);
      }
    }
  };

  const openModal = (classLevel: ClassLevel | null = null) => {
    setSelectedClassLevel(classLevel);
    setFormData(classLevel ? { ...classLevel } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClassLevel(null);
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
            <IonTitle>Class Levels</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
            <IonCol>
              <IonButton onClick={() => openModal()}>
                <IonIcon slot="start" icon={add} />
                Add Class Level
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
                      <th>Level</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classLevels.map((classLevel) => (
                      <tr key={classLevel._id}>
                        <td data-label="Name">{classLevel.name}</td>
                        <td data-label="Level">{classLevel.level}</td>
                        <td data-label="Description">{classLevel.description}</td>
                        <td data-label="Actions">
                          <IonButton onClick={() => openModal(classLevel)}>
                            <IonIcon slot="icon-only" icon={create} />
                          </IonButton>
                          <IonButton color="danger" onClick={() => handleDelete(classLevel._id)}>
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
              <IonCardTitle>{selectedClassLevel ? 'Edit' : 'Add'} Class Level</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="floating">Name</IonLabel>
                <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Level</IonLabel>
                <IonInput name="level" type="number" value={formData.level} onIonChange={handleInputChange} />
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
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
    </>
  );
};

export default ClassLevels;
