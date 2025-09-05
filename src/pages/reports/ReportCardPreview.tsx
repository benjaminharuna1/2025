import React from 'react';
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
import { printOutline, downloadOutline } from 'ionicons/icons';

const ReportCardPreviewPage: React.FC = () => {
  const location = useLocation();
  const { pdfUrl } = (location.state as { pdfUrl: string }) || { pdfUrl: '' };

  const handlePrint = () => {
    const iframe = document.getElementById('pdf-preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.print();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'report_card.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <IonButton onClick={handlePrint} disabled={!pdfUrl}>
              <IonIcon slot="icon-only" icon={printOutline} />
            </IonButton>
            <IonButton onClick={handleDownload} disabled={!pdfUrl}>
              <IonIcon slot="icon-only" icon={downloadOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {pdfUrl ? (
          <iframe
            id="pdf-preview-iframe"
            src={pdfUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Report Card Preview"
          />
        ) : (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            No report card generated. Please go back and generate one.
          </p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ReportCardPreviewPage;
