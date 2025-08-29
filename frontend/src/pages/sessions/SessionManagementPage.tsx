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
  IonLoading,
  IonButtons,
  IonMenuButton,
  IonToggle,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToast,
} from '@ionic/react';
import { add, create } from 'ionicons/icons';
import { getSessions, createSession, updateSession } from '../../services/sessionsApi';
import { Session } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import { TERMS } from '../../constants';

const SessionManagementPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState<Partial<Session>>({});
  const [showToast, setShowToast] = useState<{ show: boolean; message: string; color: string }>({ show: false, message: '', color: '' });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setShowToast({ show: true, message: 'Could not fetch sessions.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (session: Session | null = null) => {
    setSelectedSession(session);
    if (session) {
      setFormData({ ...session });
    } else {
      setFormData({ academicYear: '', term: 'First', isResultEntryOpen: false, resultPublicationStatus: 'Not Ready' });
    }
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

  const handleToggleChange = (e: any) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSave = async () => {
    if (!formData.academicYear || !formData.term) {
      setShowToast({ show: true, message: 'Academic Year and Term are required.', color: 'warning' });
      return;
    }

    setLoading(true);
    try {
      if (selectedSession) {
        await updateSession(selectedSession._id, formData);
        setShowToast({ show: true, message: 'Session updated successfully.', color: 'success' });
      } else {
        await createSession({ academicYear: formData.academicYear, term: formData.term as any });
        setShowToast({ show: true, message: 'Session created successfully.', color: 'success' });
      }
      fetchSessions();
      closeModal();
    } catch (err: any) {
      console.error("Save failed:", err.response?.data || err.message);
      setShowToast({ show: true, message: err.response?.data?.message || 'Failed to save session.', color: 'danger' });
    } finally {
      setLoading(false);
    }
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
          <IonLoading isOpen={loading} message={'Loading sessions...'} />
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton onClick={() => openModal()}>
                  <IonIcon slot="start" icon={add} />
                  Create Session
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
                        <th>Result Entry Open</th>
                        <th>Publication Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr key={session._id}>
                          <td>{session.academicYear}</td>
                          <td>{session.term}</td>
                          <td>
                            <IonToggle
                              checked={session.isResultEntryOpen}
                              disabled={true}
                            />
                          </td>
                          <td>{session.resultPublicationStatus}</td>
                          <td>
                            <IonButton size="small" onClick={() => openModal(session)}>
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
                <IonCardTitle>{selectedSession ? 'Edit' : 'Create'} Session</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="floating">Academic Year (e.g., 2024/2025)</IonLabel>
                  <IonInput
                    name="academicYear"
                    value={formData.academicYear}
                    onIonChange={handleInputChange}
                    disabled={!!selectedSession}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel>Term</IonLabel>
                  <IonSelect
                    name="term"
                    value={formData.term}
                    onIonChange={handleInputChange}
                    disabled={!!selectedSession}
                  >
                    {TERMS.map(term => <IonSelectOption key={term} value={term}>{term}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>

                {selectedSession && (
                  <>
                    <IonItem>
                      <IonLabel>Result Entry Open</IonLabel>
                      <IonToggle
                        name="isResultEntryOpen"
                        checked={formData.isResultEntryOpen}
                        onIonChange={handleToggleChange}
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel>Publication Status</IonLabel>
                      <IonSelect
                        name="resultPublicationStatus"
                        value={formData.resultPublicationStatus}
                        onIonChange={handleInputChange}
                      >
                        <IonSelectOption value="Not Ready">Not Ready</IonSelectOption>
                        <IonSelectOption value="Published">Published</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </>
                )}

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
            isOpen={showToast.show}
            onDidDismiss={() => setShowToast({ show: false, message: '', color: '' })}
            message={showToast.message}
            duration={3000}
            color={showToast.color}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default SessionManagementPage;
