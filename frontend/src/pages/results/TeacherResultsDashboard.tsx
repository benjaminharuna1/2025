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
  IonRouterLink,
  IonLoading,
} from '@ionic/react';
import { add, create, trash, cloudUploadOutline, documentTextOutline } from 'ionicons/icons';
import api from '../../services/api';
import { Result, Student, Subject, Class, Session } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import { getSessions } from '../../services/sessionsApi';
import { IonToast } from '@ionic/react';

const TeacherResultsDashboard: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [formData, setFormData] = useState<Partial<Result>>({});
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState<{ show: boolean; message: string; color: string }>({ show: false, message: '', color: '' });

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [classesData, subjectsData, sessionsData] = await Promise.all([
          api.get('/classes'),
          api.get('/subjects'),
          getSessions(),
        ]);
        setClasses(classesData.data.classes || []);
        setSubjects(subjectsData.data.subjects || []);
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setShowToast({ show: true, message: 'Failed to load initial data.', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsInClass(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSession && selectedTerm) {
      fetchResults();
    } else {
      setResults([]);
    }
  }, [selectedClass, selectedSession, selectedTerm]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        classId: selectedClass,
        session: selectedSession,
        term: selectedTerm,
      }).toString();
      const { data } = await api.get(`/results?${params}`);
      setResults(data.results || data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsInClass = async (classId: string) => {
    try {
      const { data } = await api.get(`/students?classId=${classId}`);
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        firstCA: Number(formData.firstCA),
        secondCA: Number(formData.secondCA),
        thirdCA: Number(formData.thirdCA),
        exam: Number(formData.exam),
      };
      if (selectedResult) {
        await api.put(`/results/${selectedResult._id}`, payload);
      } else {
        await api.post('/results', payload);
      }
      fetchResults();
      closeModal();
      setShowToast({ show: true, message: 'Result saved successfully!', color: 'success' });
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        setShowToast({
          show: true,
          message: 'Result entry for this term is not currently open. Please contact an administrator.',
          color: 'danger',
        });
      } else {
        setShowToast({
          show: true,
          message: err.response?.data?.message || 'Failed to save result',
          color: 'danger',
        });
      }
      console.error('Save failed:', err.response?.data || err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await api.delete(`/results/${id}`);
        fetchResults();
      } catch (err: any) {
        console.error("Delete failed:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Failed to delete result");
      }
    }
  };

  const openModal = (result: Result | null = null) => {
    setSelectedResult(result);
    setFormData(result ? { ...result } : { classId: selectedClass, session: selectedSession, term: selectedTerm });
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

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    const importData = new FormData();
    importData.append('file', selectedFile);
    try {
      await api.post('/results/import', importData, { headers: { 'Content-Type': 'multipart/form-data' } });
      fetchResults();
      setShowImportModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error importing results:', error);
    }
  };

  const canPerformActions = selectedClass && selectedSession && selectedTerm;

  const getStudentName = (result: Result) => {
    if (typeof result.studentId === 'object' && result.studentId.userId) return result.studentId.userId.name;
    const student = students.find(s => s._id === result.studentId);
    return student ? student.userId.name : 'N/A';
  };

  const getSubjectName = (result: Result) => {
    if (typeof result.subjectId === 'object' && result.subjectId.name) return result.subjectId.name;
    const subject = subjects.find(s => s._id === result.subjectId);
    return subject ? subject.name : 'N/A';
  };

  const academicYears = [...new Set(sessions.map(s => s.academicYear))].sort().reverse();
  const availableTerms = selectedSession ? [...new Set(sessions.filter(s => s.academicYear === selectedSession).map(s => s.term))] : [];

  const handleSessionChange = (e: any) => {
    setSelectedSession(e.detail.value);
    setSelectedTerm(''); // Reset term when session changes
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
            <IonTitle>Manage Results</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol size-md="4" size="12">
                <IonItem><IonLabel>Class</IonLabel><IonSelect value={selectedClass} onIonChange={(e) => setSelectedClass(e.detail.value)}>{classes.map((c) => (<IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>))}</IonSelect></IonItem>
              </IonCol>
              <IonCol size-md="4" size="12">
                <IonItem>
                  <IonLabel>Session</IonLabel>
                  <IonSelect value={selectedSession} onIonChange={handleSessionChange}>
                    {academicYears.map(year => <IonSelectOption key={year} value={year}>{year}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="4" size="12">
                <IonItem>
                  <IonLabel>Term</IonLabel>
                  <IonSelect value={selectedTerm} onIonChange={(e) => setSelectedTerm(e.detail.value)} disabled={!selectedSession}>
                    {availableTerms.map(term => <IonSelectOption key={term} value={term}>{term}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
                <IonCol>
                    <IonButton onClick={() => openModal()} disabled={!canPerformActions}><IonIcon slot="start" icon={add} />Add Result</IonButton>
                    <IonRouterLink routerLink="/results/bulk-add"><IonButton><IonIcon slot="start" icon={documentTextOutline} />Bulk Add</IonButton></IonRouterLink>
                    <IonButton onClick={() => setShowImportModal(true)} color="secondary"><IonIcon slot="start" icon={cloudUploadOutline} />Import</IonButton>
                </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonLoading isOpen={loading} message="Fetching results..." />
                <div className="ion-padding">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>1st CA</th>
                        <th>2nd CA</th>
                        <th>3rd CA</th>
                        <th>Exam</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => (
                        <tr key={result._id}>
                          <td>{getStudentName(result)}</td>
                          <td>{getSubjectName(result)}</td>
                          <td>{result.firstCA}</td>
                          <td>{result.secondCA}</td>
                          <td>{result.thirdCA}</td>
                          <td>{result.exam}</td>
                          <td>{result.marks}</td>
                          <td>{result.grade}</td>
                          <td>{result.status}</td>
                          <td>
                            {result.status === 'Draft' && (
                              <>
                                <IonButton size="small" onClick={() => openModal(result)}><IonIcon slot="icon-only" icon={create} /></IonButton>
                                <IonButton size="small" color="danger" onClick={() => handleDelete(result._id)}><IonIcon slot="icon-only" icon={trash} /></IonButton>
                              </>
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

          {/* Add/Edit Modal */}
          <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonCard>
              <IonCardHeader><IonCardTitle>{selectedResult ? 'Edit' : 'Add'} Result</IonCardTitle></IonCardHeader>
              <IonCardContent>
                <IonItem><IonLabel>Student</IonLabel><IonSelect name="studentId" value={formData.studentId} onIonChange={handleSelectChange}>{students.map((student) => (<IonSelectOption key={student._id} value={student._id}>{student.userId?.name} ({student.admissionNumber})</IonSelectOption>))}</IonSelect></IonItem>
                <IonItem><IonLabel>Subject</IonLabel><IonSelect name="subjectId" value={formData.subjectId} onIonChange={handleSelectChange}>{subjects.map((subject) => (<IonSelectOption key={subject._id} value={subject._id}>{subject.name}</IonSelectOption>))}</IonSelect></IonItem>
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

          {/* Import Modal */}
          <IonModal isOpen={showImportModal} onDidDismiss={() => setShowImportModal(false)}>
            <IonCard>
              <IonCardHeader><IonCardTitle>Import Results</IonCardTitle></IonCardHeader>
              <IonCardContent>
                <p>Prepare an Excel file with the following columns in this exact order: `Reg No`, `Subject`, `Session`, `Term`, `First CA`, `Second CA`, `Third CA`, `Exam`.</p>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                <IonButton expand="full" onClick={handleImport} disabled={!selectedFile} className="ion-margin-top">Import</IonButton>
                <IonButton expand="full" color="light" onClick={() => setShowImportModal(false)}>Cancel</IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>

          {/* Import Modal */}
          <IonModal isOpen={showImportModal} onDidDismiss={() => setShowImportModal(false)}>
            <IonCard>
              <IonCardHeader><IonCardTitle>Import Results</IonCardTitle></IonCardHeader>
              <IonCardContent>
                <p>Prepare an Excel file with the following columns in this exact order: `Reg No`, `Subject`, `Session`, `Term`, `First CA`, `Second CA`, `Third CA`, `Exam`.</p>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                <IonButton expand="full" onClick={handleImport} disabled={!selectedFile} className="ion-margin-top">Import</IonButton>
                <IonButton expand="full" color="light" onClick={() => setShowImportModal(false)}>Cancel</IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>
          <IonToast
            isOpen={showToast.show}
            onDidDismiss={() => setShowToast({ show: false, message: '', color: '' })}
            message={showToast.message}
            duration={4000}
            color={showToast.color}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default TeacherResultsDashboard;
