import React, { useState, useEffect } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonIcon, IonSpinner, IonList, IonItem, IonLabel } from '@ionic/react';
import { schoolOutline, bookOutline } from 'ionicons/icons';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherProfile, Class, Subject } from '../../types';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;
      try {
        const profileRes = await api.get(`/teachers/${user._id}`);
        setProfile(profileRes.data);

        if (profileRes.data.classes) {
          const classPromises = profileRes.data.classes.map((classId: string) => api.get(`/classes/${classId}`));
          const classResults = await Promise.all(classPromises);
          setClasses(classResults.map(res => res.data));
        }

        if (profileRes.data.subjects) {
          const subjectPromises = profileRes.data.subjects.map((subjectId: string) => api.get(`/subjects/${subjectId}`));
          const subjectResults = await Promise.all(subjectPromises);
          setSubjects(subjectResults.map(res => res.data));
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user]);

  if (loading) {
    return <IonSpinner />;
  }

  return (
    <IonGrid>
      <IonRow>
        <IonCol>
          <IonCard>
            <IonCardHeader>
              <IonIcon icon={schoolOutline} />
              <IonCardTitle>My Classes</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {classes.map(c => <IonItem key={c._id}><IonLabel>{c.name}</IonLabel></IonItem>)}
              </IonList>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonCard>
            <IonCardHeader>
              <IonIcon icon={bookOutline} />
              <IonCardTitle>My Subjects</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {subjects.map(s => <IonItem key={s._id}><IonLabel>{s.name}</IonLabel></IonItem>)}
              </IonList>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default TeacherDashboard;
