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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    fetchBranches();
    fetchClassLevels();
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [filterBranch, page]);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes', {
        params: { branchId: filterBranch, page },
      });
      if (data && Array.isArray(data.classes)) {
        setClasses(data.classes);
        setTotalPages(data.pages);
      } else if (Array.isArray(data)) {
        // Handle case where API returns a direct array
        setClasses(data);
        setTotalPages(1); // No pagination info
      } else {
        setClasses([]);
        setTotalPages(1);
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
    // Fetches all teachers to populate the dropdown.
    // Note: This is not ideal for performance if the number of teachers is very large.
    // A better approach would be a dedicated API endpoint that returns all teachers
    // or a searchable dropdown that fetches teachers on demand.
    let allTeachers: Teacher[] = [];
    let page = 1;
    let totalPages = 1;

    try {
      do {
        const { data } = await api.get('/teachers', { params: { page } });
        if (data && data.teachers) {
          allTeachers = [...allTeachers, ...data.teachers];
          totalPages = data.pages;
          page++;
        } else {
          totalPages = 0; // stop the loop
        }
      } while (page <= totalPages);
      setTeachers(allTeachers);
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
      setToastMessage('Class saved successfully.');
      setShowToast(true);
      closeModal();
    } catch (error) {
      console.error('Error saving class:', error);
      const errorMsg = (error as any).response?.data?.message || 'Failed to save class.';
      setToastMessage(errorMsg);
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await api.delete(`/classes/${id}`);
        fetchClasses();
        setToastMessage('Class deleted successfully.');
        setShowToast(true);
      } catch (error) {
        console.error('Error deleting class:', error);
        const errorMsg = (error as any).response?.data?.message || 'Failed to delete class.';
        setToastMessage(errorMsg);
        setShowToast(true);
      }
    }
  };

  const openModal = (klass: Class | null = null) => {
    setSelectedClass(klass);
    if (klass) {
      setFormData({
        ...klass,
        classLevel: typeof klass.classLevel === 'object' ? klass.classLevel._id : klass.classLevel,
        mainTeacherId: typeof klass.mainTeacherId === 'object' ? klass.mainTeacherId._id : klass.mainTeacherId,
      });
    } else {
      setFormData({ branchId: filterBranch });
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
                      <th>Main Teacher</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((klass) => (
                      <tr key={klass._id}>
                        <td data-label="Name">{klass.name}</td>
                        <td data-label="Class Level">{typeof klass.classLevel === 'object' ? klass.classLevel.name : 'N/A'}</td>
                        <td data-label="Main Teacher">{klass.mainTeacherId?.userId?.name || 'N/A'}</td>
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
                <div className="pagination">
                  <IonButton onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                    Previous
                  </IonButton>
                  <span>Page {page} of {totalPages}</span>
                  <IonButton onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                    Next
                  </IonButton>
                </div>
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
                <IonLabel>Main Teacher</IonLabel>
                <IonSelect name="mainTeacherId" value={formData.mainTeacherId as string} onIonChange={e => handleSelectChange('mainTeacherId', e.detail.value)}>
                  {teachers.map((teacher) => (
                    <IonSelectOption key={teacher._id} value={teacher._id}>
                      {teacher.userId?.name}
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
