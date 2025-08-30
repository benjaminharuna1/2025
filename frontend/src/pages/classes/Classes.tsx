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
  IonToast,
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import api from '../../services/api';
import { Class, Branch, ClassLevel, User as Teacher } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './Classes.css';

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<Partial<Class>>({});
  const [filterBranch, setFilterBranch] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchBranches();
    fetchClassLevels();
    fetchTeachers();
  }, [filterBranch]);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes', {
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
      const { data } = await api.get('/branches');
      if (data && Array.isArray(data.branches)) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchClassLevels = async () => {
    try {
      const { data } = await api.get('/classlevels');
      if (Array.isArray(data)) {
        setClassLevels(data);
      }
    } catch (error) {
      console.error('Error fetching class levels:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/users', {
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
    try {
      if (selectedClass) {
        await api.put(`/classes/${selectedClass._id}`, formData);
      } else {
        await api.post('/classes', formData);
      }
      fetchClasses();
      closeModal();
    } catch (error) {
      console.error('Error saving class:', error);
      setToastMessage('Failed to save class.');
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/classes/${id}`);
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      setToastMessage('Failed to delete class.');
      setShowToast(true);
    }
  };

  const openModal = (klass: Class | null = null) => {
    setSelectedClass(klass);
    if (klass) {
      setFormData({
        ...klass,
        classLevel: typeof klass.classLevel === 'object' ? klass.classLevel._id : klass.classLevel,
        teacher: typeof klass.teacher === 'object' ? klass.teacher._id : klass.teacher,
      });
    } else {
      setFormData({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
    setFormData({});
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (fieldName: keyof Class, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
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
                        <td data-label="Class Level">{typeof klass.classLevel === 'object' ? klass.classLevel.name : 'N/A'}</td>
                        <td data-label="Teacher">{typeof klass.teacher === 'object' ? klass.teacher.name : 'N/A'}</td>
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
                <IonSelect name="branchId" value={formData.branchId} onIonChange={e => handleSelectChange('branchId', e.detail.value)}>
                  {branches.map((branch) => (
                    <IonSelectOption key={branch._id} value={branch._id}>
                      {branch.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Class Level</IonLabel>
                <IonSelect name="classLevel" value={formData.classLevel as string} onIonChange={e => handleSelectChange('classLevel', e.detail.value)}>
                  {classLevels.map((level) => (
                    <IonSelectOption key={level._id} value={level._id}>
                      {level.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Teacher</IonLabel>
                <IonSelect name="teacher" value={formData.teacher as string} onIonChange={e => handleSelectChange('teacher', e.detail.value)}>
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

export default Classes;
