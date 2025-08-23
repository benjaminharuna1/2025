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
import { Student, Subject, Class, Branch } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

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
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState<string>(
    user?.role === 'Super Admin' ? '' : user?.branchId || ''
  );
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    if (user?.role === 'Super Admin') {
      fetchBranches();
    }

    // Auto-select current session
    const sessions = generateSessions();
    if (sessions.length > 0) {
      setSelectedSession(sessions[0]);
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
      selectedSession &&
      selectedTerm
    ) {
      fetchExistingResults();
    }
  }, [students, selectedClass, selectedSubject, selectedSession, selectedTerm]);

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches');
      setBranches(data.branches || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
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

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

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
    setLoading(true);
    try {
      const { data } = await api.get('/results', {
        params: {
          classId: selectedClass,
          subjectId: selectedSubject,
          session: selectedSession,
          term: selectedTerm,
        },
      });

      const resultMap: Record<string, MarkEntry> = {};
      data.forEach((res: any) => {
        resultMap[res.studentId._id] = {
          studentId: res.studentId._id,
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

  const generateSessions = () => {
    const currentYear = new Date().getFullYear();
    const sessions: string[] = [];
    for (let i = currentYear - 1; i <= currentYear + 5; i++) {
      sessions.push(`${i}/${i + 1}`);
    }
    return sessions;
  };

const handleSubmitAll = async () => {
  if (
    !selectedClass ||
    !selectedSubject ||
    !selectedSession ||
    !selectedTerm ||
    (!selectedBranch && user?.role === 'Super Admin')
  ) {
    alert('Please select class, subject, session (and branch if Super Admin)');
    return;
  }

  setLoading(true);

  try {
    // 1️⃣ Submit bulk results (backend will upsert)
    await api.post('/results/bulk', {
      classId: selectedClass,
      subjectId: selectedSubject,
      session: selectedSession,
      term: selectedTerm,
      branchId: user?.role === 'Super Admin' ? selectedBranch : undefined,
      results: marks.map((mark) => ({
        studentId: mark.studentId,
        firstCA: Number(mark.firstCA) || 0,
        secondCA: Number(mark.secondCA) || 0,
        thirdCA: Number(mark.thirdCA) || 0,
        exam: Number(mark.exam) || 0,
      })),
    });

    // 2️⃣ Refetch results for current filters
    const { data } = await api.get('/results', {
      params: {
        classId: selectedClass,
        subjectId: selectedSubject,
        session: selectedSession,
        term: selectedTerm,
      },
    });

    // 3️⃣ Update marks array with returned data
    const updatedMarks = students.map((student) => {
      const existingResult = data.find(
        (r: any) => r.studentId._id === student._id
      );
      return {
        studentId: student._id,
        firstCA: existingResult?.firstCA ?? '',
        secondCA: existingResult?.secondCA ?? '',
        thirdCA: existingResult?.thirdCA ?? '',
        exam: existingResult?.exam ?? '',
      };
    });

    setMarks(updatedMarks);

    alert('Results submitted and updated successfully!');
  } catch (err: any) {
    console.error('Bulk add failed:', err.response?.data || err.message);
    alert(err.response?.data?.message || 'Failed to submit results.');
  } finally {
    setLoading(false);
  }
};

  const canSubmit =
    (user?.role !== 'Super Admin' || selectedBranch) &&
    selectedClass &&
    selectedSubject &&
    selectedSession &&
    selectedTerm &&
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
                  onIonChange={(e) => setSelectedSession(e.detail.value)}
                >
                  {generateSessions().map((session) => (
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
                  onIonChange={(e) => setSelectedTerm(e.detail.value)}
                >
                  <IonSelectOption value="First">First</IonSelectOption>
                  <IonSelectOption value="Second">Second</IonSelectOption>
                  <IonSelectOption value="Third">Third</IonSelectOption>
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
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr key={student._id}>
                          <td>{student.userId?.name}</td>
                          <td>{student.admissionNumber}</td>
                          <td>
                            <IonInput
                              type="number"
                              value={marks[index]?.firstCA}
                              onIonChange={(e) =>
                                handleMarkChange(
                                  student._id,
                                  'firstCA',
                                  e.detail.value!
                                )
                              }
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <IonInput
                              type="number"
                              value={marks[index]?.secondCA}
                              onIonChange={(e) =>
                                handleMarkChange(
                                  student._id,
                                  'secondCA',
                                  e.detail.value!
                                )
                              }
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <IonInput
                              type="number"
                              value={marks[index]?.thirdCA}
                              onIonChange={(e) =>
                                handleMarkChange(
                                  student._id,
                                  'thirdCA',
                                  e.detail.value!
                                )
                              }
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <IonInput
                              type="number"
                              value={marks[index]?.exam}
                              onIonChange={(e) =>
                                handleMarkChange(
                                  student._id,
                                  'exam',
                                  e.detail.value!
                                )
                              }
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))}
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
