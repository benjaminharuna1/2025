import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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
  IonInput,
  IonToast,
} from '@ionic/react';
import api from '../../services/api';
import SidebarMenu from '../../components/SidebarMenu';
import { Class, Branch, Session } from '../../types';

const Reports: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [classes, setClasses] = useState<Class[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastInfo, setToastInfo] = useState<{ show: boolean, message: string, color: string }>({ show: false, message: '', color: '' });

  // State for the Report Card Generator
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');

  useEffect(() => {
    // This effect runs to set initial state from URL if available
    const queryParams = new URLSearchParams(location.search);
    const branchId = queryParams.get('branchId');
    const classId = queryParams.get('classId');
    const sessionId = queryParams.get('sessionId');

    if (branchId) setSelectedBranch(branchId);
    if (classId) setSelectedClass(classId);
    if (sessionId) setSelectedSessionId(sessionId);
  }, [location.search]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [branchesData, sessionsData] = await Promise.all([
          api.get('/branches'),
          api.get('/sessions'),
        ]);
        setBranches(branchesData.data.branches || []);
        setSessions(sessionsData.data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setToastInfo({ show: true, message: 'Could not fetch initial data.', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedBranch) {
        try {
          setLoading(true);
          const { data } = await api.get(`/classes?branchId=${selectedBranch}`);
          setClasses(data.classes || []);
        } catch (error) {
          console.error('Error fetching classes:', error);
          setToastInfo({ show: true, message: 'Could not fetch classes.', color: 'danger' });
        } finally {
          setLoading(false);
        }
      } else {
        setClasses([]);
      }
    };
    fetchClasses();
  }, [selectedBranch]);

  const handleGeneratePreview = async () => {
  if (!selectedSessionId) {
    setToastInfo({ show: true, message: 'A session must be selected.', color: 'warning' });
    return;
  }

  setLoading(true);

  try {
    const params: { sessionId: string; classId?: string; studentId?: string; branchId?: string } = {
      sessionId: selectedSessionId,
    };

    if (admissionNumber.trim()) {
      // Single student report
      const studentRes = await api.get(`/students?admissionNumber=${admissionNumber.trim()}`);
      const student = studentRes.data.students?.[0];
      if (!student) {
        setToastInfo({ show: true, message: `Student with admission number "${admissionNumber}" not found.`, color: 'danger' });
        setLoading(false);
        return;
      }
      params.studentId = student._id;
    } else if (selectedClass && selectedBranch) {
      // Class report
      params.classId = selectedClass;
      params.branchId = selectedBranch; // ✅ ensure branchId is included
    } else {
      setToastInfo({ show: true, message: 'Please select a class and branch, or enter a student admission number.', color: 'warning' });
      setLoading(false);
      return;
    }

    const endpoint = params.studentId 
      ? '/reports/report-card-data' 
      : '/reports/combined-report-card';

    const response = await api.get(endpoint, {
      params,
      responseType: 'blob',
    });

    const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Keep URL in sessionStorage so preview survives refresh
    sessionStorage.setItem('reportCardPdfUrl', pdfUrl);

    history.push('/reports/report-card-preview');

  } catch (error: any) {
    console.error('Error fetching report card data:', error);
    const errorMsg = error.response?.data?.message || 'Failed to generate report card.';
    setToastInfo({ show: true, message: errorMsg, color: 'danger' });
  } finally {
    setLoading(false);
  }
};


  const isButtonDisabled = !selectedSessionId || (!selectedClass && !admissionNumber.trim());

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
          <IonLoading isOpen={loading} message="Please wait..." />
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Generate Report Cards</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p className="ion-padding-bottom" style={{ opacity: 0.7 }}>
                      Generate for a class by selecting a Branch/Class, or for a single student by entering their admission number.
                    </p>
                    <IonItem>
                      <IonLabel position="floating">Student Admission Number (Optional)</IonLabel>
                      <IonInput
                        value={admissionNumber}
                        onIonChange={(e) => setAdmissionNumber(e.target.value!)}
                        placeholder="Overrides class selection"
                      />
                    </IonItem>
                    <hr />
                    <IonItem>
                      <IonLabel>Branch</IonLabel>
                      <IonSelect
                        value={selectedBranch}
                        onIonChange={(e) => {
                          setSelectedBranch(e.detail.value);
                          setSelectedClass('');
                        }}
                        disabled={!!admissionNumber.trim()}
                      >
                        <IonSelectOption value="">Select Branch</IonSelectOption>
                        {branches.map((branch) => (
                          <IonSelectOption key={branch._id} value={branch._id}>
                            {branch.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Class</IonLabel>
                      <IonSelect
                        value={selectedClass}
                        onIonChange={(e) => setSelectedClass(e.detail.value)}
                        disabled={!selectedBranch || !!admissionNumber.trim()}
                      >
                        <IonSelectOption value="">Select Class</IonSelectOption>
                        {classes.map((c) => (
                          <IonSelectOption key={c._id} value={c._id}>
                            {c.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Session</IonLabel>
                      <IonSelect
                        value={selectedSessionId}
                        onIonChange={(e) => setSelectedSessionId(e.detail.value)}
                      >
                        <IonSelectOption value="">Select Session</IonSelectOption>
                        {sessions.map((session) => (
                          <IonSelectOption key={session._id} value={session._id}>
                            {`${session.academicYear} - ${session.term}`}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonButton
                      expand="full"
                      onClick={handleGeneratePreview}
                      disabled={isButtonDisabled}
                      className="ion-margin-top"
                    >
                      Generate Preview
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonToast
            isOpen={toastInfo.show}
            onDidDismiss={() => setToastInfo({ ...toastInfo, show: false })}
            message={toastInfo.message}
            duration={3000}
            color={toastInfo.color}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default Reports;