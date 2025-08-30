import React, { useState, useEffect } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonIcon, IonSpinner, IonList, IonItem, IonLabel, IonAccordion, IonAccordionGroup } from '@ionic/react';
import { personOutline, documentTextOutline, calendarOutline } from 'ionicons/icons';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ParentProfile, Student, Result, Attendance } from '../../types';

interface ChildData {
  student: Student;
  results: Result[];
  attendance: Attendance[];
}

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [childrenData, setChildrenData] = useState<ChildData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParentData = async () => {
      if (!user) return;
      try {
        const profileRes = await api.get(`/parents/${user._id}`);
        const parentProfile: ParentProfile = profileRes.data;

        if (parentProfile.students) {
          const childrenPromises = parentProfile.students.map(async (student) => {
            const studentId = typeof student === 'string' ? student : (student as Student)._id;
            const studentRes = await api.get(`/students/${studentId}`);
            const resultsRes = await api.get(`/results?studentId=${studentId}`);
            const attendanceRes = await api.get(`/attendance?studentId=${studentId}`);
            return {
              student: studentRes.data,
              results: resultsRes.data.results || resultsRes.data,
              attendance: attendanceRes.data.attendance || attendanceRes.data,
            };
          });
          const allChildrenData = await Promise.all(childrenPromises);
          setChildrenData(allChildrenData);
        }
      } catch (error) {
        console.error('Error fetching parent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, [user]);

  const getAttendanceSummary = (attendance: Attendance[]) => {
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
          <IonAccordionGroup>
            {childrenData.map(child => (
              <IonAccordion key={child.student._id} value={child.student._id}>
                <IonItem slot="header" color="light">
                  <IonIcon icon={personOutline} slot="start" />
                  <IonLabel>{child.student.userId?.name}</IonLabel>
                </IonItem>
                <div className="ion-padding" slot="content">
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Recent Results</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {child.results.slice(0, 5).map(r => (
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
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Attendance Summary</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>{getAttendanceSummary(child.attendance)}</p>
                    </IonCardContent>
                  </IonCard>
                </div>
              </IonAccordion>
            ))}
          </IonAccordionGroup>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default ParentDashboard;
