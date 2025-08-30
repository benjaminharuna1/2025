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
import { Subject, Class, User as Teacher, Branch, ClassLevel } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './Subjects.css';

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<Partial<Subject>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterClassLevel, setFilterClassLevel] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');

  useEffect(() => {
    fetchBranches();
    fetchClassLevels();
    fetchTeachers();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [filterBranch, filterClassLevel, filterTeacher]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches');
      setBranches(data.branches || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchClassLevels = async () => {
    try {
      const { data } = await api.get('/classlevels');
      setClassLevels(data || []);
    } catch (error) {
      console.error('Error fetching class levels:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const params: any = {};
      if (filterBranch) params.branchId = filterBranch;
      if (filterClassLevel) params.classLevelId = filterClassLevel;
      if (filterTeacher) params.teacherId = filterTeacher;

      const { data } = await api.get('/subjects', { params });
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

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      setClasses(data.classes || data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchTeachers = async () => {
    // TODO: This is a temporary workaround for a backend that only provides paginated teachers.
    // In a production environment, this is highly inefficient and can cause performance issues
    // if the number of teachers is large. A dedicated, non-paginated endpoint (e.g., /api/teachers/all)
    // should be created to populate dropdowns efficiently.
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
      if (selectedSubject) {
        await api.put(`/subjects/${selectedSubject._id}`, formData);
      } else {
        await api.post('/subjects', formData);
      }
      fetchSubjects();
      closeModal();
    } catch (error) {
      console.error('Error saving subject:', error);
      setToastMessage('Failed to save subject.');
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      setToastMessage('Failed to delete subject.');
      setShowToast(true);
    }
  };

  const openModal = (subject: Subject | null = null) => {
    setSelectedSubject(subject);
    if (subject) {
      setFormData({
        ...subject,
        classId: typeof subject.classId === 'object' ? subject.classId._id : subject.classId,
        teacherId: typeof subject.teacherId === 'object' ? subject.teacherId._id : subject.teacherId,
      });
    } else {
      setFormData({});
    }
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

  const handleSelectChange = (fieldName: keyof Subject, value: any) => {
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
              <IonCol size-md="6">
                <IonItem>
                  <IonLabel>Filter by Branch</IonLabel>
                  <IonSelect value={filterBranch} onIonChange={e => setFilterBranch(e.detail.value)}>
                    <IonSelectOption value="">All</IonSelectOption>
                    {branches.map(branch => <IonSelectOption key={branch._id} value={branch._id}>{branch.name}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="4">
                <IonItem>
                  <IonLabel>Filter by Class Level</IonLabel>
                  <IonSelect value={filterClassLevel} onIonChange={e => setFilterClassLevel(e.detail.value)}>
                    <IonSelectOption value="">All</IonSelectOption>
                    {classLevels.map(level => <IonSelectOption key={level._id} value={level._id}>{level.name}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="4">
                <IonItem>
                  <IonLabel>Filter by Teacher</IonLabel>
                  <IonSelect value={filterTeacher} onIonChange={e => setFilterTeacher(e.detail.value)}>
                    <IonSelectOption value="">All</IonSelectOption>
                    {teachers.map(teacher => <IonSelectOption key={teacher._id} value={teacher._id}>{teacher.userId?.name}</IonSelectOption>)}
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
                        <th>Class</th>
                        <th>Teacher</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subject) => (
                        <tr key={subject._id}>
                          <td data-label="Name">{subject.name}</td>
                          <td data-label="Class">{typeof subject.classId === 'object' && subject.classId.name}</td>
                        <td data-label="Teacher">{subject.teacherId?.userId?.name || 'N/A'}</td>
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
                  <IonLabel>Class</IonLabel>
                  <IonSelect name="classId" value={formData.classId} onIonChange={e => handleSelectChange('classId', e.detail.value)}>
                    {classes
                      .filter(c => !filterBranch || c.branchId === filterBranch)
                      .map((c) => (
                      <IonSelectOption key={c._id} value={c._id}>
                        {c.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel>Teacher</IonLabel>
                  <IonSelect name="teacherId" value={formData.teacherId} onIonChange={e => handleSelectChange('teacherId', e.detail.value)}>
                    {teachers.map((t) => (
                      <IonSelectOption key={t._id} value={t._id}>
                        {t.userId?.name}
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

export default Subjects;
