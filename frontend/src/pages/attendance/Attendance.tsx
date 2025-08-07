import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonDatetime,
  IonToast,
} from '@ionic/react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './Attendance.css';

interface Class {
  _id: string;
  name: string;
  branchId: string;
}

interface Student {
  _id: string;
  name: string;
  admissionNumber: string;
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [classLevels, setClassLevels] = useState([]);
  const [selectedClassLevel, setSelectedClassLevel] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString());
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data } = await axios.get('/api/branches');
        setBranches(data.branches || []);
      } catch (error) {
        setToastMessage('Error fetching branches');
        setToastColor('danger');
        setShowToast(true);
      }
    };

    const fetchClassLevels = async () => {
      try {
        const { data } = await axios.get('/api/classlevels');
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

  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedBranch && selectedClassLevel) {
        try {
          const { data } = await axios.get(
            `/api/classes?branchId=${selectedBranch}&classLevel=${selectedClassLevel}`
          );
          setClasses(data.classes || []);
        } catch (error) {
          setToastMessage('Error fetching classes');
          setToastColor('danger');
          setShowToast(true);
        }
      }
    };
    fetchClasses();
  }, [selectedBranch, selectedClassLevel]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedClass) {
        try {
          const { data } = await axios.get(
            `/api/students?classId=${selectedClass}`
          );
          setStudents(data.students || []);
        } catch (error) {
          setToastMessage('Error fetching students');
          setToastColor('danger');
          setShowToast(true);
        }
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    try {
      const attendanceData = students.map(student => ({
        studentId: student._id,
        classId: selectedClass,
        branchId: selectedBranch,
        date,
        status: attendance[student._id] || 'Present',
      }));
      await axios.post('/api/attendance', attendanceData);
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
          <IonDatetime value={date} onIonChange={e => setDate(e.detail.value ? e.detail.value.toString() : '')} />
        </IonItem>
        <table>
          <thead>
            <tr>
              <th>Admission Number</th>
              <th>Student Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id}>
                <td>{student.admissionNumber}</td>
                <td>{student.name}</td>
                <td>
                  <IonSelect
                    value={attendance[student._id] || 'Present'}
                    onIonChange={e => handleAttendanceChange(student._id, e.detail.value)}
                  >
                    <IonSelectOption value="Present">Present</IonSelectOption>
                    <IonSelectOption value="Absent">Absent</IonSelectOption>
                    <IonSelectOption value="Late">Late</IonSelectOption>
                  </IonSelect>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <IonButton expand="full" onClick={submitAttendance} disabled={!selectedClass || students.length === 0}>
          Submit Attendance
        </IonButton>
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
