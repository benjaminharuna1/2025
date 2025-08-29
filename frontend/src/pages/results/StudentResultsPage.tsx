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
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonLoading,
  IonButtons,
  IonMenuButton,
  IonToast,
} from '@ionic/react';
import api from '../../services/api';
import { Result, Session } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import { getSessions } from '../../services/sessionsApi';

const StudentResultsPage: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<{ show: boolean; message: string; color: string }>({ show: false, message: '', color: '' });
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const sessionsData = await getSessions();
        setSessions(sessionsData);
        if (sessionsData.length > 0) {
          // Auto-select the most recent session
          const academicYears = [...new Set(sessionsData.map(s => s.academicYear))].sort().reverse();
          setSelectedSession(academicYears[0]);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setShowToast({ show: true, message: 'Could not fetch available sessions.', color: 'danger' });
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedSession || !selectedTerm) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get('/results', {
          params: { session: selectedSession, term: selectedTerm },
        });
        setResults(data.results || data || []);
      } catch (error) {
        console.error('Error fetching results:', error);
        setShowToast({ show: true, message: 'Could not fetch results.', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };

    if (!initialLoad) {
      fetchResults();
    }
  }, [selectedSession, selectedTerm, initialLoad]);

  const getSubjectName = (result: Result) => {
    if (typeof result.subjectId === 'object' && result.subjectId.name) {
      return result.subjectId.name;
    }
    return 'N/A';
  };

  const academicYears = [...new Set(sessions.map(s => s.academicYear))].sort().reverse();
  const availableTerms = selectedSession ? [...new Set(sessions.filter(s => s.academicYear === selectedSession).map(s => s.term))] : [];

  const noResultsMessage =
    !selectedSession || !selectedTerm
      ? 'Please select a session and term to view results.'
      : 'Results for this term are not yet available.';

  const handleSessionChange = (e: any) => {
    setSelectedSession(e.detail.value);
    setSelectedTerm(''); // Reset term when session changes
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
            <IonTitle>My Results</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} message={'Fetching results...'} />
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonItem>
                  <IonLabel>Session</IonLabel>
                  <IonSelect
                    value={selectedSession}
                    onIonChange={handleSessionChange}
                  >
                    {academicYears.map((session) => (
                      <IonSelectOption key={session} value={session}>
                        {session}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size="6">
                <IonItem>
                  <IonLabel>Term</IonLabel>
                  <IonSelect
                    value={selectedTerm}
                    onIonChange={(e) => setSelectedTerm(e.detail.value)}
                    disabled={!selectedSession}
                  >
                    <IonSelectOption value="">Select Term</IonSelectOption>
                    {availableTerms.map((term) => (
                      <IonSelectOption key={term} value={term}>
                        {term}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <div className="ion-padding">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>1st CA</th>
                        <th>2nd CA</th>
                        <th>3rd CA</th>
                        <th>Exam</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.length > 0 ? (
                        results.map((result) => (
                          <tr key={result._id}>
                            <td>{getSubjectName(result)}</td>
                            <td>{result.firstCA ?? 'N/A'}</td>
                            <td>{result.secondCA ?? 'N/A'}</td>
                            <td>{result.thirdCA ?? 'N/A'}</td>
                            <td>{result.exam ?? 'N/A'}</td>
                            <td>{result.marks}</td>
                            <td>{result.grade}</td>
                            <td>{result.remarks}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="ion-text-center">
                            {noResultsMessage}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonToast
            isOpen={showToast.show}
            onDidDismiss={() => setShowToast({ show: false, message: '', color: '' })}
            message={showToast.message}
            duration={3000}
            color={showToast.color}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default StudentResultsPage;
