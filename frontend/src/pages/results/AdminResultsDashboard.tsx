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
import {
  add,
  create,
  trash,
  cloudUploadOutline,
  checkmarkCircleOutline,
  ribbonOutline,
  downloadOutline,
  documentTextOutline,
} from 'ionicons/icons';
import api from '../../services/api';
import { Result, Student, Subject, Class, Branch, User } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import { useAuth } from '../../contexts/AuthContext'; // ✅ useAuth from your AuthContext

const API_URL = import.meta.env.VITE_API_URL;

const AdminResultsDashboard: React.FC = () => {
  const { user } = useAuth(); // ✅ logged in user

  const [results, setResults] = useState<Result[]>([]);
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

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<'' | 'First' | 'Second' | 'Third'>('');

  useEffect(() => {
    if (user?.role === 'Super Admin') {
      fetchBranches();
    }
    fetchClasses();
    fetchSubjects();
  }, [user]);

  useEffect(() => {
    if (selectedClass) fetchStudentsInClass(selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSession && selectedTerm) {
      fetchResults();
    } else {
      setResults([]);
    }
  }, [selectedClass, selectedSession, selectedTerm, formData.branchId, user]);

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches');
      setBranches(data.branches || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const branchId =
        user?.role === 'Super Admin'
          ? (formData.branchId as string)
          : user?.branchId || '';

      const params = new URLSearchParams({
        classId: selectedClass,
        session: selectedSession,
        term: selectedTerm,
        branchId,
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
      const payload = {
        ...formData,
        firstCA: Number(formData.firstCA),
        secondCA: Number(formData.secondCA),
        thirdCA: Number(formData.thirdCA),
        exam: Number(formData.exam),
        branchId:
          user?.role === 'Super Admin'
            ? formData.branchId
            : user?.branchId || '',
      };

      if (selectedResult) {
        await api.put(`/results/${selectedResult._id}`, payload);
      } else {
        await api.post('/results', payload);
      }
      fetchResults();
      closeModal();
    } catch (err: any) {
      console.error('Save failed:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to save result');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await api.delete(`/results/${id}`);
        fetchResults();
      } catch (err: any) {
        console.error('Delete failed:', err.response?.data || err.message);
        alert(err.response?.data?.message || 'Failed to delete result');
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/results/${id}/approve`);
      fetchResults();
    } catch (err: any) {
      console.error('Approval failed:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to approve result');
    }
  };

  const handleRankResults = async () => {
    setLoading(true);
    try {
      const branchId =
        user?.role === 'Super Admin'
          ? (formData.branchId as string)
          : user?.branchId || '';

      await api.post('/results/rank', {
        classId: selectedClass,
        session: selectedSession,
        term: selectedTerm,
        branchId,
      });
      alert('Results ranked successfully!');
      fetchResults();
    } catch (err: any) {
      console.error('Ranking failed:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to rank results');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const branchId =
      user?.role === 'Super Admin'
        ? (formData.branchId as string)
        : user?.branchId || '';

    const params = new URLSearchParams({
      classId: selectedClass,
      session: selectedSession,
      term: selectedTerm,
      branchId,
    }).toString();

    window.open(`${API_URL}/results/export?${params}`, '_blank');
  };

   const openModal = (result: Result | null = null) => {
    const selectedClassObj = classes.find((c) => c._id === selectedClass);
    setSelectedResult(result);
    setFormData(
      result
        ? { ...result }
        : {
            classId: selectedClass,
            branchId: (selectedClassObj?.branchId as string) || '',
            session: selectedSession,
            term: selectedTerm || 'First', // ✅ defaults safely
          }
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
    try {
      await api.post('/results/import', importData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchResults();
      setShowImportModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error importing results:', error);
    }
  };

  const canPerformActions = selectedClass && selectedSession && selectedTerm;

  const getStudentName = (result: Result) => {
    if (typeof result.studentId === 'object' && result.studentId.name)
      return result.studentId.name;
    const student = students.find((s) => s._id === result.studentId);
    return student ? student.userId.name : 'N/A';
  };

  const getAdmissionNumber = (result: Result) => {
    if (typeof result.studentId === 'object' && result.studentId.admissionNumber)
      return result.studentId.admissionNumber;
    const student = students.find((s) => s._id === result.studentId);
    return student ? student.admissionNumber : 'N/A';
  };

  const getSubjectName = (result: Result) => {
    if (typeof result.subjectId === 'object' && result.subjectId.name)
      return result.subjectId.name;
    const subject = subjects.find((s) => s._id === result.subjectId);
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
              {/* Branch filter only for Super Admin */}
              {user?.role === 'Super Admin' && (
                <IonCol size-md="3" size="12">
                  <IonItem>
                    <IonLabel>Branch</IonLabel>
                    <IonSelect
                      value={formData.branchId as string}
                      onIonChange={(e) =>
                        setFormData({ ...formData, branchId: e.detail.value })
                      }
                    >
                      {branches.map((b) => (
                        <IonSelectOption key={b._id} value={b._id}>
                          {b.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
              )}

              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Class</IonLabel>
                  <IonSelect
                    value={selectedClass}
                    onIonChange={(e) => setSelectedClass(e.detail.value)}
                  >
                    {classes.map((c) => (
                      <IonSelectOption key={c._id} value={c._id}>
                        {c.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>

              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Session</IonLabel>
                  <IonInput
                    value={selectedSession}
                    onIonChange={(e) => setSelectedSession(e.detail.value!)}
                    placeholder="e.g. 2024/2025"
                  />
                </IonItem>
              </IonCol>

              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Term</IonLabel>
                  <IonSelect
                    value={selectedTerm}
                    onIonChange={(e) =>
                      setSelectedTerm(e.detail.value as 'First' | 'Second' | 'Third')
                    }
                  >
                    <IonSelectOption value="First">First</IonSelectOption>
                    <IonSelectOption value="Second">Second</IonSelectOption>
                    <IonSelectOption value="Third">Third</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                <IonButton
                  onClick={() => openModal()}
                  disabled={!canPerformActions}
                >
                  <IonIcon slot="start" icon={add} />
                  Add Result
                </IonButton>
                <IonRouterLink routerLink="/results/bulk-add">
                  <IonButton>
                    <IonIcon slot="start" icon={documentTextOutline} />
                    Bulk Add
                  </IonButton>
                </IonRouterLink>
                <IonButton
                  onClick={() => setShowImportModal(true)}
                  color="secondary"
                >
                  <IonIcon slot="start" icon={cloudUploadOutline} />
                  Import
                </IonButton>
                <IonButton
                  onClick={handleRankResults}
                  color="tertiary"
                  disabled={!canPerformActions}
                >
                  <IonIcon slot="start" icon={ribbonOutline} />
                  Rank Results
                </IonButton>
                <IonButton
                  onClick={handleExport}
                  color="success"
                  disabled={!canPerformActions}
                >
                  <IonIcon slot="start" icon={downloadOutline} />
                  Export
                </IonButton>
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
                          <td>{getStudentName(result)}</td>
                          <td>{getAdmissionNumber(result)}</td>
                          <td>{getSubjectName(result)}</td>
                          <td>{result.firstCA}</td>
                          <td>{result.secondCA}</td>
                          <td>{result.thirdCA}</td>
                          <td>{result.exam}</td>
                          <td>{result.marks}</td>
                          <td>{result.grade}</td>
                          <td>{result.status}</td>
                          <td>{result.position ?? 'N/A'}</td>
                          <td>
                            {result.status === 'Draft' && (
                              <>
                                <IonButton
                                  size="small"
                                  onClick={() => handleApprove(result._id)}
                                >
                                  <IonIcon
                                    slot="icon-only"
                                    icon={checkmarkCircleOutline}
                                  />
                                </IonButton>
                                <IonButton
                                  size="small"
                                  onClick={() => openModal(result)}
                                >
                                  <IonIcon slot="icon-only" icon={create} />
                                </IonButton>
                                <IonButton
                                  size="small"
                                  color="danger"
                                  onClick={() => handleDelete(result._id)}
                                >
                                  <IonIcon slot="icon-only" icon={trash} />
                                </IonButton>
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
          {/* Add/Edit Modal */}
<IonModal isOpen={showModal} onDidDismiss={closeModal}>
  <IonCard>
    <IonCardHeader>
      <IonCardTitle>{selectedResult ? 'Edit' : 'Add'} Result</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      {/* Branch (read-only except for Super Admin when adding new) */}
      {user?.role === 'Super Admin' && !selectedResult ? (
        <IonItem>
          <IonLabel>Branch</IonLabel>
          <IonSelect
            name="branchId"
            value={formData.branchId as string}
            onIonChange={handleSelectChange}
          >
            {branches.map((b) => (
              <IonSelectOption key={b._id} value={b._id}>
                {b.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      ) : (
        <IonItem>
          <IonLabel>Branch</IonLabel>
          <IonInput
            readonly
            value={
              branches.find((b) => b._id === formData.branchId)?.name || ''
            }
          />
        </IonItem>
      )}

      {/* Student (read-only) */}
      <IonItem>
        <IonLabel>Student</IonLabel>
        <IonInput
          readonly
          value={
            typeof formData.studentId === 'object' && formData.studentId?.name
              ? formData.studentId.name
              : students.find((s) => s._id === formData.studentId)?.userId
                  ?.name || ''
          }
        />
      </IonItem>

      {/* Subject (read-only) */}
      <IonItem>
        <IonLabel>Subject</IonLabel>
        <IonInput
          readonly
          value={
            typeof formData.subjectId === 'object' && formData.subjectId?.name
              ? formData.subjectId.name
              : subjects.find((s) => s._id === formData.subjectId)?.name || ''
          }
        />
      </IonItem>

      {/* Editable marks */}
      <IonItem>
        <IonLabel position="floating">First CA</IonLabel>
        <IonInput
          name="firstCA"
          type="number"
          value={formData.firstCA || ''}
          onIonChange={handleInputChange}
        />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">Second CA</IonLabel>
        <IonInput
          name="secondCA"
          type="number"
          value={formData.secondCA || ''}
          onIonChange={handleInputChange}
        />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">Third CA</IonLabel>
        <IonInput
          name="thirdCA"
          type="number"
          value={formData.thirdCA || ''}
          onIonChange={handleInputChange}
        />
      </IonItem>
      <IonItem>
        <IonLabel position="floating">Exam</IonLabel>
        <IonInput
          name="exam"
          type="number"
          value={formData.exam || ''}
          onIonChange={handleInputChange}
        />
      </IonItem>

      {/* Total (read-only) */}
      <IonItem>
        <IonLabel>Total Marks</IonLabel>
        <IonInput
          readonly
          value={
            (Number(formData.firstCA) || 0) +
            (Number(formData.secondCA) || 0) +
            (Number(formData.thirdCA) || 0) +
            (Number(formData.exam) || 0)
          }
        />
      </IonItem>

      {/* Comments */}
      <IonItem>
        <IonLabel position="floating">Teacher Comment</IonLabel>
        <IonInput
          name="teacherComment"
          value={formData.teacherComment || ''}
          onIonChange={handleInputChange}
        />
      </IonItem>
      {['Super Admin', 'Branch Admin'].includes(user.role) && (
        <IonItem>
          <IonLabel position="floating">Principal Comment</IonLabel>
          <IonInput
            name="principalComment"
            value={formData.principalComment || ''}
            onIonChange={handleInputChange}
          />
        </IonItem>
      )}

      <IonButton expand="block" onClick={handleSave}>
        Save
      </IonButton>
      <IonButton expand="block" color="medium" onClick={closeModal}>
        Cancel
      </IonButton>
    </IonCardContent>
  </IonCard>
</IonModal>


          {/* Import Modal */}
          <IonModal
            isOpen={showImportModal}
            onDidDismiss={() => setShowImportModal(false)}
          >
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Import Results</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <input type="file" onChange={handleFileChange} />
                <IonButton expand="block" onClick={handleImport}>
                  Import
                </IonButton>
                <IonButton
                  expand="block"
                  color="medium"
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>
        </IonContent>
      </IonPage>
    </>
  );
};

export default AdminResultsDashboard;
