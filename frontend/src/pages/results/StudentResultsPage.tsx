import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';

type ToastColor = 'success' | 'danger' | 'warning';

const StudentResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Please select a session and term to view results.');
  const [toastInfo, setToastInfo] = useState<{ show: boolean; message: string; color: ToastColor }>({ show: false, message: '', color: 'success' });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // The getSessions endpoint on the backend should be smart enough to only return
        // sessions relevant to the logged-in student (i.e., their branch + global sessions)
        const sessionsData = await getSessions();
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setToastInfo({ show: true, message: 'Could not fetch available sessions.', color: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    if (user) {
        fetchInitialData();
    }
  }, [user]);

  const fetchResults = useCallback(async () => {
    if (!selectedAcademicYear || !selectedTerm) {
      setResults([]);
      setMessage('Please select a session and term to view results.');
      return;
    }

    const session = sessions.find(s => s.academicYear === selectedAcademicYear && s.term === selectedTerm);
    if (!session || session.resultPublicationStatus !== 'Published') {
      setResults([]);
      setMessage('Results for this term are not yet available.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get('/results', {
        params: {
          session: selectedAcademicYear,
          term: selectedTerm,
        },
      });
      const fetchedResults = data.results || data || [];
      setResults(fetchedResults);
      if (fetchedResults.length === 0) {
        setMessage('No results found for this term.');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setToastInfo({ show: true, message: 'Could not fetch results.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [selectedAcademicYear, selectedTerm, sessions]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const getSubjectName = (result: Result) => {
    return (typeof result.subjectId === 'object' && result.subjectId.name) || 'N/A';
  };

  const academicYears = useMemo(() => [...new Set(sessions.map(s => s.academicYear))].sort().reverse(), [sessions]);
  const availableTerms = useMemo(() => selectedAcademicYear ? [...new Set(sessions.filter(s => s.academicYear === selectedAcademicYear).map(s => s.term))] : [], [sessions, selectedAcademicYear]);

  return (
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonMenuButton /></IonButtons>
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
                  <IonSelect value={selectedAcademicYear} onIonChange={e => {setSelectedAcademicYear(e.detail.value); setSelectedTerm('');}}>
                    {academicYears.map((session) => (<IonSelectOption key={session} value={session}>{session}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size="6">
                <IonItem>
                  <IonLabel>Term</IonLabel>
                  <IonSelect value={selectedTerm} onIonChange={e => setSelectedTerm(e.detail.value)} disabled={!selectedAcademicYear}>
                    {availableTerms.map((term) => (<IonSelectOption key={term} value={term}>{term}</IonSelectOption>))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <div className="ion-padding responsive-table-wrapper">
                  <table className="responsive-table">
                    <thead><tr><th>Subject</th><th>1st CA</th><th>2nd CA</th><th>3rd CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remarks</th></tr></thead>
                    <tbody>
                      {results.length > 0 ? (
                        results.map((result) => (
                          <tr key={result._id}>
                            <td data-label="Subject">{getSubjectName(result)}</td>
                            <td data-label="1st CA">{result.firstCA ?? 'N/A'}</td>
                            <td data-label="2nd CA">{result.secondCA ?? 'N/A'}</td>
                            <td data-label="3rd CA">{result.thirdCA ?? 'N/A'}</td>
                            <td data-label="Exam">{result.exam ?? 'N/A'}</td>
                            <td data-label="Total">{result.marks}</td>
                            <td data-label="Grade">{result.grade}</td>
                            <td data-label="Remarks">{result.remarks}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={8} className="ion-text-center">{message}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonToast isOpen={toastInfo.show} onDidDismiss={() => setToastInfo({ show: false, message: '', color: 'success' })} message={toastInfo.message} duration={3000} color={toastInfo.color} />
        </IonContent>
      </IonPage>
    </>
  );
};

export default StudentResultsPage;
