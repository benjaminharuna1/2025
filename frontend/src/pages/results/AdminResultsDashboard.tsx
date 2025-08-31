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
  IonToast,
} from '@ionic/react';
import {
  add,
  create,
  trash,
  cloudUploadOutline,
  checkmarkCircleOutline,
  ribbonOutline,
  downloadOutline,
  documentTextOutline,
  refreshOutline,
} from 'ionicons/icons';
import api from '../../services/api';
import { Result, Student, Subject, Class, Branch, Session } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import { useAuth } from '../../contexts/AuthContext';
import { getSessions } from '../../services/sessionsApi';
import { TERMS } from '../../constants';
import '../../theme/global.css';

const AdminResultsDashboard: React.FC = () => {
  const { user } = useAuth();

  const [results, setResults] = useState<Result[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const [formData, setFormData] = useState<Partial<Result>>({});
  const [loading, setLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ show: boolean, message: string, color: string }>({ show: false, message: '', color: '' });

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const promises = [
          getSessions(),
          api.get('/subjects'),
          api.get('/branches'),
        ];
        const [sessionsData, subjectsData, branchesData] = await Promise.all(promises);

        setSessions(sessionsData);
        setSubjects(subjectsData.data.subjects || []);
        setBranches(branchesData.data.branches || branchesData.data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  useEffect(() => {
    const fetchClassesByBranch = async () => {
      if (selectedBranch) {
        try {
          const { data } = await api.get(`/classes?branchId=${selectedBranch}`);
          setClasses(data.classes || data || []);
        } catch (error) {
          console.error('Error fetching classes:', error);
        }
      } else {
        setClasses([]);
      }
    };
    fetchClassesByBranch();
  }, [selectedBranch]);

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
    if (!selectedClass || !selectedSession || !selectedTerm) return;
    setLoading(true);
    try {
      const params: any = {
        classId: selectedClass,
        session: selectedSession,
        term: selectedTerm,
      };
      if (selectedBranch) {
        params.branchId = selectedBranch;
      }
      const { data } = await api.get('/results', { params });
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
    if (!selectedResult && !selectedSessionId) {
        setToastInfo({ show: true, message: 'A session and term must be selected to create a new result.', color: 'danger' });
        return;
    }
    try {
        const payload: Partial<Result> = { ...formData };
        payload.firstCA = Number(payload.firstCA);
        payload.secondCA = Number(payload.secondCA);
        payload.thirdCA = Number(payload.thirdCA);
        payload.exam = Number(payload.exam);

        payload.sessionId = selectedSessionId;
        delete payload.session;
        delete payload.term;

        if (selectedResult) {
            await api.put(`/results/${selectedResult._id}`, payload);
        } else {
            await api.post('/results', payload);
        }
        fetchResults();
        closeModal();
        setToastInfo({ show: true, message: 'Result saved successfully.', color: 'success' });
    } catch (err: any) {
        console.error('Save failed:', err.response?.data || err.message);
        setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to save result', color: 'danger' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    try {
      await api.delete(`/results/${id}`, { data: { sessionId: selectedSessionId } });
      fetchResults();
      setToastInfo({ show: true, message: 'Result deleted successfully.', color: 'success' });
    } catch (err: any) {
      console.error('Delete failed:', err.response?.data || err.message);
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to delete result', color: 'danger' });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/results/${id}/approve`, { sessionId: selectedSessionId });
      fetchResults();
      setToastInfo({ show: true, message: 'Result approved successfully.', color: 'success' });
    } catch (err: any) {
      console.error('Approval failed:', err.response?.data || err.message);
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to approve result', color: 'danger' });
    }
  };

  const handleRevertToDraft = async (id: string) => {
    if (!window.confirm('Are you sure you want to revert this result to Draft?')) return;
    try {
      await api.put(`/results/${id}/revert-to-draft`, { sessionId: selectedSessionId });
      fetchResults();
      setToastInfo({ show: true, message: 'Result reverted to draft.', color: 'success' });
    } catch (err: any) {
      console.error('Revert failed:', err.response?.data || err.message);
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to revert result', color: 'danger' });
    }
  };

  const handleRankResults = async () => {
    if (!selectedSessionId) return;
    setLoading(true);
    try {
      await api.post('/results/rank', {
        classId: selectedClass,
        sessionId: selectedSessionId,
        branchId: selectedBranch,
      });
      setToastInfo({ show: true, message: 'Results ranked successfully!', color: 'success' });
      fetchResults();
    } catch (err: any) {
      console.error('Ranking failed:', err.response?.data || err.message);
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to rank results', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedClass || !selectedSessionId) {
      setToastInfo({ show: true, message: 'Please select class, session, and term before exporting.', color: 'warning' });
      return;
    }
    try {
      setLoading(true);
      const payload: any = {
        classId: selectedClass,
        sessionId: selectedSessionId,
        branchId: selectedBranch,
      };
      const response = await api.post('/results/export', payload, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results-${selectedClass}-${selectedSession}-${selectedTerm}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Export failed:', err.response?.data || err.message);
      setToastInfo({ show: true, message: 'Failed to export results.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (result: Result | null = null) => {
    setSelectedResult(result);
    setFormData(
      result ? { ...result } : { classId: selectedClass, branchId: selectedBranch }
    );
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
    importData.append('sessionId', selectedSessionId);
    importData.append('classId', selectedClass);
    importData.append('branchId', selectedBranch);
    try {
      await api.post('/results/import', importData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchResults();
      setShowImportModal(false);
      setSelectedFile(null);
      setToastInfo({ show: true, message: 'Results imported successfully.', color: 'success' });
    } catch (error) {
      console.error('Error importing results:', error);
      setToastInfo({ show: true, message: 'Failed to import results.', color: 'danger' });
    }
  };

  const getStudentName = (result: Result) => {
    if (typeof result.studentId === 'object' && result.studentId.userId?.name) {
      return result.studentId.userId.name;
    }
    const student = students.find((s) => s._id === result.studentId);
    return student?.userId?.name || 'N/A';
  };

  const getAdmissionNumber = (result: Result) => {
    if (typeof result.studentId === 'object' && result.studentId.admissionNumber) {
      return result.studentId.admissionNumber;
    }
    const student = students.find((s) => s._id === result.studentId);
    return student?.admissionNumber || 'N/A';
  };

  const getSubjectName = (result: Result) => {
    if (typeof result.subjectId === 'object' && result.subjectId.name) {
      return result.subjectId.name;
    }
    const subject = subjects.find((s) => s._id === result.subjectId);
    return subject?.name || 'N/A';
  };

  const academicYears = [...new Set(sessions.map(s => s.academicYear))].sort().reverse();

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    setSelectedClass('');
  };

  const handleSessionChange = (e: any) => {
    setSelectedSession(e.detail.value);
    setSelectedTerm('');
    setSelectedSessionId('');
  };

  const handleTermChange = (e: any) => {
    const term = e.detail.value;
    setSelectedTerm(term);

    // Prioritize branch-specific session, then fall back to global
    const branchSpecificSession = sessions.find(s =>
      s.academicYear === selectedSession &&
      s.term === term &&
      s.branchId?._id === selectedBranch
    );

    if (branchSpecificSession) {
      setSelectedSessionId(branchSpecificSession._id);
    } else {
      const globalSession = sessions.find(s =>
        s.academicYear === selectedSession &&
        s.term === term &&
        (s.branchId === null || s.branchId === undefined)
      );
      setSelectedSessionId(globalSession?._id || '');
    }
  };

  return (
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonMenuButton /></IonButtons>
            <IonTitle>Admin Results Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Branch</IonLabel>
                  <IonSelect value={selectedBranch} onIonChange={(e) => handleBranchChange(e.detail.value)}>
                    {branches.map((b) => (<IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Class</IonLabel>
                  <IonSelect value={selectedClass} onIonChange={(e) => setSelectedClass(e.detail.value)} disabled={!selectedBranch}>
                    {classes.map((c) => (<IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Session</IonLabel>
                  <IonSelect value={selectedSession} onIonChange={handleSessionChange}>
                    {academicYears.map((session) => (<IonSelectOption key={session} value={session}>{session}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Term</IonLabel>
                  <IonSelect value={selectedTerm} onIonChange={handleTermChange} disabled={!selectedSession}>
                    {TERMS.map((term) => (<IonSelectOption key={term} value={term}>{term}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton onClick={() => openModal()} disabled={!selectedClass || !selectedSessionId}><IonIcon slot="start" icon={add} /> Add Result</IonButton>
                <IonRouterLink routerLink="/results/bulk-add"><IonButton><IonIcon slot="start" icon={documentTextOutline} /> Bulk Add</IonButton></IonRouterLink>
                <IonButton onClick={() => setShowImportModal(true)} color="secondary" disabled={!selectedClass || !selectedSessionId}><IonIcon slot="start" icon={cloudUploadOutline} /> Import</IonButton>
                <IonButton onClick={handleRankResults} color="tertiary" disabled={!selectedClass || !selectedSessionId}><IonIcon slot="start" icon={ribbonOutline} /> Rank Results</IonButton>
                <IonButton onClick={handleExport} color="success" disabled={!selectedClass || !selectedSessionId}><IonIcon slot="start" icon={downloadOutline} /> Export</IonButton>
                <IonRouterLink routerLink={`/reports/report-card-preview?classId=${selectedClass}&sessionId=${selectedSessionId}`}><IonButton color="dark" disabled={!selectedClass || !selectedSessionId}><IonIcon slot="start" icon={documentTextOutline} /> Generate Report Cards</IonButton></IonRouterLink>
                <IonRouterLink routerLink="/promotions"><IonButton color="warning"><IonIcon slot="start" icon={ribbonOutline} /> End of Session</IonButton></IonRouterLink>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonLoading isOpen={loading} message="Please wait..." />
                <div className="ion-padding responsive-table-wrapper">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Admission No.</th>
                        <th>Subject</th>
                        <th>1st CA</th>
                        <th>2nd CA</th>
                        <th>3rd CA</th>
                        <th>Exam</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Status</th>
                        <th>Position</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result) => (
                        <tr key={result._id}>
                          <td data-label="Student"><span>{getStudentName(result)}</span></td>
                          <td data-label="Admission No."><span>{getAdmissionNumber(result)}</span></td>
                          <td data-label="Subject"><span>{getSubjectName(result)}</span></td>
                          <td data-label="1st CA"><span>{result.firstCA}</span></td>
                          <td data-label="2nd CA"><span>{result.secondCA}</span></td>
                          <td data-label="3rd CA"><span>{result.thirdCA}</span></td>
                          <td data-label="Exam"><span>{result.exam}</span></td>
                          <td data-label="Total"><span>{result.marks}</span></td>
                          <td data-label="Grade"><span>{result.grade}</span></td>
                          <td data-label="Status"><span>{result.status}</span></td>
                          <td data-label="Position"><span>{result.position ?? 'N/A'}</span></td>
                          <td data-label="Actions">
                            <span>
                              {result.status === 'Draft' && (
                                <>
                                  <IonButton size="small" onClick={() => handleApprove(result._id)}><IonIcon slot="icon-only" icon={checkmarkCircleOutline} /></IonButton>
                                  <IonButton size="small" onClick={() => openModal(result)}><IonIcon slot="icon-only" icon={create} /></IonButton>
                                  <IonButton size="small" color="danger" onClick={() => handleDelete(result._id)}><IonIcon slot="icon-only" icon={trash} /></IonButton>
                                </>
                              )}
                              {result.status === 'Approved' && (
                                <IonButton size="small" color="warning" onClick={() => handleRevertToDraft(result._id)}><IonIcon slot="icon-only" icon={refreshOutline} /></IonButton>
                              )}
                            </span>
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
              <IonCardHeader><IonCardTitle>{selectedResult ? 'Edit' : 'Add'} Result</IonCardTitle></IonCardHeader>
              <IonCardContent className="modal-content">
                {user?.role === 'Super Admin' && !selectedResult ? (
                  <IonItem>
                    <IonLabel>Branch</IonLabel>
                    <IonSelect name="branchId" value={formData.branchId as string} onIonChange={handleSelectChange}>
                      {branches.map((b) => (<IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>))}
                    </IonSelect>
                  </IonItem>
                ) : (
                  <IonItem>
                    <IonLabel>Branch</IonLabel>
                    <IonInput readonly value={branches.find((b) => b._id === formData.branchId)?.name || ''} />
                  </IonItem>
                )}
                <IonItem>
                  <IonLabel>Student</IonLabel>
                  <IonInput readonly value={(typeof formData.studentId === 'object' && formData.studentId.name) || ''} />
                </IonItem>
                <IonItem>
                  <IonLabel>Subject</IonLabel>
                  <IonInput readonly value={typeof formData.subjectId === 'object' && formData.subjectId?.name ? formData.subjectId.name : subjects.find((s) => s._id === formData.subjectId)?.name || ''} />
                </IonItem>
                <IonItem><IonLabel position="floating">First CA</IonLabel><IonInput name="firstCA" type="number" value={formData.firstCA || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel position="floating">Second CA</IonLabel><IonInput name="secondCA" type="number" value={formData.secondCA || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel position="floating">Third CA</IonLabel><IonInput name="thirdCA" type="number" value={formData.thirdCA || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel position="floating">Exam</IonLabel><IonInput name="exam" type="number" value={formData.exam || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel>Total Marks</IonLabel><IonInput readonly value={(Number(formData.firstCA) || 0) + (Number(formData.secondCA) || 0) + (Number(formData.thirdCA) || 0) + (Number(formData.exam) || 0)} /></IonItem>
                <IonItem><IonLabel position="floating">Teacher Comment</IonLabel><IonInput name="teacherComment" value={formData.teacherComment || ''} onIonChange={handleInputChange} /></IonItem>
                {user && ['Super Admin', 'Branch Admin'].includes(user.role) && (
                  <IonItem><IonLabel position="floating">Principal Comment</IonLabel><IonInput name="principalComment" value={formData.principalComment || ''} onIonChange={handleInputChange} /></IonItem>
                )}
                <div className="modal-buttons">
                  <IonButton expand="block" onClick={handleSave}>Save</IonButton>
                  <IonButton expand="block" color="medium" onClick={closeModal}>Cancel</IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          </IonModal>
          <IonModal isOpen={showImportModal} onDidDismiss={() => setShowImportModal(false)}>
            <IonCard>
              <IonCardHeader><IonCardTitle>Import Results</IonCardTitle></IonCardHeader>
              <IonCardContent className="modal-content">
                <input type="file" onChange={handleFileChange} />
                <IonButton expand="block" onClick={handleImport}>Import</IonButton>
                <IonButton expand="block" color="medium" onClick={() => setShowImportModal(false)}>Cancel</IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>
          <IonToast isOpen={toastInfo.show} onDidDismiss={() => setToastInfo({ ...toastInfo, show: false })} message={toastInfo.message} duration={3000} color={toastInfo.color as any} />
        </IonContent>
      </IonPage>
    </>
  );
};

export default AdminResultsDashboard;
