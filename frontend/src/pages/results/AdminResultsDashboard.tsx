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
  IonLoading,
  IonRouterLink,
} from '@ionic/react';
import { add, create, trash, cloudUploadOutline, checkmarkCircleOutline, ribbonOutline, downloadOutline, documentTextOutline } from 'ionicons/icons';
import api from '../../services/api';
import { Result, Student, Subject, Class } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';

const API_URL = 'http://localhost:3000/api';

const AdminResultsDashboard: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [formData, setFormData] = useState<Partial<Result>>({});
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchStudentsInClass(selectedClass);
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
      const params = new URLSearchParams({ classId: selectedClass, session: selectedSession, term: selectedTerm }).toString();
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

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
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

  const handleSave = async () => {
    try {
      if (selectedResult) {
        await api.put(`/results/${selectedResult._id}`, formData);
      } else {
        await api.post('/results', formData);
      }
      fetchResults();
      closeModal();
    } catch (err: any) {
      console.error("Save failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save result");
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

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/results/${id}/approve`);
      fetchResults();
    } catch (err: any) {
      console.error("Approval failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to approve result");
    }
  };

  const handleRankResults = async () => {
    setLoading(true);
    try {
      await api.post('/results/rank', {
        classId: selectedClass,
        session: selectedSession,
        term: selectedTerm,
      });
      alert('Results ranked successfully!');
      fetchResults();
    } catch (err: any) {
      console.error("Ranking failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to rank results");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams({ classId: selectedClass, session: selectedSession, term: selectedTerm }).toString();
    window.open(`${API_URL}/results/export?${params}`, '_blank');
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
    if (e.target.files) setSelectedFile(e.target.files[0]);
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

  return (
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Admin Results Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol size-md="3" size="12">
                <IonItem><IonLabel>Class</IonLabel><IonSelect value={selectedClass} onIonChange={(e) => setSelectedClass(e.detail.value)}>{classes.map((c) => (<IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>))}</IonSelect></IonItem>
              </IonCol>
              <IonCol size-md="3" size="12">
                <IonItem><IonLabel>Session</IonLabel><IonInput value={selectedSession} onIonChange={(e) => setSelectedSession(e.detail.value!)} placeholder="e.g. 2024/2025" /></IonItem>
              </IonCol>
              <IonCol size-md="3" size="12">
                <IonItem><IonLabel>Term</IonLabel><IonSelect value={selectedTerm} onIonChange={(e) => setSelectedTerm(e.detail.value)}><IonSelectOption value="First">First</IonSelectOption><IonSelectOption value="Second">Second</IonSelectOption><IonSelectOption value="Third">Third</IonSelectOption></IonSelect></IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
                <IonCol>
                    <IonButton onClick={() => openModal()} disabled={!canPerformActions}><IonIcon slot="start" icon={add} />Add Result</IonButton>
                    <IonRouterLink routerLink="/results/bulk-add"><IonButton><IonIcon slot="start" icon={documentTextOutline} />Bulk Add</IonButton></IonRouterLink>
                    <IonButton onClick={() => setShowImportModal(true)} color="secondary"><IonIcon slot="start" icon={cloudUploadOutline} />Import</IonButton>
                    <IonButton onClick={handleRankResults} color="tertiary" disabled={!canPerformActions}><IonIcon slot="start" icon={ribbonOutline} />Rank Results</IonButton>
                    <IonButton onClick={handleExport} color="success" disabled={!canPerformActions}><IonIcon slot="start" icon={downloadOutline} />Export</IonButton>
                </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonLoading isOpen={loading} message="Please wait..." />
                <div className="ion-padding">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Grade</th>
                        <th>Status</th>
                        <th>Total Marks</th>
                        <th>Average</th>
                        <th>Position</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => (
                        <tr key={result._id}>
                          <td>{getStudentName(result)}</td>
                          <td>{getSubjectName(result)}</td>
                          <td>{result.marks}</td>
                          <td>{result.grade}</td>
                          <td>{result.status}</td>
                          <td>{result.totalMarks ?? 'N/A'}</td>
                          <td>{result.average ?? 'N/A'}</td>
                          <td>{result.position ?? 'N/A'}</td>
                          <td>
                            {result.status === 'Draft' && (
                              <>
                                <IonButton size="small" onClick={() => handleApprove(result._id)}><IonIcon slot="icon-only" icon={checkmarkCircleOutline} /></IonButton>
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
                <IonItem><IonLabel position="floating">Marks</IonLabel><IonInput name="marks" type="number" value={formData.marks} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel position="floating">Teacher Comment</IonLabel><IonInput name="remarks" value={formData.remarks} onIonChange={handleInputChange} /></IonItem>
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
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                <IonButton expand="full" onClick={handleImport} disabled={!selectedFile} className="ion-margin-top">Import</IonButton>
                <IonButton expand="full" color="light" onClick={() => setShowImportModal(false)}>Cancel</IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>
        </IonContent>
      </IonPage>
    </>
  );
};

export default AdminResultsDashboard;
