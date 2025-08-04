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
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import axios from 'axios';
import './Classes.css';

const API_URL = 'http://localhost:3000/api';

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [classLevels, setClassLevels] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [filterBranch, setFilterBranch] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchBranches();
    fetchClassLevels();
    fetchTeachers();
  }, [filterBranch]);

  const fetchClasses = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/classes`, {
        withCredentials: true,
        params: { branchId: filterBranch },
      });
      if (data && Array.isArray(data.classes)) {
        setClasses(data.classes);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/branches`, { withCredentials: true });
      if (data && Array.isArray(data.branches)) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchClassLevels = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/classlevels`, { withCredentials: true });
      if (Array.isArray(data)) {
        setClassLevels(data);
      }
    } catch (error) {
      console.error('Error fetching class levels:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users`, {
        withCredentials: true,
        params: { role: 'Teacher' },
      });
      if (data && Array.isArray(data.users)) {
        setTeachers(data.users);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleSave = async () => {
    if (selectedClass) {
      await axios.put(`${API_URL}/classes/${selectedClass._id}`, formData, { withCredentials: true });
    } else {
      await axios.post(`${API_URL}/classes`, formData, { withCredentials: true });
    }
    fetchClasses();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`${API_URL}/classes/${id}`, { withCredentials: true });
    fetchClasses();
  };

  const openModal = (klass: any | null = null) => {
    setSelectedClass(klass);
    setFormData(klass ? { ...klass } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
    setFormData({});
  };

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.detail.value });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Classes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton onClick={() => openModal()}>
                <IonIcon slot="start" icon={add} />
                Add Class
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonLabel>Filter by Branch</IonLabel>
                <IonSelect value={filterBranch} onIonChange={(e) => setFilterBranch(e.detail.value)}>
                  <IonSelectOption value="">All</IonSelectOption>
                  {branches.map((branch) => (
                    <IonSelectOption key={branch._id} value={branch._id}>
                      {branch.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <div className="ion-padding">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Class Level</th>
                      <th>Teacher</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((klass) => (
                      <tr key={klass._id}>
                        <td data-label="Name">{klass.name}</td>
                        <td data-label="Class Level">{klass.classLevel?.name}</td>
                        <td data-label="Teacher">{klass.teacher?.name}</td>
                        <td data-label="Actions">
                          <IonButton onClick={() => openModal(klass)}>
                            <IonIcon slot="icon-only" icon={create} />
                          </IonButton>
                          <IonButton color="danger" onClick={() => handleDelete(klass._id)}>
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
              <IonCardTitle>{selectedClass ? 'Edit' : 'Add'} Class</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="floating">Name</IonLabel>
                <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel>Branch</IonLabel>
                <IonSelect name="branchId" value={formData.branchId} onIonChange={handleInputChange}>
                  {branches.map((branch) => (
                    <IonSelectOption key={branch._id} value={branch._id}>
                      {branch.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Class Level</IonLabel>
                <IonSelect name="classLevel" value={formData.classLevel} onIonChange={handleInputChange}>
                  {classLevels.map((level) => (
                    <IonSelectOption key={level._id} value={level._id}>
                      {level.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Teacher</IonLabel>
                <IonSelect name="teacher" value={formData.teacher} onIonChange={handleInputChange}>
                  {teachers.map((teacher) => (
                    <IonSelectOption key={teacher._id} value={teacher._id}>
                      {teacher.name}
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
  );
};

export default Classes;
