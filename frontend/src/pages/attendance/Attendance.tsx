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
} from '@ionic/react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Branch, ClassLevel, Class, Student } from '../../types';
import './Attendance.css';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [selectedClassLevel, setSelectedClassLevel] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
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
    } else {
      setSelectedBranch(user?.branchId || '');
    }
    fetchClassLevels();
  }, [user]);

  // fetch classes when branch & classLevel selected
  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedBranch && selectedClassLevel) {
        setLoading(true);
        try {
          const { data } = await api.get(
            `/classes?branchId=${selectedBranch}&classLevel=${selectedClassLevel}`
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
  }, [selectedBranch, selectedClassLevel]);

  // fetch students when class selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass) {
        setLoading(true);
        try {
          const { data } = await api.get(`/students?classId=${selectedClass}`);
          setStudents(data.students || []);

          // initialize attendance with "Present"
          const initialAttendance: { [key: string]: string } = {};
          data.students.forEach((s: Student) => {
            initialAttendance[s._id] = 'Present';
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
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  }, []);

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
        date,
        status: attendance[student._id] || 'Present',
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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Attendance</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Attendance</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonItem>
          <IonLabel>Branch</IonLabel>
          <IonSelect
            value={selectedBranch}
            onIonChange={e => setSelectedBranch(e.detail.value)}
            disabled={user?.role !== 'Super Admin'}
          >
            {branches.map(b => (
              <IonSelectOption key={b._id} value={b._id}>
                {b.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Class Level</IonLabel>
          <IonSelect
            value={selectedClassLevel}
            onIonChange={e => setSelectedClassLevel(e.detail.value)}
            disabled={user?.role === 'Teacher'}
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
            disabled={user?.role === 'Teacher'}
          >
            {classes.map(c => (
              <IonSelectOption key={c._id} value={c._id}>
                {c.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Date</IonLabel>
          <IonDatetime
            value={date}
            onIonChange={e => {
              const value = e.detail.value;
              if (typeof value === 'string') {
                setDate(value);
              } else {
                setDate(new Date().toISOString()); // fallback
              }
            }}
          />
        </IonItem>

        <IonGrid>
          <IonRow>
            <IonCol><strong>Admission Number</strong></IonCol>
            <IonCol><strong>Student Name</strong></IonCol>
            <IonCol><strong>Status</strong></IonCol>
          </IonRow>
          {students.map(student => (
            <IonRow key={student._id}>
              <IonCol>{student.admissionNumber}</IonCol>
              <IonCol>{student.name}</IonCol>
              <IonCol>
                <IonSelect
                  value={attendance[student._id] || 'Present'}
                  onIonChange={e => handleAttendanceChange(student._id, e.detail.value)}
                >
                  <IonSelectOption value="Present">Present</IonSelectOption>
                  <IonSelectOption value="Absent">Absent</IonSelectOption>
                  <IonSelectOption value="Late">Late</IonSelectOption>
                </IonSelect>
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
  );
};

export default Attendance;
