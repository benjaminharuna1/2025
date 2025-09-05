import React, { useState, useEffect } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonIcon, IonSpinner, IonList, IonItem, IonLabel } from '@ionic/react';
import { documentTextOutline, calendarOutline } from 'ionicons/icons';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Result, Attendance } from '../../types';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;
      try {
        const [resultsRes, attendanceRes] = await Promise.all([
          api.get(`/results?studentId=${user._id}`),
          api.get(`/attendance?studentId=${user._id}`),
        ]);
        setResults(resultsRes.data.results || resultsRes.data);
        setAttendance(attendanceRes.data.attendance || attendanceRes.data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  const getAttendanceSummary = () => {
    if (!attendance || attendance.length === 0) return 'No attendance records';
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    return `${percentage.toFixed(2)}% (${presentDays}/${totalDays} days)`;
  };

  if (loading) {
    return <IonSpinner />;
  }

  return (
    <IonGrid>
      <IonRow>
        <IonCol>
          <IonCard>
            <IonCardHeader>
              <IonIcon icon={documentTextOutline} />
              <IonCardTitle>Recent Results</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {results.slice(0, 5).map(r => (
                  <IonItem key={r._id}>
                    <IonLabel>
                      <h3>{typeof r.subjectId === 'object' && r.subjectId.name}</h3>
                      <p>Marks: {r.marks}, Grade: {r.grade}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonCard>
            <IonCardHeader>
              <IonIcon icon={calendarOutline} />
              <IonCardTitle>Attendance Summary</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>{getAttendanceSummary()}</p>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default StudentDashboard;
