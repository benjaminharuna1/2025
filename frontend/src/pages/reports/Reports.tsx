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
} from '@ionic/react';
import api from '../../services/api';
import SidebarMenu from '../../components/SidebarMenu';
import { Student, Class, Branch, Session } from '../../types';
import { TERMS } from '../../constants';
import { getSessions } from '../../services/sessionsApi';

const Reports: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [feeReportFormat, setFeeReportFormat] = useState('pdf');
  const [feeReportBranch, setFeeReportBranch] = useState('');
  const [resultReportFormat, setResultReportFormat] = useState('pdf');
  const [resultReportStudent, setResultReportStudent] = useState('');
  const [resultReportClass, setResultReportClass] = useState('');
  const [resultReportBranch, setResultReportBranch] = useState('');
  const [resultReportSession, setResultReportSession] = useState('');
  const [resultReportTerm, setResultReportTerm] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [studentsRes, branchesRes, sessionsRes] = await Promise.all([
          api.get('/students'),
          api.get('/branches'),
          getSessions(),
        ]);

        if (studentsRes.data && Array.isArray(studentsRes.data.students)) {
          const sortedStudents = studentsRes.data.students.sort((a: Student, b: Student) =>
            a.userId.name.localeCompare(b.userId.name)
          );
          setStudents(sortedStudents);
        }
        setBranches(branchesRes.data.branches || []);
        setSessions(sessionsRes);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      if (resultReportBranch) {
        try {
          const { data } = await api.get(`/classes?branchId=${resultReportBranch}`);
          setClasses(data.classes || data || []);
        } catch (error) {
          console.error('Error fetching classes:', error);
        }
      } else {
        setClasses([]);
      }
    };
    fetchClasses();
  }, [resultReportBranch]);

  const academicYears = [...new Set(sessions.map(s => s.academicYear))].sort().reverse();

  const handleBranchChange = (branchId: string) => {
    setResultReportBranch(branchId);
    setResultReportClass(''); // Reset class
  };

  const generateReport = async (reportType: 'fees' | 'results') => {
    let params = {};
    if (reportType === 'fees') {
      params = {
        format: feeReportFormat,
        branchId: feeReportBranch,
      };
    } else {
      params = {
        format: resultReportFormat,
        studentId: resultReportStudent,
        classId: resultReportClass,
        branchId: resultReportBranch,
        session: resultReportSession,
        term: resultReportTerm,
      };
    }

    try {
      const response = await api.get(`/reports/${reportType}`, {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = reportType === 'fees' ? `fee_report.${feeReportFormat}` : `result_report.${resultReportFormat}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error generating ${reportType} report:`, error);
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
            <IonTitle>Reports</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Fee Report</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonItem>
                      <IonLabel>Branch</IonLabel>
                      <IonSelect value={feeReportBranch} onIonChange={(e) => setFeeReportBranch(e.detail.value)}>
                        <IonSelectOption value="">All</IonSelectOption>
                        {branches.map((branch) => (
                          <IonSelectOption key={branch._id} value={branch._id}>
                            {branch.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Format</IonLabel>
                      <IonSelect value={feeReportFormat} onIonChange={(e) => setFeeReportFormat(e.detail.value)}>
                        <IonSelectOption value="pdf">PDF</IonSelectOption>
                        <IonSelectOption value="excel">Excel</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                    <IonButton expand="full" onClick={() => generateReport('fees')} className="ion-margin-top">
                      Generate Fee Report
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Result Report</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonItem>
                      <IonLabel>Branch</IonLabel>
                      <IonSelect value={resultReportBranch} onIonChange={(e) => handleBranchChange(e.detail.value)}>
                        <IonSelectOption value="">All</IonSelectOption>
                        {branches.map((branch) => (
                          <IonSelectOption key={branch._id} value={branch._id}>
                            {branch.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Student</IonLabel>
                      <IonSelect value={resultReportStudent} onIonChange={(e) => setResultReportStudent(e.detail.value)}>
                        <IonSelectOption value="">All</IonSelectOption>
                        {students.map((student) => (
                          <IonSelectOption key={student._id} value={student._id}>
                            {student.userId.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Class</IonLabel>
                      <IonSelect value={resultReportClass} onIonChange={(e) => setResultReportClass(e.detail.value)} disabled={!resultReportBranch}>
                        <IonSelectOption value="">All</IonSelectOption>
                        {classes.map((c) => (
                          <IonSelectOption key={c._id} value={c._id}>
                            {c.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Session</IonLabel>
                      <IonSelect value={resultReportSession} onIonChange={(e) => setResultReportSession(e.detail.value)}>
                        <IonSelectOption value="">All</IonSelectOption>
                        {academicYears.map((session) => (
                          <IonSelectOption key={session} value={session}>
                            {session}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Term</IonLabel>
                      <IonSelect value={resultReportTerm} onIonChange={(e) => setResultReportTerm(e.detail.value)}>
                        <IonSelectOption value="">All</IonSelectOption>
                        {TERMS.map((term) => (
                          <IonSelectOption key={term} value={term}>
                            {term}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Format</IonLabel>
                      <IonSelect value={resultReportFormat} onIonChange={(e) => setResultReportFormat(e.detail.value)}>
                        <IonSelectOption value="pdf">PDF</IonSelectOption>
                        <IonSelectOption value="excel">Excel</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                    <IonButton expand="full" onClick={() => generateReport('results')} className="ion-margin-top">
                      Generate Result Report
                    </IonButton>
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
