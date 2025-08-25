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
  IonDatetime,
  IonDatetimeButton,
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Announcement, Branch, Class, User } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './Announcements.css';

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchAnnouncements();
    fetchBranches();
    fetchClasses();
    fetchUsers();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      // The new endpoint returns the array directly
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setToastMessage('Failed to fetch announcements.');
      setShowToast(true);
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

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSave = async () => {
    const data = new FormData();
    // Append all form data fields
    Object.keys(formData).forEach(key => {
      if (key === 'attachments' && formData.attachments) {
        formData.attachments.forEach(file => {
          data.append('attachments', file);
        });
      } else if (formData[key as keyof Announcement]) {
        data.append(key, formData[key as keyof Announcement] as string);
      }
    });

    try {
      if (selectedAnnouncement) {
        // Note: FormData with PUT requires a POST override or specific backend handling.
        // Assuming backend handles FormData on PUT, or we can use a POST request with a method override.
        // For simplicity, we'll use a POST-like approach for the update.
        await api.put(`/announcements/${selectedAnnouncement._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/announcements', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
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

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/announcements/${id}/read`);
      // Optimistically update the UI
      setAnnouncements(prev =>
        prev.map(ann => ann._id === id ? { ...ann, isRead: true } : ann)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      setToastMessage('Failed to mark as read.');
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

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, attachments: Array.from(e.target.files) as any[] }));
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
                      <th>Type</th>
                      <th>Audience</th>
                      <th>Published</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((announcement) => (
                      <tr key={announcement._id} className={!announcement.isRead ? 'unread-row' : ''}>
                        <td>{announcement.title}</td>
                        <td>{announcement.type}</td>
                        <td>
                          {announcement.classId ? (typeof announcement.classId === 'object' && announcement.classId.name)
                            : announcement.branchId ? (typeof announcement.branchId === 'object' && announcement.branchId.name)
                            : 'Global'}
                        </td>
                        <td>{new Date(announcement.publishDate || Date.now()).toLocaleDateString()}</td>
                        <td>
                          {!announcement.isRead && (
                            <IonButton size="small" onClick={() => markAsRead(announcement._id)}>
                              Mark as Read
                            </IonButton>
                          )}
                          <IonButton size="small" onClick={() => openModal(announcement)}>
                            <IonIcon slot="icon-only" icon={create} />
                          </IonButton>
                          {(user?.role === 'Super Admin' || (typeof announcement.createdBy === 'object' && announcement.createdBy?._id === user?._id)) && (
                            <IonButton size="small" color="danger" onClick={() => handleDelete(announcement._id)}>
                              <IonIcon slot="icon-only" icon={trash} />
                            </IonButton>
                          )}
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
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedAnnouncement ? 'Edit' : 'Add'} Announcement</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeModal}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="floating">Title</IonLabel>
              <IonInput name="title" value={formData.title} onIonChange={e => handleInputChange('title', e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Content</IonLabel>
              <IonTextarea name="content" value={formData.content} onIonChange={e => handleInputChange('content', e.detail.value!)} autoGrow={true} />
            </IonItem>
            <IonItem>
              <IonLabel>Type</IonLabel>
              <IonSelect name="type" value={formData.type} onIonChange={e => handleInputChange('type', e.detail.value)}>
                <IonSelectOption value="General">General</IonSelectOption>
                <IonSelectOption value="Event">Event</IonSelectOption>
                <IonSelectOption value="Urgent">Urgent</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Audience Role</IonLabel>
              <IonSelect name="audienceRole" value={formData.audienceRole} onIonChange={e => handleInputChange('audienceRole', e.detail.value)}>
                <IonSelectOption value="All">All</IonSelectOption>
                <IonSelectOption value="Teachers">Teachers</IonSelectOption>
                <IonSelectOption value="Students">Students</IonSelectOption>
                <IonSelectOption value="Parents">Parents</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Branch (optional)</IonLabel>
              <IonSelect name="branchId" value={formData.branchId} onIonChange={e => handleInputChange('branchId', e.detail.value)}>
                <IonSelectOption value="">All Branches</IonSelectOption>
                {branches.map((branch) => (
                  <IonSelectOption key={branch._id} value={branch._id}>{branch.name}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Class (optional)</IonLabel>
              <IonSelect name="classId" value={formData.classId} onIonChange={e => handleInputChange('classId', e.detail.value)}>
                <IonSelectOption value="">All Classes</IonSelectOption>
                {classes.map((c) => (
                  <IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Specific Recipients (optional)</IonLabel>
              <IonSelect name="recipients" value={formData.recipients} multiple={true} onIonChange={e => handleInputChange('recipients', e.detail.value)}>
                {users.map((user) => (
                  <IonSelectOption key={user._id} value={user._id}>{user.name}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Publish Date</IonLabel>
              <IonDatetimeButton datetime="publishDate"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  id="publishDate"
                  name="publishDate"
                  value={formData.publishDate}
                  onIonChange={e => handleInputChange('publishDate', e.detail.value!)}
                ></IonDatetime>
              </IonModal>
            </IonItem>
            <IonItem>
              <IonLabel>Expiry Date (optional)</IonLabel>
              <IonDatetimeButton datetime="expiryDate"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onIonChange={e => handleInputChange('expiryDate', e.detail.value!)}
                ></IonDatetime>
              </IonModal>
            </IonItem>
            <IonItem>
              <IonLabel>Attachments</IonLabel>
              <input type="file" multiple onChange={handleFileChange} />
            </IonItem>
            <IonButton expand="full" onClick={handleSave} className="ion-margin-top">
              Save Announcement
            </IonButton>
          </IonContent>
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
