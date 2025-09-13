import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonAvatar,
  IonButton,
} from '@ionic/react';
import SidebarMenu from '../../components/SidebarMenu';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import TeacherDashboard from '../../components/dashboard/TeacherDashboard';
import StudentDashboard from '../../components/dashboard/StudentDashboard';
import ParentDashboard from '../../components/dashboard/ParentDashboard';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    const imagePath = path.replace('public/', '');
    return `${BACKEND_URL}/${imagePath}`;
  };

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
            <IonButtons slot="end">
              <IonButton routerLink="/profile">
                <IonAvatar style={{ width: '32px', height: '32px' }}>
                  <img src={getImageUrl(user?.profilePicture) || `https://ui-avatars.com/api/?name=${user?.name?.replace(/\s/g, '+') || 'User'}`} alt="profile" />
                </IonAvatar>
              </IonButton>
            </IonButtons>
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
