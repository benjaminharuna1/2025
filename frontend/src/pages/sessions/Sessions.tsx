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
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonDatetime,
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import api from '../../services/api';
import { Session } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import { getSessions } from '../../services/sessionsApi';

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState<Partial<Session>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedSession) {
        await api.put(`/sessions/${selectedSession._id}`, formData);
      } else {
        await api.post('/sessions', formData);
      }
      fetchSessions();
      closeModal();
      setToastMessage('Session saved successfully.');
      setShowToast(true);
    } catch (error) {
      const errorMsg = (error as any).response?.data?.message || 'Failed to save session.';
      setToastMessage(errorMsg);
      setShowToast(true);
      console.error('Error saving session:', error);
    }
  };

  const handleStatusChange = async (session: Session, field: keyof Session, value: any) => {
    try {
      await api.put(`/sessions/${session._id}`, { [field]: value });
      fetchSessions();
      setToastMessage('Session status updated.');
      setShowToast(true);
    } catch (error) {
      const errorMsg = (error as any).response?.data?.message || 'Failed to update session status.';
      setToastMessage(errorMsg);
      setShowToast(true);
      console.error('Error updating session status:', error);
    }
  };

  const openModal = (session: Session | null = null) => {
    setSelectedSession(session);
    setFormData(session ? { ...session } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSession(null);
    setFormData({});
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
            <IonTitle>Session Management</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton onClick={() => openModal()}>
                  <IonIcon slot="start" icon={add} />
                  Add New Session
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <div className="ion-padding">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Academic Year</th>
                        <th>Term</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Result Entry</th>
                        <th>Result Publication</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr key={session._id}>
                          <td data-label="Academic Year">{session.academicYear}</td>
                          <td data-label="Term">{session.term}</td>
                          <td data-label="Start Date">{formatDate(session.termStartDate)}</td>
                          <td data-label="End Date">{formatDate(session.termEndDate)}</td>
                          <td data-label="Result Entry">
                            <IonToggle
                              checked={session.isResultEntryOpen}
                              onIonChange={e => handleStatusChange(session, 'isResultEntryOpen', e.detail.checked)}
                            />
                          </td>
                          <td data-label="Result Publication">
                            <IonSelect
                              value={session.resultPublicationStatus}
                              onIonChange={e => handleStatusChange(session, 'resultPublicationStatus', e.detail.value)}
                            >
                              <IonSelectOption value="Not Ready">Not Ready</IonSelectOption>
                              <IonSelectOption value="Published">Published</IonSelectOption>
                            </IonSelect>
                          </td>
                          <td data-label="Actions">
                            <IonButton onClick={() => openModal(session)}>
                              <IonIcon slot="icon-only" icon={create} />
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
                <IonCardTitle>{selectedSession ? 'Edit' : 'Add'} Session</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="floating">Academic Year (e.g., 2024/2025)</IonLabel>
                  <IonInput name="academicYear" value={formData.academicYear} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel>Term</IonLabel>
                  <IonSelect name="term" value={formData.term} onIonChange={handleInputChange}>
                    <IonSelectOption value="First Term">First Term</IonSelectOption>
                    <IonSelectOption value="Second Term">Second Term</IonSelectOption>
                    <IonSelectOption value="Third Term">Third Term</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel>Term Start Date</IonLabel>
                  <IonInput type="date" name="termStartDate" value={formData.termStartDate} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel>Term End Date</IonLabel>
                  <IonInput type="date" name="termEndDate" value={formData.termEndDate} onIonChange={handleInputChange} />
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

export default Sessions;
