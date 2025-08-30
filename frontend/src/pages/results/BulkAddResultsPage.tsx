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
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButtons,
  IonBackButton,
  IonLoading,
} from '@ionic/react';
import { checkmarkDoneOutline } from 'ionicons/icons';
import api from '../../services/api';
import { Student, Subject, Class, Branch, Session } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { getSessions } from '../../services/sessionsApi';
import { IonToast } from '@ionic/react';

interface MarkEntry {
  studentId: string;
  firstCA?: number | string;
  secondCA?: number | string;
  thirdCA?: number | string;
  exam?: number | string;
}

const BulkAddResultsPage: React.FC = () => {
  const { user } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState<{ show: boolean; message: string; color: string }>({ show: false, message: '', color: '' });

  const [selectedBranch, setSelectedBranch] = useState<string>(
    user?.role === 'Super Admin' ? '' : user?.branchId || ''
  );
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const promises = [
          api.get('/classes'),
          api.get('/subjects'),
          getSessions(),
        ];
        if (user?.role === 'Super Admin') {
          promises.push(api.get('/branches'));
        }
        const [classesData, subjectsData, sessionsData, branchesData] = await Promise.all(promises);

        setClasses(classesData.data.classes || classesData.data || []);
        setSubjects(subjectsData.data.subjects || subjectsData.data || []);
        setSessions(sessionsData);
        if (branchesData) {
          setBranches(branchesData.data.branches || branchesData.data || []);
        }

      } catch (error) {
        console.error('Error fetching initial data:', error);
        setShowToast({ show: true, message: 'Failed to load initial data.', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) fetchStudentsInClass(selectedClass);
    else setStudents([]);
  }, [selectedClass]);

  useEffect(() => {
    if (
      students.length > 0 &&
      selectedClass &&
      selectedSubject &&
      selectedSessionId
    ) {
      fetchExistingResults();
    }
  }, [students, selectedClass, selectedSubject, selectedSessionId]);

  const fetchStudentsInClass = async (classId: string) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/students?classId=${classId}`);
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingResults = async () => {
    if (!selectedSessionId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/results', {
        params: {
          classId: selectedClass,
          subjectId: selectedSubject,
          sessionId: selectedSessionId,
        },
      });

      const resultMap: Record<string, MarkEntry> = {};
      (data.results || data).forEach((res: any) => {
        const studentIdentifier = typeof res.studentId === 'object' ? res.studentId._id : res.studentId;
        resultMap[studentIdentifier] = {
          studentId: studentIdentifier,
          firstCA: res.firstCA ?? '',
          secondCA: res.secondCA ?? '',
          thirdCA: res.thirdCA ?? '',
          exam: res.exam ?? '',
        };
      });

      const initialMarks = students.map((student) =>
        resultMap[student._id]
          ? resultMap[student._id]
          : { studentId: student._id, firstCA: '', secondCA: '', thirdCA: '', exam: '' }
      );

      setMarks(initialMarks);
    } catch (err) {
      console.error('Error fetching existing results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (
    studentId: string,
    field: keyof MarkEntry,
    value: string
  ) => {
    setMarks((prev) =>
      prev.map((m) => (m.studentId === studentId ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmitAll = async () => {
    if (!selectedSessionId) {
      setShowToast({ show: true, message: 'A valid session and term must be selected.', color: 'danger' });
      return;
    }

    if (
      !selectedClass ||
      !selectedSubject ||
      (!selectedBranch && user?.role === 'Super Admin')
    ) {
      setShowToast({ show: true, message: 'Please select class, subject, and session (and branch if Super Admin).', color: 'warning' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/results/bulk', {
        classId: selectedClass,
        subjectId: selectedSubject,
        sessionId: selectedSessionId,
        branchId: user?.role === 'Super Admin' ? selectedBranch : undefined,
        results: marks.map((mark) => ({
          studentId: mark.studentId,
          firstCA: Number(mark.firstCA) || 0,
          secondCA: Number(mark.secondCA) || 0,
          thirdCA: Number(mark.thirdCA) || 0,
          exam: Number(mark.exam) || 0,
        })),
      });

      setShowToast({ show: true, message: 'Results submitted successfully!', color: 'success' });
      fetchExistingResults(); // Refetch to show any calculated fields
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
          message: err.response?.data?.message || 'Failed to submit results.',
          color: 'danger',
        });
      }
      console.error('Bulk add failed:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const academicYears = [...new Set(sessions.map(s => s.academicYear))].sort().reverse();
  const availableTerms = selectedSession ? [...new Set(sessions.filter(s => s.academicYear === selectedSession).map(s => s.term))] : [];

  const handleSessionChange = (e: any) => {
    setSelectedSession(e.detail.value);
    setSelectedTerm('');
    setSelectedSessionId('');
  };

  const handleTermChange = (e: any) => {
    const term = e.detail.value;
    setSelectedTerm(term);
    const sessionObj = sessions.find(s => s.academicYear === selectedSession && s.term === term);
    setSelectedSessionId(sessionObj?._id || '');
  };

  const canSubmit =
    (user?.role !== 'Super Admin' || selectedBranch) &&
    selectedClass &&
    selectedSubject &&
    selectedSessionId &&
    students.length > 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard/results" />
          </IonButtons>
          <IonTitle>Bulk Add Results</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={loading} message="Please wait..." />
        <IonGrid>
          <IonRow>
            {user?.role === 'Super Admin' && (
              <IonCol size-md="3" size="12">
                <IonItem>
                  <IonLabel>Branch</IonLabel>
                  <IonSelect
                    value={selectedBranch}
                    onIonChange={(e) => setSelectedBranch(e.detail.value)}
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
                <IonLabel>Subject</IonLabel>
                <IonSelect
                  value={selectedSubject}
                  onIonChange={(e) => setSelectedSubject(e.detail.value)}
                >
                  {subjects.map((s) => (
                    <IonSelectOption key={s._id} value={s._id}>
                      {s.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol size-md="3" size="12">
              <IonItem>
                <IonLabel>Session</IonLabel>
                <IonSelect
                  value={selectedSession}
                  onIonChange={handleSessionChange}
                >
                  {academicYears.map((session) => (
                    <IonSelectOption key={session} value={session}>
                      {session}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol size-md="3" size="12">
              <IonItem>
                <IonLabel>Term</IonLabel>
                <IonSelect
                  value={selectedTerm}
                  onIonChange={handleTermChange}
                  disabled={!selectedSession}
                >
                  {availableTerms.map((term) => (
                    <IonSelectOption key={term} value={term}>
                      {term}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>

          {canSubmit && (
            <IonRow>
              <IonCol>
                <div className="ion-padding">
                  <table className="responsive-table">
  <thead>
    <tr>
      <th>Student Name</th>
      <th>Admission No</th>
      <th>1st CA</th>
      <th>2nd CA</th>
      <th>3rd CA</th>
      <th>Exam</th>
      <th>Total</th> {/* New column */}
    </tr>
  </thead>
  <tbody>
    {students.map((student, index) => {
      const total =
        (Number(marks[index]?.firstCA) || 0) +
        (Number(marks[index]?.secondCA) || 0) +
        (Number(marks[index]?.thirdCA) || 0) +
        (Number(marks[index]?.exam) || 0);

      return (
        <tr key={student._id}>
          <td data-label="Student Name">
            <span>{student.userId?.name}</span>
          </td>
          <td data-label="Admission Number">
            <span>{student.admissionNumber}</span>
          </td>
          <td data-label="1st CA">
            <IonInput
              type="number"
              value={marks[index]?.firstCA}
              onIonChange={(e) =>
                handleMarkChange(student._id, 'firstCA', e.detail.value!)
              }
              placeholder="0"
            />
          </td>
          <td data-label="2nd CA">
            <IonInput
              type="number"
              value={marks[index]?.secondCA}
              onIonChange={(e) =>
                handleMarkChange(student._id, 'secondCA', e.detail.value!)
              }
              placeholder="0"
            />
          </td>
          <td data-label="3rd CA">
            <IonInput
              type="number"
              value={marks[index]?.thirdCA}
              onIonChange={(e) =>
                handleMarkChange(student._id, 'thirdCA', e.detail.value!)
              }
              placeholder="0"
            />
          </td>
          <td data-label="Exam">
            <IonInput
              type="number"
              value={marks[index]?.exam}
              onIonChange={(e) =>
                handleMarkChange(student._id, 'exam', e.detail.value!)
              }
              placeholder="0"
            />
          </td>
          <td data-label="Total">
            <span>{total}</span> {/* Live computed total */}
          </td>
        </tr>
      );
    })}
  </tbody>
</table>

                  <IonButton
                    expand="full"
                    onClick={handleSubmitAll}
                    className="ion-margin-top"
                    disabled={loading}
                  >
                    <IonIcon slot="start" icon={checkmarkDoneOutline} />
                    Submit All
                  </IonButton>
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
