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
  const [message, setMessage] = useState<string>('Please select a session and term to view results.');
  const [showToast, setShowToast] = useState<{ show: boolean; message: string; color: string }>({ show: false, message: '', color: '' });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const sessionsData = await getSessions();
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setShowToast({ show: true, message: 'Could not fetch available sessions.', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedSession || !selectedTerm) {
        setResults([]);
        setMessage('Please select a session and term to view results.');
        return;
      }

      const session = sessions.find(s => s.academicYear === selectedSession && s.term === selectedTerm);

      if (!session || session.resultPublicationStatus !== 'Published') {
        setResults([]);
        setMessage('Results for this term are not yet available.');
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get('/results', {
          params: { session: selectedSession, term: selectedTerm },
        });
        const fetchedResults = data.results || data || [];
        setResults(fetchedResults);
        if (fetchedResults.length === 0) {
          setMessage('No results found for this term.');
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setShowToast({ show: true, message: 'Could not fetch results.', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [selectedSession, selectedTerm, sessions]);

  const getSubjectName = (result: Result) => {
    if (typeof result.subjectId === 'object' && result.subjectId.name) {
      return result.subjectId.name;
    }
    return 'N/A';
  };

  const academicYears = [...new Set(sessions.map(s => s.academicYear))].sort().reverse();
  const availableTerms = selectedSession ? [...new Set(sessions.filter(s => s.academicYear === selectedSession).map(s => s.term))] : [];

  const handleSessionChange = (e: any) => {
    setSelectedSession(e.detail.value);
    setSelectedTerm('');
  };

  const handleTermChange = (e: any) => {
    setSelectedTerm(e.detail.value);
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
                    onIonChange={handleTermChange}
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
                            {message}
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
