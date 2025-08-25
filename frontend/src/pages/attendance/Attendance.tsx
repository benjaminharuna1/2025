import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonDatetime,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonButtons,
  IonMenuButton,
  IonInput,
} from '@ionic/react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Branch, ClassLevel, Class, Student, Subject } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './Attendance.css';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [selectedClassLevel, setSelectedClassLevel] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<{ [key: string]: { status: string; remarks: string } }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('');
  const [loading, setLoading] = useState(false);

  // fetch branches and class levels
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data } = await api.get('/branches');
        setBranches(data.branches || []);
      } catch (error) {
        setToastMessage('Error fetching branches');
        setToastColor('danger');
        setShowToast(true);
      }
    };

    const fetchClassLevels = async () => {
      try {
        const { data } = await api.get('/classlevels');
        setClassLevels(data.classLevels || []);
      } catch (error) {
        setToastMessage('Error fetching class levels');
        setToastColor('danger');
        setShowToast(true);
      }
    };

    if (user?.role === 'Super Admin') {
      fetchBranches();
    } else if (user?.branchId) {
      setSelectedBranch(user.branchId);
    }
    fetchClassLevels();
  }, [user]);

  // fetch classes when branch selected
  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedBranch) {
        setLoading(true);
        try {
          // The backend getClasses controller doesn't filter by classLevel, only branch
          const { data } = await api.get(
            `/classes?branchId=${selectedBranch}`
          );
          setClasses(data.classes || []);
        } catch (error) {
          setToastMessage('Error fetching classes');
          setToastColor('danger');
          setShowToast(true);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchClasses();
  }, [selectedBranch]);

  // fetch subjects when class selected
  useEffect(() => {
    const fetchSubjects = async () => {
      if (selectedClass) {
        setLoading(true);
        try {
          const { data } = await api.get(`/subjects?classId=${selectedClass}`);
          setSubjects(data.subjects || []);
        } catch (error) {
          setToastMessage('Error fetching subjects');
          setToastColor('danger');
          setShowToast(true);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSubjects();
  }, [selectedClass]);

  // fetch students when class selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass) {
        setLoading(true);
        try {
          const { data } = await api.get(`/students?classId=${selectedClass}`);
          setStudents(data.students || []);

          // initialize attendance with "Present"
          const initialAttendance: { [key: string]: { status: string; remarks: string } } = {};
          data.students.forEach((s: Student) => {
            initialAttendance[s._id] = { status: 'Present', remarks: '' };
          });
          setAttendance(initialAttendance);
        } catch (error) {
          setToastMessage('Error fetching students');
          setToastColor('danger');
          setShowToast(true);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const handleAttendanceChange = useCallback((studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  }, []);

  const handleRemarkChange = useCallback((studentId: string, remarks: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: { ...prev[studentId], remarks } }));
  }, []);

  const markAll = (status: 'Present' | 'Absent') => {
    const newAttendance: { [key: string]: { status: string; remarks: string } } = {};
    students.forEach(s => {
      newAttendance[s._id] = { ...attendance[s._id], status };
    });
    setAttendance(newAttendance);
  };

  const submitAttendance = async () => {
    if (!selectedBranch || !selectedClass) {
      setToastMessage('Please select branch and class before submitting');
      setToastColor('warning');
      setShowToast(true);
      return;
    }

    try {
      const attendanceData = students.map(student => ({
        studentId: student._id,
        classId: selectedClass,
        branchId: selectedBranch,
        date: date.split('T')[0], // Ensure YYYY-MM-DD
        status: attendance[student._id]?.status || 'Present',
        remarks: attendance[student._id]?.remarks || '',
        ...(selectedSubject && { subjectId: selectedSubject }),
      }));
      await api.post('/attendance', attendanceData);
      setToastMessage('Attendance submitted successfully');
      setToastColor('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error submitting attendance');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  if (!user || !['Super Admin', 'Branch Admin', 'Teacher'].includes(user.role)) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Attendance</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p>You are not authorized to view this page.</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Take Attendance</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Take Attendance</IonTitle>
            </IonToolbar>
          </IonHeader>

          {user?.role === 'Super Admin' && (
            <IonItem>
              <IonLabel>Branch</IonLabel>
              <IonSelect
                value={selectedBranch}
                onIonChange={e => setSelectedBranch(e.detail.value)}
              >
                {branches.map(b => (
                  <IonSelectOption key={b._id} value={b._id}>
                    {b.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          )}

          <IonItem>
            <IonLabel>Class Level</IonLabel>
            <IonSelect
              value={selectedClassLevel}
              onIonChange={e => setSelectedClassLevel(e.detail.value)}
            >
              {classLevels.map(cl => (
                <IonSelectOption key={cl._id} value={cl._id}>
                  {cl.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Class</IonLabel>
            <IonSelect
              value={selectedClass}
              onIonChange={e => setSelectedClass(e.detail.value)}
            >
              {classes.map(c => (
                <IonSelectOption key={c._id} value={c._id}>
                  {c.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Subject</IonLabel>
            <IonSelect
              value={selectedSubject}
              onIonChange={e => setSelectedSubject(e.detail.value)}
            >
              <IonSelectOption value="">General</IonSelectOption>
              {subjects.map(s => (
                <IonSelectOption key={s._id} value={s._id}>
                  {s.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Date</IonLabel>
            <IonDatetime
              displayFormat="YYYY-MM-DD"
              value={date}
              onIonChange={e => setDate(e.detail.value!)}
            />
          </IonItem>

          <IonGrid>
            <IonRow className="ion-align-items-center">
              <IonCol size="6">
                <IonButton size="small" onClick={() => markAll('Present')}>Mark All Present</IonButton>
                <IonButton size="small" color="light" onClick={() => markAll('Absent')}>Mark All Absent</IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol><strong>Student</strong></IonCol>
              <IonCol><strong>Status</strong></IonCol>
              <IonCol><strong>Remarks</strong></IonCol>
            </IonRow>
            {students.map(student => (
              <IonRow key={student._id} className="ion-align-items-center">
                <IonCol>{student.name}</IonCol>
                <IonCol>
                  <IonSelect
                    value={attendance[student._id]?.status || 'Present'}
                    onIonChange={e => handleAttendanceChange(student._id, e.detail.value)}
                  >
                    <IonSelectOption value="Present">Present</IonSelectOption>
                    <IonSelectOption value="Absent">Absent</IonSelectOption>
                    <IonSelectOption value="Late">Late</IonSelectOption>
                    <IonSelectOption value="Excused">Excused</IonSelectOption>
                  </IonSelect>
                </IonCol>
                <IonCol>
                  <IonInput
                    value={attendance[student._id]?.remarks || ''}
                    onIonChange={e => handleRemarkChange(student._id, e.detail.value!)}
                    placeholder="Optional"
                  />
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>

          <IonButton expand="full" onClick={submitAttendance} disabled={!selectedClass || students.length === 0}>
            Submit Attendance
          </IonButton>

          <IonLoading isOpen={loading} message="Loading..." />

          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={2000}
            color={toastColor}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default Attendance;
