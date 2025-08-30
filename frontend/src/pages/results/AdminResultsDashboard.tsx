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

type ToastColor = 'success' | 'danger' | 'warning';

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
  const [toastInfo, setToastInfo] = useState<{ show: boolean; message: string; color: ToastColor }>({ show: false, message: '', color: 'success' });

  const [selectedBranch, setSelectedBranch] = useState<string>(user?.role === 'Branch Admin' ? user.branchId || '' : '');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [
          api.get('/dropdowns/sessions'),
          api.get('/dropdowns/subjects'),
        ];
        if (user?.role === 'Super Admin') {
          promises.push(api.get('/dropdowns/branches'));
        } else {
          promises.push(api.get('/dropdowns/classes'));
        }

        const [sessionsRes, subjectsRes, mainDataRes] = await Promise.all(promises);

        setSessions(sessionsRes.data || []);
        setSubjects(subjectsRes.data || []);

        if (user?.role === 'Super Admin') {
          setBranches(mainDataRes.data || []);
        } else {
          setClasses(mainDataRes.data || []);
        }
      } catch (error) {
        setToastInfo({ show: true, message: 'Could not load initial data.', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchDropdownData();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'Super Admin' && selectedBranch) {
      const fetchClassesForBranch = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/dropdowns/classes?branchId=${selectedBranch}`);
          setClasses(data || []);
        } catch (error) {
          console.error('Error fetching classes for branch:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchClassesForBranch();
    }
    setSelectedClass('');
  }, [selectedBranch, user?.role]);

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
      setToastInfo({ show: true, message: 'Failed to fetch results.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedAcademicYear, selectedTerm]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    if (selectedClass) {
      const fetchStudentsInClass = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/dropdowns/students?classId=${selectedClass}`);
          setStudents(data || []);
        } catch (error) {
          console.error('Error fetching students:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchStudentsInClass();
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  const handleSave = async () => {
    if (!formData.studentId || !formData.subjectId) {
        setToastInfo({ show: true, message: 'Student and Subject are required.', color: 'danger'});
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
            branchId: user?.role === 'Super Admin' ? selectedBranch : user?.branchId
        };
      if (selectedResult) {
        await api.put(`/results/${selectedResult._id}`, payload);
      } else {
        await api.post('/results', payload);
      }
      await fetchResults();
      closeModal();
      setToastInfo({ show: true, message: 'Result saved successfully.', color: 'success' });
    } catch (err: any) {
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to save result', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    setLoading(true);
    try {
      await api.delete(`/results/${id}`);
      await fetchResults();
      setToastInfo({ show: true, message: 'Result deleted.', color: 'success' });
    } catch (err: any) {
      setToastInfo({ show: true, message: 'Failed to delete.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      await api.put(`/results/${id}/approve`);
      await fetchResults();
      setToastInfo({ show: true, message: 'Result approved.', color: 'success' });
    } catch (err: any) {
      setToastInfo({ show: true, message: 'Failed to approve.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevertToDraft = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    setLoading(true);
    try {
      await api.put(`/results/${id}/revert-to-draft`);
      await fetchResults();
      setToastInfo({ show: true, message: 'Result reverted.', color: 'success' });
    } catch (err: any) {
      setToastInfo({ show: true, message: 'Failed to revert.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleRankResults = async () => {
    if (!selectedClass || !selectedAcademicYear || !selectedTerm) return;
    setLoading(true);
    try {
      await api.post('/results/rank', {
        classId: selectedClass,
        session: selectedAcademicYear,
        term: selectedTerm,
        branchId: user?.role === 'Super Admin' ? selectedBranch : user?.branchId,
      });
      await fetchResults();
      setToastInfo({ show: true, message: 'Ranking complete.', color: 'success' });
    } catch (err: any) {
      setToastInfo({ show: true, message: 'Ranking failed.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
     if (!selectedClass || !selectedAcademicYear || !selectedTerm) {
      setToastInfo({ show: true, message: 'Please select all filters to export.', color: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        classId: selectedClass,
        session: selectedAcademicYear,
        term: selectedTerm,
      };
      if (user?.role === 'Super Admin') payload.branchId = selectedBranch;

      const response = await api.post('/results/export', payload, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results-${selectedClass}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setToastInfo({ show: true, message: 'Export failed.', color: 'danger' });
    } finally {
      setLoading(false);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const importData = new FormData();
    importData.append('file', selectedFile);
    try {
      await api.post('/results/import', importData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchResults();
      setShowImportModal(false);
      setSelectedFile(null);
      setToastInfo({ show: true, message: 'Import successful.', color: 'success' });
    } catch (error) {
      setToastInfo({ show: true, message: 'Import failed.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const canPerformActions = selectedClass && selectedSessionId;
  const getStudentName = (result: Result) => result.studentId?.userId?.name || 'N/A';
  const getAdmissionNumber = (result: Result) => result.studentId?.admissionNumber || 'N/A';
  const getSubjectName = (result: Result) => result.subjectId?.name || 'N/A';

  const academicYears = useMemo(() => [...new Set(sessions.map(s => s.academicYear))].sort().reverse(), [sessions]);
  const availableTerms = useMemo(() => selectedAcademicYear ? [...new Set(sessions.filter(s => s.academicYear === selectedAcademicYear).map(s => s.term))] : [], [sessions, selectedAcademicYear]);

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    const sessionObj = sessions.find(s => s.academicYear === selectedAcademicYear && s.term === term);
    setSelectedSessionId(sessionObj?._id || '');
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
              {user?.role === 'Super Admin' && (
                <IonCol size-md="3" size="12">
                  <IonItem>
                    <IonLabel>Branch</IonLabel>
                    <IonSelect value={selectedBranch} onIonChange={e => setSelectedBranch(e.detail.value)}>
                      {branches.map((b) => (<IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
              )}
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Class</IonLabel>
                  <IonSelect value={selectedClass} onIonChange={e => setSelectedClass(e.detail.value)} disabled={user?.role === 'Super Admin' && !selectedBranch && branches.length > 0}>
                    {classes.map((c) => (<IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Session</IonLabel>
                  <IonSelect value={selectedAcademicYear} onIonChange={e => {setSelectedAcademicYear(e.detail.value); setSelectedTerm('');}}>
                    {academicYears.map((year) => (<IonSelectOption key={year} value={year}>{year}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Term</IonLabel>
                  <IonSelect value={selectedTerm} onIonChange={e => handleTermChange(e.detail.value)} disabled={!selectedAcademicYear}>
                    {availableTerms.map((term) => (<IonSelectOption key={term} value={term}>{term}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton onClick={() => openModal()} disabled={!canPerformActions}><IonIcon slot="start" icon={add} /> Add Result</IonButton>
                <IonRouterLink routerLink="/results/bulk-add"><IonButton><IonIcon slot="start" icon={documentTextOutline} /> Bulk Add</IonButton></IonRouterLink>
                <IonButton onClick={() => setShowImportModal(true)} color="secondary"><IonIcon slot="start" icon={cloudUploadOutline} /> Import</IonButton>
                <IonButton onClick={handleRankResults} color="tertiary" disabled={!canPerformActions}><IonIcon slot="start" icon={ribbonOutline} /> Rank Results</IonButton>
                <IonButton onClick={handleExport} color="success" disabled={!canPerformActions}><IonIcon slot="start" icon={downloadOutline} /> Export</IonButton>
                <IonRouterLink routerLink={`/reports/report-card-preview?classId=${selectedClass}&sessionId=${selectedSessionId}`}><IonButton color="dark" disabled={!canPerformActions}><IonIcon slot="start" icon={documentTextOutline} /> Generate Report Cards</IonButton></IonRouterLink>
                <IonRouterLink routerLink="/promotions"><IonButton color="warning"><IonIcon slot="start" icon={ribbonOutline} /> End of Session</IonButton></IonRouterLink>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonLoading isOpen={loading} message="Please wait..." />
                <div className="ion-padding responsive-table-wrapper">
                  <table className="responsive-table">
                    <thead><tr><th>Student</th><th>Admission No.</th><th>Subject</th><th>1st CA</th><th>2nd CA</th><th>3rd CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>Status</th><th>Position</th><th>Actions</th></tr></thead>
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
                              {result.status === 'Draft' && (<>
                                  <IonButton size="small" onClick={() => handleApprove(result._id)}><IonIcon slot="icon-only" icon={checkmarkCircleOutline} /></IonButton>
                                  <IonButton size="small" onClick={() => openModal(result)}><IonIcon slot="icon-only" icon={create} /></IonButton>
                                  <IonButton size="small" color="danger" onClick={() => handleDelete(result._id)}><IonIcon slot="icon-only" icon={trash} /></IonButton>
                                </>)}
                              {result.status === 'Approved' && (<IonButton size="small" color="warning" onClick={() => handleRevertToDraft(result._id)}><IonIcon slot="icon-only" icon={refreshOutline} /></IonButton>)}
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
                {!selectedResult && (<>
                    <IonItem><IonLabel>Student</IonLabel><IonSelect name="studentId" value={formData.studentId} onIonChange={handleInputChange}>{students.map(s => (<IonSelectOption key={s._id} value={s._id}>{s.userId.name} ({s.admissionNumber})</IonSelectOption>))}</IonSelect></IonItem>
                    <IonItem><IonLabel>Subject</IonLabel><IonSelect name="subjectId" value={formData.subjectId} onIonChange={handleInputChange}>{subjects.map(s => (<IonSelectOption key={s._id} value={s._id}>{s.name}</IonSelectOption>))}</IonSelect></IonItem>
                </>)}
                {selectedResult && (<>
                    <IonItem><IonLabel>Student</IonLabel><IonInput readonly value={getStudentName(selectedResult)} /></IonItem>
                    <IonItem><IonLabel>Subject</IonLabel><IonInput readonly value={getSubjectName(selectedResult)} /></IonItem>
                </>)}
                <IonItem><IonLabel position="floating">First CA</IonLabel><IonInput name="firstCA" type="number" value={formData.firstCA || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel position="floating">Second CA</IonLabel><IonInput name="secondCA" type="number" value={formData.secondCA || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel position="floating">Third CA</IonLabel><IonInput name="thirdCA" type="number" value={formData.thirdCA || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel position="floating">Exam</IonLabel><IonInput name="exam" type="number" value={formData.exam || ''} onIonChange={handleInputChange} /></IonItem>
                <IonItem><IonLabel>Total Marks</IonLabel><IonInput readonly value={(Number(formData.firstCA) || 0) + (Number(formData.secondCA) || 0) + (Number(formData.thirdCA) || 0) + (Number(formData.exam) || 0)}/></IonItem>
                <IonItem><IonLabel position="floating">Teacher Comment</IonLabel><IonInput name="teacherComment" value={formData.teacherComment || ''} onIonChange={handleInputChange} /></IonItem>
                {user && ['Super Admin', 'Branch Admin'].includes(user.role) && (<IonItem><IonLabel position="floating">Principal Comment</IonLabel><IonInput name="principalComment" value={formData.principalComment || ''} onIonChange={handleInputChange} /></IonItem>)}
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
          <IonToast isOpen={toastInfo.show} onDidDismiss={() => setToastInfo({ show: false, message: '', color: 'success' })} message={toastInfo.message} duration={3000} color={toastInfo.color}/>
        </IonContent>
      </IonPage>
    </>
  );
};

export default AdminResultsDashboard;
