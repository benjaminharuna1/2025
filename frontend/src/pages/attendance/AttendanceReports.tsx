import React, { useState, useEffect } from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonToast,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Branch, Class, Student, Subject, Attendance } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';

import { Branch, Class, Student, Subject, Attendance, ClassLevel } from '../../types';

const AttendanceReports: React.FC = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [selectedClassLevel, setSelectedClassLevel] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('');

  // Fetch initial dropdown data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (user?.role === 'Super Admin') {
          const branchesRes = await api.get('/branches');
          setBranches(branchesRes.data.branches || []);
        } else if (user?.branchId) {
          setSelectedBranch(user.branchId);
        }
        const classLevelsRes = await api.get('/classlevels');
        setClassLevels(classLevelsRes.data.classLevels || []);
      } catch (error) {
        console.error('Error fetching initial data', error);
      }
    };
    fetchInitialData();
  }, [user]);

  // Fetch classes when branch changes
  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedBranch) {
        try {
          const { data } = await api.get(`/classes?branchId=${selectedBranch}`);
          setClasses(data.classes || []);
        } catch (error) {
          console.error('Error fetching classes', error);
        }
      }
    };
    fetchClasses();
  }, [selectedBranch]);

  // Fetch students and subjects when class changes
  useEffect(() => {
    const fetchStudentsAndSubjects = async () => {
      if (selectedClass) {
        try {
          const [studentsRes, subjectsRes] = await Promise.all([
            api.get(`/students?classId=${selectedClass}`),
            api.get(`/subjects?classId=${selectedClass}`),
          ]);
          setStudents(studentsRes.data.students || []);
          setSubjects(subjectsRes.data.subjects || []);
        } catch (error) {
          console.error('Error fetching students or subjects', error);
        }
      }
    };
    fetchStudentsAndSubjects();
  }, [selectedClass]);

  const handleFetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBranch) params.append('branchId', selectedBranch);
      if (selectedClassLevel) params.append('classLevelId', selectedClassLevel);
      if (selectedClass) params.append('classId', selectedClass);
      if (selectedStudent) params.append('studentId', selectedStudent);
      if (selectedSubject) params.append('subjectId', selectedSubject);
      if (fromDate) params.append('date', fromDate); // Using 'date' for single day filter for detailed view

      const detailedRes = await api.get(`/attendance?${params.toString()}`);
      setAttendanceRecords(detailedRes.data.attendance || []);

      // For summary, we might need a date range
      const summaryParams = new URLSearchParams();
       if (selectedBranch) summaryParams.append('branchId', selectedBranch);
      if (selectedClass) summaryParams.append('classId', selectedClass);
      if (selectedStudent) summaryParams.append('studentId', selectedStudent);
      if (fromDate) summaryParams.append('fromDate', fromDate);
      if (toDate) summaryParams.append('toDate', toDate);

      const summaryRes = await api.get(`/attendance/summary?${summaryParams.toString()}`);
      setSummary(summaryRes.data);

      setToastMessage('Reports fetched successfully!');
      setToastColor('success');
    } catch (error) {
      setToastMessage('Error fetching reports');
      setToastColor('danger');
    } finally {
      setLoading(false);
      setShowToast(true);
    }
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
            <IonTitle>Attendance Reports</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} message="Fetching reports..." />
          <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} color={toastColor} />

          <div className="filters">
            {user?.role === 'Super Admin' && (
                <IonItem>
                    <IonLabel>Branch</IonLabel>
                    <IonSelect value={selectedBranch} onIonChange={e => setSelectedBranch(e.detail.value)}>
                        {branches.map(b => <IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>)}
                    </IonSelect>
                </IonItem>
            )}
            <IonItem>
                <IonLabel>Class Level</IonLabel>
                <IonSelect value={selectedClassLevel} onIonChange={e => setSelectedClassLevel(e.detail.value)}>
                    <IonSelectOption value="">All Levels</IonSelectOption>
                    {classLevels.map(cl => <IonSelectOption key={cl._id} value={cl._id}>{cl.name}</IonSelectOption>)}
                </IonSelect>
            </IonItem>
            <IonItem>
                <IonLabel>Class</IonLabel>
                <IonSelect value={selectedClass} onIonChange={e => setSelectedClass(e.detail.value)}>
                    {classes.map(c => <IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>)}
                </IonSelect>
            </IonItem>
            <IonItem>
                <IonLabel>Student</IonLabel>
                <IonSelect value={selectedStudent} onIonChange={e => setSelectedStudent(e.detail.value)}>
                     <IonSelectOption value="">All Students</IonSelectOption>
                    {students.map(s => <IonSelectOption key={s._id} value={s._id}>{s.name}</IonSelectOption>)}
                </IonSelect>
            </IonItem>
             <IonItem>
                <IonLabel>Subject</IonLabel>
                <IonSelect value={selectedSubject} onIonChange={e => setSelectedSubject(e.detail.value)}>
                    <IonSelectOption value="">All Subjects</IonSelectOption>
                    {subjects.map(s => <IonSelectOption key={s._id} value={s._id}>{s.name}</IonSelectOption>)}
                </IonSelect>
            </IonItem>
            <IonItem>
                <IonLabel>From Date</IonLabel>
                <IonDatetime displayFormat="YYYY-MM-DD" value={fromDate} onIonChange={e => setFromDate(e.detail.value!)} />
            </IonItem>
            <IonItem>
                <IonLabel>To Date</IonLabel>
                <IonDatetime displayFormat="YYYY-MM-DD" value={toDate} onIonChange={e => setToDate(e.detail.value!)} />
            </IonItem>
            <IonButton expand="full" onClick={handleFetchReports}>Fetch Reports</IonButton>
          </div>

          {summary && (
            <IonCard>
              <IonCardHeader><IonCardTitle>Summary</IonCardTitle></IonCardHeader>
              <IonCardContent>
                <p>Total Present: {summary.totalPresent}</p>
                <p>Total Absent: {summary.totalAbsent}</p>
                <p>Total Late: {summary.totalLate}</p>
                <p>Total Excused: {summary.totalExcused}</p>
                <p>Attendance Percentage: {summary.attendancePercentage?.toFixed(2)}%</p>
              </IonCardContent>
            </IonCard>
          )}

          <IonGrid>
            <IonRow>
              <IonCol><strong>Date</strong></IonCol>
              <IonCol><strong>Student</strong></IonCol>
              <IonCol><strong>Status</strong></IonCol>
              <IonCol><strong>Subject</strong></IonCol>
              <IonCol><strong>Remarks</strong></IonCol>
            </IonRow>
            {attendanceRecords.map(record => (
              <IonRow key={record._id}>
                <IonCol>{new Date(record.date).toLocaleDateString()}</IonCol>
                <IonCol>{typeof record.studentId === 'object' ? record.studentId.name : record.studentId}</IonCol>
                <IonCol>{record.status}</IonCol>
                <IonCol>{record.subjectId && typeof record.subjectId === 'object' ? record.subjectId.name : 'General'}</IonCol>
                <IonCol>{record.remarks}</IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </IonContent>
      </IonPage>
    </>
  );
};

export default AttendanceReports;
