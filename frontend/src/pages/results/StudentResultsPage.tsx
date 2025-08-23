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
} from '@ionic/react';
import api from '../../services/api';
import { Result } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';

const StudentResultsPage: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [allResults, setAllResults] = useState<Result[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/results');
        const fetchedResults = data.results || data || [];
        setAllResults(fetchedResults);
        // Extract unique sessions from all results
        const uniqueSessions = [...new Set(fetchedResults.map((r: Result) => r.session))];
        setSessions(uniqueSessions);
        // Set initial filter to the most recent session
        if (uniqueSessions.length > 0) {
          setSelectedSession(uniqueSessions[0]);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllResults();
  }, []);

  useEffect(() => {
    // Filter results whenever the selected session or term changes
    let filtered = allResults;
    if (selectedSession) {
      filtered = filtered.filter(r => r.session === selectedSession);
    }
    if (selectedTerm) {
      filtered = filtered.filter(r => r.term === selectedTerm);
    }
    setResults(filtered);
  }, [selectedSession, selectedTerm, allResults]);

  const getStudentName = (result: Result) => {
    if (typeof result.studentId === 'object' && result.studentId.userId) {
      return result.studentId.userId.name;
    }
    return 'N/A';
  }

  const getSubjectName = (result: Result) => {
    if (typeof result.subjectId === 'object' && result.subjectId.name) {
      return result.subjectId.name;
    }
    return 'N/A';
  }

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
                    onIonChange={(e) => setSelectedSession(e.detail.value)}
                  >
                    {sessions.map((session) => (
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
                  >
                    <IonSelectOption value="">All Terms</IonSelectOption>
                    <IonSelectOption value="First">First</IonSelectOption>
                    <IonSelectOption value="Second">Second</IonSelectOption>
                    <IonSelectOption value="Third">Third</IonSelectOption>
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
                        <th>Marks</th>
                        <th>Grade</th>
                        <th>Remarks</th>
                        <th>Total Marks</th>
                        <th>Average</th>
                        <th>Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.length > 0 ? (
                        results.map((result) => (
                          <tr key={result._id}>
                            <td>{getSubjectName(result)}</td>
                            <td>{result.marks}</td>
                            <td>{result.grade}</td>
                            <td>{result.remarks}</td>
                            <td>{result.totalMarks ?? 'N/A'}</td>
                            <td>{result.average ?? 'N/A'}</td>
                            <td>{result.position ?? 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="ion-text-center">
                            No results found for the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    </>
  );
};

export default StudentResultsPage;
