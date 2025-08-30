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
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButtons,
  IonBackButton,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { checkmarkDoneOutline } from 'ionicons/icons';
import api from '../../services/api';
import { Student, Subject, Class, Branch, Session, Result } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getSessions } from '../../services/sessionsApi';

type ToastColor = 'success' | 'danger' | 'warning';

interface MarkEntry {
  studentId: string;
  firstCA?: number | string;
  secondCA?: number | string;
  thirdCA?: number | string;
  exam?: number | string;
}

const BulkAddResultsPage: React.FC = () => {
  const { user } = useAuth();

  // Raw Data
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);

  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ show: boolean; message: string; color: ToastColor }>({ show: false, message: '', color: 'success' });

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>(user?.role === 'Branch Admin' ? user.branchId || '' : '');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [ api.get('/classes'), api.get('/subjects'), getSessions() ];
        if (user?.role === 'Super Admin') {
          promises.push(api.get('/branches'));
        }
        const [classesData, subjectsData, sessionsData, branchesData] = await Promise.all(promises);
        setAllClasses(classesData.data.classes || classesData.data || []);
        setAllSubjects(subjectsData.data.subjects || []);
        setAllSessions(sessionsData || []);
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
      loadInitialData();
    }
  }, [user]);

  // Filtered data for dropdowns
  const filteredClasses = useMemo(() => {
    if (!user) return [];
    if (user.role === 'Teacher') return user.classes ? allClasses.filter(c => user.classes.includes(c._id)) : [];
    const branchId = user.role === 'Super Admin' ? selectedBranch : user.branchId;
    if (branchId) return allClasses.filter(c => c.branchId === branchId);
    return user.role === 'Super Admin' ? allClasses : [];
  }, [user, allClasses, selectedBranch]);

  const filteredSubjects = useMemo(() => {
    if(!user) return [];
    if (user.role === 'Teacher') return user.subjects ? allSubjects.filter(s => user.subjects.includes(s._id)) : [];
    return allSubjects;
  }, [user, allSubjects]);

  const filteredSessions = useMemo(() => {
    if (!user) return [];
    const branchId = user.role === 'Super Admin' ? selectedBranch : user.branchId;
    if (branchId) return allSessions.filter(s => !s.branchId || s.branchId === branchId);
    return allSessions;
  }, [user, allSessions, selectedBranch]);

  const academicYears = useMemo(() => [...new Set(filteredSessions.map(s => s.academicYear))].sort().reverse(), [filteredSessions]);
  const availableTerms = useMemo(() => selectedAcademicYear ? [...new Set(filteredSessions.filter(s => s.academicYear === selectedAcademicYear).map(s => s.term))] : [], [filteredSessions, selectedAcademicYear]);


  const fetchStudentsAndResults = useCallback(async () => {
    if (!selectedClass || !selectedSubject || !selectedSessionId) {
      setStudents([]);
      setMarks([]);
      return;
    }
    setLoading(true);
    try {
      const [studentsRes, resultsRes] = await Promise.all([
        api.get(`/students?classId=${selectedClass}`),
        api.get('/results', { params: { classId: selectedClass, subjectId: selectedSubject, sessionId: selectedSessionId } })
      ]);

      const fetchedStudents = studentsRes.data.students || [];
      setStudents(fetchedStudents);

      const resultMap: Record<string, MarkEntry> = {};
      (resultsRes.data.results || resultsRes.data).forEach((res: Result) => {
        const studentIdentifier = typeof res.studentId === 'object' ? res.studentId._id : res.studentId;
        resultMap[studentIdentifier] = {
          studentId: studentIdentifier,
          firstCA: res.firstCA ?? '', secondCA: res.secondCA ?? '', thirdCA: res.thirdCA ?? '', exam: res.exam ?? '',
        };
      });
      const initialMarks = fetchedStudents.map((student: Student) =>
        resultMap[student._id] ? resultMap[student._id] : { studentId: student._id, firstCA: '', secondCA: '', thirdCA: '', exam: '' }
      );
      setMarks(initialMarks);
    } catch (err) {
      console.error('Error fetching students or existing results:', err);
      setToastInfo({ show: true, message: 'Could not load student data.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSubject, selectedSessionId]);

  useEffect(() => {
    fetchStudentsAndResults();
  }, [fetchStudentsAndResults]);


  const handleMarkChange = (studentId: string, field: keyof MarkEntry, value: string) => {
    setMarks((prev) => prev.map((m) => (m.studentId === studentId ? { ...m, [field]: value } : m)));
  };

  const handleSubmitAll = async () => {
    if (!canSubmit) {
      setToastInfo({ show: true, message: 'Please fill all filter fields before submitting.', color: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/results/bulk', {
        classId: selectedClass,
        subjectId: selectedSubject,
        session: selectedAcademicYear,
        term: selectedTerm,
        branchId: user?.role === 'Super Admin' ? selectedBranch : user?.branchId,
        results: marks.map((mark) => ({
          studentId: mark.studentId,
          firstCA: Number(mark.firstCA) || 0,
          secondCA: Number(mark.secondCA) || 0,
          thirdCA: Number(mark.thirdCA) || 0,
          exam: Number(mark.exam) || 0,
        })),
      });
      setToastInfo({ show: true, message: 'Results submitted successfully!', color: 'success' });
      await fetchStudentsAndResults();
    } catch (err: any) {
      console.error('Bulk add failed:', err.response?.data || err.message);
      setToastInfo({ show: true, message: err.response?.data?.message || 'Failed to submit results.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    const sessionObj = filteredSessions.find(s => s.academicYear === selectedAcademicYear && s.term === term);
    setSelectedSessionId(sessionObj?._id || '');
  };

  const canSubmit = selectedClass && selectedSubject && selectedSessionId && students.length > 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/dashboard/results" /></IonButtons>
          <IonTitle>Bulk Add Results</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={loading} message="Please wait..." />
        <IonToast isOpen={toastInfo.show} onDidDismiss={() => setToastInfo({show: false, message: '', color: 'success'})} message={toastInfo.message} duration={3000} color={toastInfo.color} />
        <IonGrid>
          <IonRow>
            {user?.role === 'Super Admin' && (
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Branch</IonLabel>
                  <IonSelect value={selectedBranch} onIonChange={(e) => {setSelectedBranch(e.detail.value); setSelectedClass('');}}>
                    {allBranches.map((b) => (<IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            )}
            <IonCol size-md="3" size="12">
              <IonItem>
                <IonLabel>Class</IonLabel>
                <IonSelect value={selectedClass} onIonChange={(e) => setSelectedClass(e.detail.value)} disabled={user?.role === 'Super Admin' && !selectedBranch}>
                  {filteredClasses.map((c) => (<IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>))}
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol size-md="3" size="12">
              <IonItem>
                <IonLabel>Subject</IonLabel>
                <IonSelect value={selectedSubject} onIonChange={(e) => setSelectedSubject(e.detail.value)}>
                  {filteredSubjects.map((s) => (<IonSelectOption key={s._id} value={s._id}>{s.name}</IonSelectOption>))}
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol size-md="3" size="12">
              <IonItem>
                <IonLabel>Session</IonLabel>
                <IonSelect value={selectedAcademicYear} onIonChange={e => setSelectedAcademicYear(e.detail.value)}>
                  {academicYears.map((session) => (<IonSelectOption key={session} value={session}>{session}</IonSelectOption>))}
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

          {canSubmit && (
            <IonRow>
              <IonCol>
                <div className="ion-padding responsive-table-wrapper">
                  <table className="responsive-table">
                    <thead><tr><th>Student Name</th><th>Admission No</th><th>1st CA</th><th>2nd CA</th><th>3rd CA</th><th>Exam</th><th>Total</th></tr></thead>
                    <tbody>
                      {students.map((student, index) => {
                        const mark = marks.find(m => m.studentId === student._id) || { studentId: student._id };
                        const total = (Number(mark.firstCA) || 0) + (Number(mark.secondCA) || 0) + (Number(mark.thirdCA) || 0) + (Number(mark.exam) || 0);
                        return (
                          <tr key={student._id}>
                            <td data-label="Student Name"><span>{student.userId?.name}</span></td>
                            <td data-label="Admission Number"><span>{student.admissionNumber}</span></td>
                            <td data-label="1st CA"><IonInput type="number" value={mark.firstCA} onIonChange={(e) => handleMarkChange(student._id, 'firstCA', e.detail.value!)} placeholder="0"/></td>
                            <td data-label="2nd CA"><IonInput type="number" value={mark.secondCA} onIonChange={(e) => handleMarkChange(student._id, 'secondCA', e.detail.value!)} placeholder="0"/></td>
                            <td data-label="3rd CA"><IonInput type="number" value={mark.thirdCA} onIonChange={(e) => handleMarkChange(student._id, 'thirdCA', e.detail.value!)} placeholder="0"/></td>
                            <td data-label="Exam"><IonInput type="number" value={mark.exam} onIonChange={(e) => handleMarkChange(student._id, 'exam', e.detail.value!)} placeholder="0"/></td>
                            <td data-label="Total"><span>{total}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <IonButton expand="full" onClick={handleSubmitAll} className="ion-margin-top" disabled={loading}><IonIcon slot="start" icon={checkmarkDoneOutline} />Submit All</IonButton>
                </div>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default BulkAddResultsPage;
