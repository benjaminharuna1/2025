import React, { useState, useEffect } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonIcon, IonSpinner } from '@ionic/react';
import { businessOutline, peopleOutline, schoolOutline, bookOutline } from 'ionicons/icons';
import api from '../../services/api';
import { User } from '../../types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    branches: 0,
    parents: 0,
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [branchesRes, parentsRes, classesRes, subjectsRes, studentsRes, teachersRes] = await Promise.all([
          api.get('/branches'),
          api.get('/parents'),
          api.get('/classes'),
          api.get('/subjects'),
          api.get('/students'),
          api.get('/teachers'),
        ]);

        const branches = branchesRes.data?.branches || [];
        const parents = parentsRes.data || [];
        const classes = classesRes.data?.classes || [];
        const subjects = subjectsRes.data?.subjects || [];
        const students = studentsRes.data?.students || [];
        const teachers = teachersRes.data?.teachers || [];

        setStats({
          branches: branches.length,
          parents: parents.length,
          students: students.length,
          teachers: teachers.length,
          classes: classes.length,
          subjects: subjects.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <IonSpinner />;
  }

  return (
    <IonGrid>
      <IonRow>
        <IonCol size="12" size-md="6" size-lg="4">
          <IonCard>
            <IonCardHeader className="ion-text-center">
              <IonIcon icon={businessOutline} size="large" />
              <IonCardTitle>{stats.branches}</IonCardTitle>
              <IonCardContent>Branches</IonCardContent>
            </IonCardHeader>
          </IonCard>
        </IonCol>
        <IonCol size="12" size-md="6" size-lg="4">
          <IonCard>
            <IonCardHeader className="ion-text-center">
              <IonIcon icon={peopleOutline} size="large" />
              <IonCardTitle>{stats.parents}</IonCardTitle>
              <IonCardContent>Total Parents</IonCardContent>
            </IonCardHeader>
          </IonCard>
        </IonCol>
        <IonCol size="12" size-md="6" size-lg="4">
          <IonCard>
            <IonCardHeader className="ion-text-center">
              <IonIcon icon={peopleOutline} size="large" color="secondary" />
              <IonCardTitle>{stats.students}</IonCardTitle>
              <IonCardContent>Students</IonCardContent>
            </IonCardHeader>
          </IonCard>
        </IonCol>
        <IonCol size="12" size-md="6" size-lg="4">
          <IonCard>
            <IonCardHeader className="ion-text-center">
              <IonIcon icon={peopleOutline} size="large" color="tertiary" />
              <IonCardTitle>{stats.teachers}</IonCardTitle>
              <IonCardContent>Teachers</IonCardContent>
            </IonCardHeader>
          </IonCard>
        </IonCol>
        <IonCol size="12" size-md="6" size-lg="4">
          <IonCard>
            <IonCardHeader className="ion-text-center">
              <IonIcon icon={schoolOutline} size="large" />
              <IonCardTitle>{stats.classes}</IonCardTitle>
              <IonCardContent>Classes</IonCardContent>
            </IonCardHeader>
          </IonCard>
        </IonCol>
        <IonCol size="12" size-md="6" size-lg="4">
          <IonCard>
            <IonCardHeader className="ion-text-center">
              <IonIcon icon={bookOutline} size="large" />
              <IonCardTitle>{stats.subjects}</IonCardTitle>
              <IonCardContent>Subjects</IonCardContent>
            </IonCardHeader>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default AdminDashboard;
