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
  IonTextarea,
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
  IonToast,
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import api from '../../services/api';
import { Announcement, Branch } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchAnnouncements();
    fetchBranches();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches');
      setBranches(data.branches || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedAnnouncement) {
        await api.put(`/announcements/${selectedAnnouncement._id}`, formData);
      } else {
        await api.post('/announcements', formData);
      }
      fetchAnnouncements();
      closeModal();
    } catch (error) {
      console.error('Error saving announcement:', error);
      setToastMessage('Failed to save announcement.');
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setToastMessage('Failed to delete announcement.');
      setShowToast(true);
    }
  };

  const openModal = (announcement: Announcement | null = null) => {
    setSelectedAnnouncement(announcement);
    setFormData(announcement ? { ...announcement } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnnouncement(null);
    setFormData({});
  };

  const handleInputChange = (e: any) => {
    const { name } = e.target;
    const value = e.detail.value;
    setFormData({ ...formData, [name]: value });
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
            <IonTitle>Announcements</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
            <IonCol>
              <IonButton onClick={() => openModal()}>
                <IonIcon slot="start" icon={add} />
                Add Announcement
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <div className="ion-padding">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Branch</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((announcement) => (
                      <tr key={announcement._id}>
                        <td>{announcement.title}</td>
                        <td>{typeof announcement.branchId === 'object' && announcement.branchId.name}</td>
                        <td>
                          <IonButton onClick={() => openModal(announcement)}>
                            <IonIcon slot="icon-only" icon={create} />
                          </IonButton>
                          <IonButton color="danger" onClick={() => handleDelete(announcement._id)}>
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
              <IonCardTitle>{selectedAnnouncement ? 'Edit' : 'Add'} Announcement</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="floating">Title</IonLabel>
                <IonInput name="title" value={formData.title} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Content</IonLabel>
                <IonTextarea name="content" value={formData.content} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel>Branch (optional)</IonLabel>
                <IonSelect name="branchId" value={formData.branchId} onIonChange={handleInputChange}>
                  <IonSelectOption value="">All Branches</IonSelectOption>
                  {branches.map((branch) => (
                    <IonSelectOption key={branch._id} value={branch._id}>
                      {branch.name}
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

export default Announcements;
