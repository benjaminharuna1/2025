import React, { useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { printOutline } from 'ionicons/icons';
import ReportCard from '../../components/reports/ReportCard';

const ReportCardPreviewPage: React.FC = () => {
  const location = useLocation();
  const { reportData } = (location.state as { reportData: any[] }) || { reportData: [] };
  const reportContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <IonPage>
      <IonHeader className="print-hide">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/reports" />
          </IonButtons>
          <IonTitle>Report Card Preview</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handlePrint} disabled={!reportData || reportData.length === 0}>
              <IonIcon slot="icon-only" icon={printOutline} />
              Print
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!reportData || reportData.length === 0 ? (
          <p>No report card data found. Please go back and generate the report first.</p>
        ) : (
          <div ref={reportContainerRef}>
            {reportData.map((report, index) => (
              <ReportCard key={index} report={report} id={`report-card-${index}`} />
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ReportCardPreviewPage;
