import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
import { Class, Branch, Session } from '../../types';

const Reports: React.FC = () => {
  const history = useHistory();
  const [classes, setClasses] = useState<Class[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  // State for the new Report Card Generator
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // The getSessions function from the service already handles the API call
        const [branchesData, sessionsData] = await Promise.all([
          api.get('/branches'),
          api.get('/sessions'),
        ]);
        setBranches(branchesData.data.branches || []);
        setSessions(sessionsData.data || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
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
    if (!selectedClass || !selectedSessionId) {
      console.error('Class and Session must be selected');
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/reports/report-card-data', {
        params: { classId: selectedClass, sessionId: selectedSessionId },
        responseType: 'blob', // This is the important part!
      });
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      history.push('/reports/report-card-preview', { pdfUrl });
    } catch (error) {
      console.error('Error fetching report card data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !selectedBranch || !selectedClass || !selectedSessionId;

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
                    <IonItem>
                      <IonLabel>Branch</IonLabel>
                      <IonSelect
                        value={selectedBranch}
                        onIonChange={(e) => {
                          setSelectedBranch(e.detail.value);
                          setSelectedClass(''); // Reset class on branch change
                        }}
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
                        disabled={!selectedBranch}
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
        </IonContent>
      </IonPage>
    </>
  );
};

export default Reports;
