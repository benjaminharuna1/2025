import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  IonLoading,
  IonSpinner,
} from "@ionic/react";
import {
  printOutline,
  downloadOutline,
  addCircleOutline,
  removeCircleOutline,
} from "ionicons/icons";
import { Document, Page, pdfjs } from "react-pdf";
import { BlobProvider } from '@react-pdf/renderer';
import FeeReportDocument from './FeeReportDocument';
import api from '../../services/api';
import { FeePayment } from '../../types';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Viewer = ({ blob, fileName }: { blob: Blob, fileName: string }) => {
    const [scale, setScale] = useState(1.0);

    const handlePrint = () => {
        const url = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        iframe.contentWindow?.print();
    };

    const handleDownload = () => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

    return (
      <>
        <IonHeader className="no-print">
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/reports" />
            </IonButtons>
            <IonTitle>Fee Report Preview</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={zoomOut}><IonIcon icon={removeCircleOutline} /></IonButton>
              <IonButton onClick={zoomIn}><IonIcon icon={addCircleOutline} /></IonButton>
              <IonButton onClick={handlePrint}><IonIcon icon={printOutline} /></IonButton>
              <IonButton onClick={handleDownload}><IonIcon icon={downloadOutline} /></IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" scrollY={false}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', overflow: 'auto' }}>
                <Document file={blob}>
                    <Page pageNumber={1} scale={scale} />
                </Document>
            </div>
        </IonContent>
      </>
    );
};

const FeeReportPreviewPage: React.FC = () => {
  const [payments, setPayments] = useState<FeePayment[] | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const { data } = await api.get('/reports/fees-json', { params });
        setPayments(data);
      } catch (error) {
        console.error("Failed to fetch fee report data", error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchFeeData();
  }, [location.search]);

  if (dataLoading) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/reports" /></IonButtons><IonTitle>Loading Report...</IonTitle></IonToolbar></IonHeader>
        <IonContent className="ion-padding"><IonLoading isOpen={true} message="Fetching report data..." /></IonContent>
      </IonPage>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/reports" /></IonButtons><IonTitle>No Data</IonTitle></IonToolbar></IonHeader>
        <IonContent className="ion-padding"><p>No fee payment data found for the selected criteria.</p></IonContent>
      </IonPage>
    );
  }

  if (pdfBlob) {
      return (
          <IonPage>
              <Viewer blob={pdfBlob} fileName="fee_payment_report.pdf" />
          </IonPage>
      )
  }

  return (
    <IonPage>
      <BlobProvider document={<FeeReportDocument payments={payments} />}>
        {({ blob, url, loading, error }) => {
          if (loading) {
            return <IonContent className="ion-padding"><IonLoading isOpen={true} message="Generating PDF..." /></IonContent>;
          }
          if (error) {
            console.error("PDF Generation Error:", error);
            return <IonContent className="ion-padding"><p>Failed to generate PDF.</p></IonContent>;
          }
          if (blob && !pdfBlob) {
              setPdfBlob(blob);
          }
          return <IonContent className="ion-padding"><IonLoading isOpen={true} message="Preparing PDF..." /></IonContent>;
        }}
      </BlobProvider>
    </IonPage>
  );
};

export default FeeReportPreviewPage;
