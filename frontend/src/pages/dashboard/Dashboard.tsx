import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
} from '@ionic/react';
import SidebarMenu from '../../components/SidebarMenu';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import TeacherDashboard from '../../components/dashboard/TeacherDashboard';
import StudentDashboard from '../../components/dashboard/StudentDashboard';
import ParentDashboard from '../../components/dashboard/ParentDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'Super Admin':
      case 'Branch Admin':
        return <AdminDashboard />;
      case 'Teacher':
        return <TeacherDashboard />;
      case 'Student':
        return <StudentDashboard />;
      case 'Parent':
        return <ParentDashboard />;
      default:
        return <p>Welcome to your dashboard.</p>;
    }
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
            <IonTitle>Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {renderDashboard()}
        </IonContent>
      </IonPage>
    </>
  );
};

export default Dashboard;
