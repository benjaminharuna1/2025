import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StudentResultsPage from './StudentResultsPage';
import TeacherResultsDashboard from './TeacherResultsDashboard';
import AdminResultsDashboard from './AdminResultsDashboard';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonSpinner, IonButtons, IonMenuButton } from '@ionic/react';
import SidebarMenu from '../../components/SidebarMenu';

const Results: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <>
        <SidebarMenu />
        <IonPage id="main-content">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Loading Results</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonSpinner />
            </IonContent>
        </IonPage>
        </>
    );
  }

  if (!user) {
    return (
        <>
        <SidebarMenu />
        <IonPage id="main-content">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Unauthorized</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <p>You must be logged in to view this page.</p>
            </IonContent>
        </IonPage>
        </>
    );
  }

  switch (user.role) {
    case 'Student':
    case 'Parent':
      return <StudentResultsPage />;
    case 'Teacher':
      return <TeacherResultsDashboard />;
    case 'Super Admin':
    case 'Branch Admin':
      return <AdminResultsDashboard />;
    default:
        return (
            <>
            <SidebarMenu />
            <IonPage id="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>Unknown Role</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <p>Your role is not recognized.</p>
                </IonContent>
            </IonPage>
            </>
        );
  }
};

export default Results;
