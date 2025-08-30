import React, { useState, useEffect, useMemo } from 'react';
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
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButtons,
  IonMenuButton,
  IonLoading,
} from '@ionic/react';
import api from '../../services/api';
import SidebarMenu from '../../components/SidebarMenu';
import { Student, Class, Branch, Session } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const Reports: React.FC = () => {
  const { user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [feeReportFormat, setFeeReportFormat] = useState('pdf');
  const [feeReportBranch, setFeeReportBranch] = useState(user?.role === 'Branch Admin' ? user.branchId || '' : '');

  const [resultReportFormat, setResultReportFormat] = useState('pdf');
  const [resultReportStudent, setResultReportStudent] = useState('');
  const [resultReportClass, setResultReportClass] = useState('');
  const [resultReportBranch, setResultReportBranch] = useState(user?.role === 'Branch Admin' ? user.branchId || '' : '');
  const [resultReportSession, setResultReportSession] = useState('');
  const [resultReportTerm, setResultReportTerm] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [
          api.get('/dropdowns/students'),
          api.get('/dropdowns/classes'),
          api.get('/dropdowns/sessions'),
        ];
        if (user?.role === 'Super Admin') {
          promises.push(api.get('/dropdowns/branches'));
        }
        const [studentsRes, classesRes, sessionsRes, branchesRes] = await Promise.all(promises);

        setStudents(studentsRes.data || []);
        setClasses(classesRes.data || []);
        setSessions(sessionsRes.data || []);
        if (branchesRes) {
          setBranches(branchesRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
        fetchInitialData();
    }
  }, [user]);

  const resultFilteredClasses = useMemo(() => {
    if (resultReportBranch) return classes.filter(c => c.branchId === resultReportBranch);
    return classes;
  }, [classes, resultReportBranch]);

  const resultFilteredStudents = useMemo(() => {
    if (resultReportClass) return students.filter(s => s.classId === resultReportClass);
    if (resultReportBranch) return students.filter(s => s.branchId === resultReportBranch);
    return students;
  }, [students, resultReportBranch, resultReportClass]);

  const resultAcademicYears = useMemo(() => [...new Set(sessions.map(s => s.academicYear))].sort().reverse(), [sessions]);
  const resultAvailableTerms = useMemo(() => resultReportSession ? [...new Set(sessions.filter(s => s.academicYear === resultReportSession).map(s => s.term))] : [], [sessions, resultReportSession]);

  const generateReport = async (reportType: 'fees' | 'results') => {
    setLoading(true);
    let params: any = {};
    let url = `/reports/${reportType}`;
    if (reportType === 'fees') {
      params = { format: feeReportFormat, branchId: feeReportBranch };
    } else {
      params = {
        format: resultReportFormat,
        studentId: resultReportStudent,
        classId: resultReportClass,
        session: resultReportSession,
        term: resultReportTerm,
      };
      if(resultReportBranch) params.branchId = resultReportBranch;
    }

    try {
      const response = await api.get(url, { params, responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${params.format}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonMenuButton /></IonButtons>
            <IonTitle>Reports</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} />
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonCardHeader><IonCardTitle>Fee Report</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    {user?.role === 'Super Admin' && (
                        <IonItem>
                        <IonLabel>Branch</IonLabel>
                        <IonSelect value={feeReportBranch} onIonChange={(e) => setFeeReportBranch(e.detail.value)}>
                            <IonSelectOption value="">All</IonSelectOption>
                            {branches.map((branch) => (<IonSelectOption key={branch._id} value={branch._id}>{branch.name}</IonSelectOption>))}
                        </IonSelect>
                        </IonItem>
                    )}
                    <IonItem>
                      <IonLabel>Format</IonLabel>
                      <IonSelect value={feeReportFormat} onIonChange={(e) => setFeeReportFormat(e.detail.value)}>
                        <IonSelectOption value="pdf">PDF</IonSelectOption>
                        <IonSelectOption value="excel">Excel</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                    <IonButton expand="full" onClick={() => generateReport('fees')} className="ion-margin-top">Generate Fee Report</IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonCardHeader><IonCardTitle>Result Report</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    {user?.role === 'Super Admin' && (
                        <IonItem>
                        <IonLabel>Branch</IonLabel>
                        <IonSelect value={resultReportBranch} onIonChange={(e) => {setResultReportBranch(e.detail.value); setResultReportClass(''); setResultReportStudent('');}}>
                            <IonSelectOption value="">All</IonSelectOption>
                            {branches.map((branch) => (<IonSelectOption key={branch._id} value={branch._id}>{branch.name}</IonSelectOption>))}
                        </IonSelect>
                        </IonItem>
                    )}
                    <IonItem>
                      <IonLabel>Class</IonLabel>
                      <IonSelect value={resultReportClass} onIonChange={(e) => {setResultReportClass(e.detail.value); setResultReportStudent('');}}>
                        <IonSelectOption value="">All</IonSelectOption>
                        {resultFilteredClasses.map((c) => (<IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Student</IonLabel>
                      <IonSelect value={resultReportStudent} onIonChange={(e) => setResultReportStudent(e.detail.value)}>
                        <IonSelectOption value="">All</IonSelectOption>
                        {resultFilteredStudents.map((student) => (<IonSelectOption key={student._id} value={student._id}>{student.userId.name}</IonSelectOption>))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Session</IonLabel>
                      <IonSelect value={resultReportSession} onIonChange={(e) => setResultReportSession(e.detail.value)}>
                        <IonSelectOption value="">All</IonSelectOption>
                        {resultAcademicYears.map((session) => (<IonSelectOption key={session} value={session}>{session}</IonSelectOption>))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Term</IonLabel>
                      <IonSelect value={resultReportTerm} onIonChange={(e) => setResultReportTerm(e.detail.value)}>
                        <IonSelectOption value="">All</IonSelectOption>
                        {resultAvailableTerms.map((term) => (<IonSelectOption key={term} value={term}>{term}</IonSelectOption>))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Format</IonLabel>
                      <IonSelect value={resultReportFormat} onIonChange={(e) => setResultReportFormat(e.detail.value)}>
                        <IonSelectOption value="pdf">PDF</IonSelectOption>
                        <IonSelectOption value="excel">Excel</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                    <IonButton expand="full" onClick={() => generateReport('results')} className="ion-margin-top">Generate Result Report</IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Reports;
