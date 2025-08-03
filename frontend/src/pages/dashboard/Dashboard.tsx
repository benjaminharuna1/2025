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

const Dashboard: React.FC = () => {
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
          <h1>Welcome to the Dashboard</h1>
          <p>This is the main dashboard content.</p>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Dashboard;
