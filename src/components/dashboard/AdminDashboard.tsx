import React, { useState, useEffect } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonIcon, IonSpinner } from '@ionic/react';
import { businessOutline, peopleOutline, schoolOutline, bookOutline } from 'ionicons/icons';
import api from '../../services/api';
import { User } from '../../types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    branches: 0,
    users: 0,
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [branchesRes, usersRes, classesRes, subjectsRes] = await Promise.all([
          api.get('/branches'),
          api.get('/users'),
          api.get('/classes'),
          api.get('/subjects'),
        ]);

        const branches = branchesRes.data?.branches || [];
        const users = usersRes.data?.users || [];
        const classes = classesRes.data?.classes || [];
        const subjects = subjectsRes.data?.subjects || [];

        const students = users.filter((u: User) => u.role === 'Student').length;
        const teachers = users.filter((u: User) => u.role === 'Teacher').length;

        setStats({
          branches: branches.length,
          users: users.length,
          students,
          teachers,
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
              <IonCardTitle>{stats.users}</IonCardTitle>
              <IonCardContent>Total Users</IonCardContent>
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
