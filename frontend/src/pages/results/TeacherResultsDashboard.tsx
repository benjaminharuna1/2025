import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  IonRouterLink,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { add, create, trash, documentTextOutline } from 'ionicons/icons';
import api from '../../services/api';
import { Result, Student, Subject, Class, Session } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import { useAuth } from '../../contexts/AuthContext';

type ToastColor = 'success' | 'danger' | 'warning';

const TeacherResultsDashboard: React.FC = () => {
  const { user } = useAuth();

  const [results, setResults] = useState<Result[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [formData, setFormData] = useState<Partial<Result>>({});
  const [loading, setLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ show: boolean; message: string; color: ToastColor }>({ show: false, message: '', color: 'success' });

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [classesData, subjectsData, sessionsData] = await Promise.all([
          api.get('/dropdowns/classes'),
          api.get('/dropdowns/subjects'),
          api.get('/dropdowns/sessions'),
        ]);
        setClasses(classesData.data || []);
        setSubjects(subjectsData.data || []);
        setSessions(sessionsData.data || []);
      } catch (error) {
        setToastInfo({ show: true, message: 'Failed to load initial data.', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    if (user) {
        loadInitialData();
    }
  }, [user]);

  const fetchResults = useCallback(async () => {
    if (!selectedClass || !selectedAcademicYear || !selectedTerm) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/results`, {
        params: { classId: selectedClass, session: selectedAcademicYear, term: selectedTerm }
      });
      setResults(data || []);
    } catch (error) {
      setToastInfo({ show: true, message: 'Could not fetch results.', color: 'danger'});
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedAcademicYear, selectedTerm]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudentsInClass = async (classId: string) => {
        try {
          const { data } = await api.get(`/dropdowns/students?classId=${classId}`);
          setStudents(data || []);
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      };
      fetchStudentsInClass(selectedClass);
    } else {
        setStudents([]);
    }
  }, [selectedClass]);

  const handleSave = async () => {
    if (!selectedClass || !selectedSessionId || !formData.studentId || !formData.subjectId) {
      setToastInfo({ show: true, message: 'All fields are required.', color: 'danger' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        classId: selectedClass,
        sessionId: selectedSessionId,
        session: selectedAcademicYear,
        term: selectedTerm,
        branchId: user?.branchId,
      };
      if (selectedResult) {
        await api.put(`/results/${selectedResult._id}`, payload);
      } else {
        await api.post('/results', payload);
      }
      await fetchResults();
      closeModal();
      setToastInfo({ show: true, message: 'Result saved successfully!', color: 'success' });
    } catch (err: any) {
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to save result', color: 'danger' });
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      setLoading(true);
      try {
        await api.delete(`/results/${id}`);
        await fetchResults();
        setToastInfo({ show: true, message: 'Result deleted.', color: 'success'});
      } catch (err: any) {
        setToastInfo({ show: true, message: err.response?.data?.message || "Failed to delete result", color: 'danger'});
      } finally {
        setLoading(false);
      }
    }
  };

  const openModal = (result: Result | null = null) => {
    setSelectedResult(result);
    setFormData(result ? { ...result } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedResult(null);
    setFormData({});
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    const sessionObj = sessions.find(s => s.academicYear === selectedAcademicYear && s.term === term);
    setSelectedSessionId(sessionObj?._id || '');
  };

  const canPerformActions = selectedClass && selectedSessionId;
  const getStudentName = (result: Result) => result.studentId?.userId?.name || 'N/A';
  const getSubjectName = (result: Result) => result.subjectId?.name || 'N/A';

  const academicYears = useMemo(() => [...new Set(sessions.map(s => s.academicYear))].sort().reverse(), [sessions]);
  const availableTerms = useMemo(() => selectedAcademicYear ? [...new Set(sessions.filter(s => s.academicYear === selectedAcademicYear).map(s => s.term))] : [], [sessions, selectedAcademicYear]);

  return (
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonMenuButton /></IonButtons>
            <IonTitle>Manage Results</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol size-md="4" size="12"><IonItem><IonLabel>Class</IonLabel><IonSelect value={selectedClass} onIonChange={(e) => setSelectedClass(e.detail.value as string)}>{classes.map((c) => (<IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>))}</IonSelect></IonItem></IonCol>
              <IonCol size-md="4" size="12"><IonItem><IonLabel>Session</IonLabel><IonSelect value={selectedAcademicYear} onIonChange={e => setSelectedAcademicYear(e.detail.value)}>{academicYears.map(year => <IonSelectOption key={year} value={year}>{year}</IonSelectOption>)}</IonSelect></IonItem></IonCol>
              <IonCol size-md="4" size="12"><IonItem><IonLabel>Term</IonLabel><IonSelect value={selectedTerm} onIonChange={e => handleTermChange(e.detail.value)} disabled={!selectedAcademicYear}>{availableTerms.map(term => <IonSelectOption key={term} value={term}>{term}</IonSelectOption>)}</IonSelect></IonItem></IonCol>
            </IonRow>
            <IonRow>
                <IonCol>
                    <IonButton onClick={() => openModal()} disabled={!canPerformActions}><IonIcon slot="start" icon={add} />Add Result</IonButton>
                    <IonRouterLink routerLink="/results/bulk-add"><IonButton><IonIcon slot="start" icon={documentTextOutline} />Bulk Add</IonButton></IonRouterLink>
                </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonLoading isOpen={loading} message="Please wait..." />
                <div className="ion-padding responsive-table-wrapper">
                  <table className="responsive-table">
                    <thead><tr><th>Student</th><th>Subject</th><th>1st CA</th><th>2nd CA</th><th>3rd CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {results.map((result) => (
                        <tr key={result._id}>
                          <td>{getStudentName(result)}</td><td>{getSubjectName(result)}</td><td>{result.firstCA}</td><td>{result.secondCA}</td><td>{result.thirdCA}</td><td>{result.exam}</td><td>{result.marks}</td><td>{result.grade}</td><td>{result.status}</td>
                          <td>{result.status === 'Draft' && (<><IonButton size="small" onClick={() => openModal(result)}><IonIcon slot="icon-only" icon={create} /></IonButton><IonButton size="small" color="danger" onClick={() => handleDelete(result._id)}><IonIcon slot="icon-only" icon={trash} /></IonButton></>)}</td>
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
              <IonCardHeader><IonCardTitle>{selectedResult ? 'Edit' : 'Add'} Result</IonCardTitle></IonCardHeader>
              <IonCardContent>
                <IonItem><IonLabel>Student</IonLabel><IonSelect name="studentId" value={formData.studentId} onIonChange={handleInputChange}>{students.map((student) => (<IonSelectOption key={student._id} value={student._id}>{student.userId?.name} ({student.admissionNumber})</IonSelectOption>))}</IonSelect></IonItem>
                <IonItem><IonLabel>Subject</IonLabel><IonSelect name="subjectId" value={formData.subjectId} onIonChange={handleInputChange}>{subjects.map((subject) => (<IonSelectOption key={subject._id} value={subject._id}>{subject.name}</IonSelectOption>))}</IonSelect></IonItem>
                <IonItem><IonLabel position="floating">First CA</IonLabel><IonInput name="firstCA" type="number" value={formData.firstCA || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel position="floating">Second CA</IonLabel><IonInput name="secondCA" type="number" value={formData.secondCA || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel position="floating">Third CA</IonLabel><IonInput name="thirdCA" type="number" value={formData.thirdCA || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel position="floating">Exam</IonLabel><IonInput name="exam" type="number" value={formData.exam || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel>Total Marks</IonLabel><IonInput readonly value={(Number(formData.firstCA) || 0) + (Number(formData.secondCA) || 0) + (Number(formData.thirdCA) || 0) + (Number(formData.exam) || 0)} /></IonItem>
                <IonItem><IonLabel position="floating">Teacher Comment</IonLabel><IonInput name="teacherComment" value={formData.teacherComment || ''} onIonChange={handleInputChange} /></IonItem>
                <IonButton expand="full" onClick={handleSave} className="ion-margin-top">Save</IonButton>
                <IonButton expand="full" color="light" onClick={closeModal}>Cancel</IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>
          <IonToast isOpen={toastInfo.show} onDidDismiss={() => setToastInfo({ show: false, message: '', color: 'success' })} message={toastInfo.message} duration={3000} color={toastInfo.color} />
        </IonContent>
      </IonPage>
    </>
  );
};

export default TeacherResultsDashboard;
