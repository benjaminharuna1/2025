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
import { getSessions } from '../../services/sessionsApi';
import '../../theme/global.css';

type ToastColor = 'success' | 'danger' | 'warning' | 'primary' | 'secondary' | 'tertiary' | 'light' | 'medium' | 'dark';

interface Filters {
  branchId: string;
  classId: string;
  sessionId: string;
  academicYear: string;
  term: string;
}

const AdminResultsDashboard: React.FC = () => {
  const { user } = useAuth();

  // Raw data from API
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Data for UI
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const [formData, setFormData] = useState<Partial<Result>>({});
  const [loading, setLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ show: boolean; message: string; color: ToastColor }>({ show: false, message: '', color: 'success' });

  const [filters, setFilters] = useState<Filters>({
    branchId: user?.role === 'Branch Admin' ? user.branchId || '' : '',
    classId: '',
    sessionId: '',
    academicYear: '',
    term: '',
  });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'branchId') {
        newFilters.classId = '';
      }
      if (key === 'academicYear') {
        newFilters.term = '';
        newFilters.sessionId = '';
      }
      if (key === 'term') {
        const sessionObj = allSessions.find(s => s.academicYear === newFilters.academicYear && s.term === value);
        newFilters.sessionId = sessionObj?._id || '';
      }
      return newFilters;
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [ getSessions(), api.get('/classes'), api.get('/subjects') ];
        if (user?.role === 'Super Admin') {
          promises.push(api.get('/branches'));
        }
        const [sessionsData, classesData, subjectsData, branchesData] = await Promise.all(promises);
        setAllSessions(sessionsData || []);
        setAllClasses(classesData.data.classes || classesData.data || []);
        setSubjects(subjectsData.data.subjects || []);
        if (branchesData) {
          setAllBranches(branchesData.data.branches || branchesData.data || []);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setToastInfo({ show: true, message: 'Failed to load initial data.', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const filteredClasses = useMemo(() => {
    if (!user) return [];
    const branchId = user.role === 'Super Admin' ? filters.branchId : user.branchId;
    if (branchId) {
      return allClasses.filter(c => c.branchId === branchId);
    }
    if (user.role === 'Teacher') {
        return user.classes ? allClasses.filter(c => user.classes.includes(c._id)) : [];
    }
    return user.role === 'Super Admin' ? allClasses : [];
  }, [user, allClasses, filters.branchId]);

  const filteredSessions = useMemo(() => {
    if (!user) return [];
    const branchId = user.role === 'Super Admin' ? filters.branchId : user.branchId;
    if (branchId) {
      return allSessions.filter(s => !s.branchId || s.branchId === branchId);
    }
    return allSessions;
  }, [user, allSessions, filters.branchId]);

  const academicYears = useMemo(() => [...new Set(filteredSessions.map(s => s.academicYear))].sort().reverse(), [filteredSessions]);
  const availableTerms = useMemo(() => filters.academicYear ? [...new Set(filteredSessions.filter(s => s.academicYear === filters.academicYear).map(s => s.term))] : [], [filteredSessions, filters.academicYear]);

  const fetchResults = useCallback(async () => {
    if (!filters.classId || !filters.academicYear || !filters.term) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        classId: filters.classId,
        session: filters.academicYear,
        term: filters.term,
      });
      const branchId = user?.role === 'Super Admin' ? filters.branchId : user?.branchId;
      if (branchId) {
        params.append('branchId', branchId);
      }
      const { data } = await api.get(`/results?${params.toString()}`);
      setResults(data.results || data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      setToastInfo({ show: true, message: 'Failed to fetch results.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [filters.classId, filters.academicYear, filters.term, filters.branchId, user]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    if (filters.classId) {
      const fetchStudentsInClass = async (classId: string) => {
        try {
          const { data } = await api.get(`/students?classId=${classId}`);
          setStudents(data.students || []);
        } catch (error) {
          console.error('Error fetching students:', error);
        }
      };
      fetchStudentsInClass(filters.classId);
    } else {
      setStudents([]);
    }
  }, [filters.classId]);

  const handleSave = async () => {
    if (!formData.studentId || !formData.subjectId) {
        setToastInfo({ show: true, message: 'Student and Subject are required.', color: 'danger'});
        return;
    }
    setLoading(true);
    try {
      if (selectedResult) {
        await api.put(`/results/${selectedResult._id}`, formData);
      } else {
        await api.post('/results', {
            ...formData,
            classId: filters.classId,
            sessionId: filters.sessionId, // The backend addResult needs sessionId
            session: filters.academicYear,
            term: filters.term,
            branchId: user?.role === 'Super Admin' ? filters.branchId : user?.branchId
        });
      }
      await fetchResults();
      closeModal();
      setToastInfo({ show: true, message: 'Result saved successfully.', color: 'success' });
    } catch (err: any) {
      console.error('Save failed:', err.response?.data || err.message);
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to save result', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;
    setLoading(true);
    try {
      await api.delete(`/results/${id}`);
      await fetchResults();
      setToastInfo({ show: true, message: 'Result deleted successfully.', color: 'success' });
    } catch (err: any) {
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to delete result', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      await api.put(`/results/${id}/approve`);
      await fetchResults();
      setToastInfo({ show: true, message: 'Result approved successfully.', color: 'success' });
    } catch (err: any) {
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to approve result', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevertToDraft = async (id: string) => {
    if (!window.confirm('Are you sure you want to revert this result to Draft?')) return;
    setLoading(true);
    try {
      await api.put(`/results/${id}/revert-to-draft`);
      await fetchResults();
      setToastInfo({ show: true, message: 'Result reverted to draft.', color: 'success' });
    } catch (err: any) {
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to revert result', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleRankResults = async () => {
    if (!filters.classId || !filters.academicYear || !filters.term) return;
    setLoading(true);
    try {
      const branchId = user?.role === 'Super Admin' ? filters.branchId : user?.branchId;
      await api.post('/results/rank', {
        classId: filters.classId,
        session: filters.academicYear,
        term: filters.term,
        branchId,
      });
      await fetchResults();
      setToastInfo({ show: true, message: 'Results ranked successfully!', color: 'success' });
    } catch (err: any) {
      console.error('Ranking failed:', err.response?.data || err.message);
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to rank results', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!filters.classId || !filters.academicYear || !filters.term) {
      setToastInfo({ show: true, message: 'Please select class, session, and term before exporting.', color: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        classId: filters.classId,
        session: filters.academicYear,
        term: filters.term,
      };
      if (user?.role === 'Super Admin') {
        payload.branchId = filters.branchId;
      }
      const response = await api.post('/results/export', payload, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results-${filters.classId}-${filters.academicYear}-${filters.term}.xlsx`);
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
      setToastInfo({ show: true, message: 'Results imported successfully.', color: 'success' });
    } catch (error) {
      console.error('Error importing results:', error);
      setToastInfo({ show: true, message: 'Failed to import results.', color: 'danger' });
    } finally {
        setLoading(false);
    }
  };

  const canPerformActions = filters.classId && filters.academicYear && filters.term;
  const getStudentName = (result: Result) => result.studentId?.userId?.name || 'N/A';
  const getAdmissionNumber = (result: Result) => result.studentId?.admissionNumber || 'N/A';
  const getSubjectName = (result: Result) => result.subjectId?.name || 'N/A';

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
                    <IonSelect value={filters.branchId} onIonChange={e => handleFilterChange('branchId', e.detail.value)}>
                      {allBranches.map((b) => (<IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
              )}
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Class</IonLabel>
                  <IonSelect value={filters.classId} onIonChange={e => handleFilterChange('classId', e.detail.value)} disabled={user?.role === 'Super Admin' && !filters.branchId && allBranches.length > 0}>
                    {filteredClasses.map((c) => (<IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Session</IonLabel>
                  <IonSelect value={filters.academicYear} onIonChange={e => handleFilterChange('academicYear', e.detail.value)}>
                    {academicYears.map((year) => (<IonSelectOption key={year} value={year}>{year}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Term</IonLabel>
                  <IonSelect value={filters.term} onIonChange={e => handleFilterChange('term', e.detail.value)} disabled={!filters.academicYear}>
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
                <IonRouterLink routerLink={`/reports/report-card-preview?classId=${filters.classId}&sessionId=${filters.sessionId}`}><IonButton color="dark" disabled={!canPerformActions}><IonIcon slot="start" icon={documentTextOutline} /> Generate Report Cards</IonButton></IonRouterLink>
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
                        <th>Student</th><th>Admission No.</th><th>Subject</th><th>1st CA</th><th>2nd CA</th><th>3rd CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>Status</th><th>Position</th><th>Actions</th>
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
                {!selectedResult && (
                    <>
                    <IonItem><IonLabel>Student</IonLabel><IonSelect name="studentId" value={formData.studentId} onIonChange={handleInputChange}>{students.map(s => (<IonSelectOption key={s._id} value={s._id}>{s.userId.name} ({s.admissionNumber})</IonSelectOption>))}</IonSelect></IonItem>
                    <IonItem><IonLabel>Subject</IonLabel><IonSelect name="subjectId" value={formData.subjectId} onIonChange={handleInputChange}>{subjects.map(s => (<IonSelectOption key={s._id} value={s._id}>{s.name}</IonSelectOption>))}</IonSelect></IonItem>
                    </>
                )}
                {selectedResult && (
                    <>
                    <IonItem><IonLabel>Student</IonLabel><IonInput readonly value={getStudentName(selectedResult)} /></IonItem>
                    <IonItem><IonLabel>Subject</IonLabel><IonInput readonly value={getSubjectName(selectedResult)} /></IonItem>
                    </>
                )}
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
          <IonToast isOpen={toastInfo.show} onDidDismiss={() => setToastInfo({ ...toastInfo, show: false })} message={toastInfo.message} duration={3000} color={toastInfo.color}/>
        </IonContent>
      </IonPage>
    </>
  );
};

export default AdminResultsDashboard;
