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

const ParentsPage: React.FC = () => {
  const [parents, setParents] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [linkStudentId, setLinkStudentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
    show: false,
    message: '',
    color: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [parentsRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/parents`, { withCredentials: true }),
        axios.get(`${API_URL}/students`, { withCredentials: true }),
      ]);
      setParents(parentsRes.data.parents || []);
      setAllStudents(studentsRes.data.students || []);
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

  const openModal = (parentProfile: any = null) => {
    if (parentProfile) {
      // Editing
      setSelectedParent(parentProfile);
      setFormData({
        name: parentProfile.userId.name,
        email: parentProfile.userId.email,
        gender: parentProfile.gender || '',
        phoneNumber: parentProfile.phoneNumber || '',
      });
    } else {
      // Adding
      setSelectedParent(null);
      setFormData({
        name: '', email: '', password: '', role: 'Parent',
        gender: '', phoneNumber: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedParent(null);
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
    try {
      setIsLoading(true);
      if (selectedParent) {
        // Update
        const userPayload = { name: formData.name, email: formData.email };
        await axios.put(`${API_URL}/users/${selectedParent.userId._id}`, userPayload, { withCredentials: true });

        const profilePayload = { gender: formData.gender, phoneNumber: formData.phoneNumber };
        await axios.put(`${API_URL}/parents/${selectedParent._id}`, profilePayload, { withCredentials: true });

        setToast({ show: true, message: 'Parent updated successfully!', color: 'success' });
      } else {
        // Create
        if (!formData.password) {
            setIsLoading(false);
            return setToast({ show: true, message: "Password is required.", color: "warning" });
        }
        const payload = { ...formData, role: 'Parent' };
        await axios.post(`${API_URL}/users`, payload, { withCredentials: true });
        setToast({ show: true, message: 'Parent created successfully!', color: 'success' });
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      setToast({ show: true, message: error.response?.data?.message || 'Failed to save parent.', color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this parent?')) {
      try {
        setIsLoading(true);
        await axios.delete(`${API_URL}/users/${userId}`, { withCredentials: true });
        setToast({ show: true, message: 'Parent deleted successfully.', color: 'medium' });
        fetchData();
      } catch (error: any) {
        setToast({ show: true, message: error.response?.data?.message || 'Failed to delete parent.', color: 'danger' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLinkStudent = async () => {
    if (!linkStudentId || !selectedParent?._id) return;
    try {
        await axios.put(`${API_URL}/parents/${selectedParent._id}/link`, { studentId: linkStudentId }, { withCredentials: true });
        setToast({ show: true, message: 'Student linked successfully!', color: 'success' });
        fetchData();
        closeModal(); // Re-open or just close? For now, close.
    } catch (error: any) {
        setToast({ show: true, message: error.response?.data?.message || 'Failed to link student.', color: 'danger' });
    }
  };

  const handleUnlinkStudent = async (studentId: string) => {
    if (!selectedParent?._id) return;
    try {
        await axios.put(`${API_URL}/parents/${selectedParent._id}/unlink`, { studentId }, { withCredentials: true });
        setToast({ show: true, message: 'Student unlinked successfully!', color: 'success' });
        fetchData();
        closeModal(); // Re-open or just close? For now, close.
    } catch (error: any) {
        setToast({ show: true, message: error.response?.data?.message || 'Failed to unlink student.', color: 'danger' });
    }
  };

  return (
    <>
      <IonButton expand="block" onClick={() => openModal()}>
        Add Parent
      </IonButton>

      {isLoading ? (
        <div className="ion-text-center ion-padding">
            <IonSpinner />
        </div>
      ) : (
        <IonList>
          {parents.map(parent => (
            <IonItem key={parent._id}>
              <IonLabel>
                <h2>{parent.userId.name}</h2>
                <p>{parent.userId.email}</p>
              </IonLabel>
              <IonButton slot="end" onClick={() => openModal(parent)}>Edit</IonButton>
              <IonButton slot="end" color="danger" onClick={() => handleDelete(parent.userId._id)}>Delete</IonButton>
            </IonItem>
          ))}
        </IonList>
      )}

      <IonModal isOpen={showModal} onDidDismiss={closeModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{selectedParent ? 'Edit' : 'Add'} Parent</IonTitle>
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
              <IonInput name="email" type="email" value={formData.email} onIonChange={handleInputChange} />
            </IonItem>
            {!selectedParent && (
              <IonItem>
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput name="password" type="password" value={formData.password} onIonChange={handleInputChange} />
              </IonItem>
            )}
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
          </IonList>

          {selectedParent && (
            <>
              <IonItem>
                <IonLabel>
                  <h3>Linked Students</h3>
                </IonLabel>
              </IonItem>
              <IonList>
                {selectedParent.students.map((student: any) => (
                    <IonItem key={student._id}>
                        <IonLabel>{student.userId.name}</IonLabel>
                        <IonButton color="danger" onClick={() => handleUnlinkStudent(student._id)}>Unlink</IonButton>
                    </IonItem>
                ))}
              </IonList>
              <IonItem>
                  <IonLabel>Link New Student</IonLabel>
                  <IonSelect value={linkStudentId} onIonChange={e => setLinkStudentId(e.detail.value)}>
                      {allStudents.map(student => (
                          <IonSelectOption key={student._id} value={student._id}>{student.userId.name}</IonSelectOption>
                      ))}
                  </IonSelect>
                  <IonButton onClick={handleLinkStudent} disabled={!linkStudentId}>Link</IonButton>
              </IonItem>
            </>
          )}

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

export default ParentsPage;
