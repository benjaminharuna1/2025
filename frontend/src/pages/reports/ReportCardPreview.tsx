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
import { downloadOutline } from 'ionicons/icons';
import html2pdf from 'html2pdf.js';
import ReportCard from '../../components/reports/ReportCard';

const ReportCardPreviewPage: React.FC = () => {
  const location = useLocation();
  const { reportData } = (location.state as { reportData: any[] }) || { reportData: [] };
  const reportContainerRef = useRef<HTMLDivElement>(null);

  const downloadPdf = () => {
    const element = reportContainerRef.current;
    if (!element) return;

    const options = {
      filename: 'Report_Cards.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(options).save();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/reports" />
          </IonButtons>
          <IonTitle>Report Card Preview</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={downloadPdf} disabled={!reportData || reportData.length === 0}>
              <IonIcon slot="icon-only" icon={downloadOutline} />
              Download All
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
