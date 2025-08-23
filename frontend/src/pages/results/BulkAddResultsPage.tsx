import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
} from '@ionic/react';

const BulkAddResultsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard/results" />
          </IonButtons>
          <IonTitle>Bulk Add Results</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <p>Bulk Add Results Page - Coming Soon!</p>
      </IonContent>
    </IonPage>
  );
};

export default BulkAddResultsPage;
