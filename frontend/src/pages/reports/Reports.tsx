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
import { getSessions } from '../../services/sessionsApi';

const Reports: React.FC = () => {
  const { user } = useAuth();

  // Raw Data
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);

  // Fee Report Filters
  const [feeReportFormat, setFeeReportFormat] = useState('pdf');
  const [feeReportBranch, setFeeReportBranch] = useState(user?.role === 'Branch Admin' ? user.branchId || '' : '');

  // Result Report Filters
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
          api.get('/students'),
          api.get('/classes'),
          getSessions(),
        ];
        if (user?.role === 'Super Admin') {
          promises.push(api.get('/branches'));
        }
        const [studentsRes, classesRes, sessionsRes, branchesRes] = await Promise.all(promises);

        setAllStudents(studentsRes.data.students || studentsRes.data || []);
        setAllClasses(classesRes.data.classes || classesRes.data || []);
        setAllSessions(sessionsRes || []);
        if (branchesRes) {
          setAllBranches(branchesRes.data.branches || branchesRes.data || []);
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

  // Memoized lists for Result Report dropdowns
  const resultFilteredBranches = useMemo(() => {
      return user?.role === 'Super Admin' ? allBranches : [];
  }, [user, allBranches]);

  const resultFilteredClasses = useMemo(() => {
    const branchId = user?.role === 'Super Admin' ? resultReportBranch : user?.branchId;
    if (branchId) {
        return allClasses.filter(c => c.branchId === branchId);
    }
    return user?.role === 'Super Admin' ? allClasses : [];
  }, [user, allClasses, resultReportBranch]);

  const resultFilteredStudents = useMemo(() => {
    const branchId = user?.role === 'Super Admin' ? resultReportBranch : user?.branchId;
    if (resultReportClass) {
        return allStudents.filter(s => s.classId === resultReportClass);
    }
    if (branchId) {
        return allStudents.filter(s => s.branchId === branchId);
    }
    return allStudents;
  }, [allStudents, resultReportBranch, resultReportClass, user]);

  const resultFilteredSessions = useMemo(() => {
    const branchId = user?.role === 'Super Admin' ? resultReportBranch : user?.branchId;
    if(branchId) {
        return allSessions.filter(s => !s.branchId || s.branchId === branchId);
    }
    return allSessions;
  }, [allSessions, resultReportBranch, user]);

  const resultAcademicYears = useMemo(() => [...new Set(resultFilteredSessions.map(s => s.academicYear))].sort().reverse(), [resultFilteredSessions]);
  const resultAvailableTerms = useMemo(() => resultReportSession ? [...new Set(resultFilteredSessions.filter(s => s.academicYear === resultReportSession).map(s => s.term))] : [], [resultFilteredSessions, resultReportSession]);


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
      // Note: The backend for result report might not need branchId if classId is provided
      // and class is unique across branches. Sending it just in case.
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
                            {allBranches.map((branch) => (<IonSelectOption key={branch._id} value={branch._id}>{branch.name}</IonSelectOption>))}
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
                            {resultFilteredBranches.map((branch) => (<IonSelectOption key={branch._id} value={branch._id}>{branch.name}</IonSelectOption>))}
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
