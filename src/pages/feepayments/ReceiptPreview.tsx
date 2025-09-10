import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@ionic/react';
import {
  printOutline,
  downloadOutline,
  addCircleOutline,
  removeCircleOutline,
} from 'ionicons/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import { BlobProvider } from '@react-pdf/renderer';
import ReceiptDocument from './ReceiptDocument';
import api from '../../services/api';
import { Invoice, FeePayment } from '../../types';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReceiptData {
  invoice: Invoice;
  payments: FeePayment[];
}

// Viewer component is defined outside the main component
// to prevent it from being recreated on every render, which helps with performance.
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
              <IonBackButton defaultHref="/feepayments" />
            </IonButtons>
            <IonTitle>Receipt Preview</IonTitle>
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


const ReceiptPreviewPage: React.FC = () => {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const { id: invoiceId } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchReceiptData = async () => {
      if (!invoiceId) {
        setDataLoading(false);
        return;
      }
      try {
        const { data } = await api.get(`/invoices/${invoiceId}/receipt-data`);
        setReceiptData(data);
      } catch (error) {
        console.error("Failed to fetch receipt data", error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchReceiptData();
  }, [invoiceId]);

  if (dataLoading) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/feepayments" /></IonButtons><IonTitle>Loading Receipt...</IonTitle></IonToolbar></IonHeader>
        <IonContent className="ion-padding"><IonLoading isOpen={true} message="Fetching receipt data..." /></IonContent>
      </IonPage>
    );
  }

  if (!receiptData) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/feepayments" /></IonButtons><IonTitle>Error</IonTitle></IonToolbar></IonHeader>
        <IonContent className="ion-padding"><p>Could not load receipt data.</p></IonContent>
      </IonPage>
    );
  }

  // If we have a PDF blob, show the viewer.
  if (pdfBlob) {
      return (
          <IonPage>
              <Viewer blob={pdfBlob} fileName={`receipt_${invoiceId}.pdf`} />
          </IonPage>
      )
  }

  // Otherwise, render the BlobProvider to generate the PDF.
  return (
    <IonPage>
      <BlobProvider document={<ReceiptDocument data={receiptData} />}>
        {({ blob, url, loading, error }) => {
          if (loading) {
            return <IonContent className="ion-padding"><IonLoading isOpen={true} message="Generating PDF..." /></IonContent>;
          }
          if (error) {
            console.error("PDF Generation Error:", error);
            return <IonContent className="ion-padding"><p>Failed to generate PDF receipt.</p></IonContent>;
          }
          // Once the blob is created, set it to state. This will cause a re-render
          // and the `if (pdfBlob)` condition above will be met.
          if (blob && !pdfBlob) {
              setPdfBlob(blob);
          }
          // While the blob is being set, we can show a spinner or the loading message again.
          return <IonContent className="ion-padding"><IonLoading isOpen={true} message="Preparing PDF..." /></IonContent>;
        }}
      </BlobProvider>
    </IonPage>
  );
};

export default ReceiptPreviewPage;
