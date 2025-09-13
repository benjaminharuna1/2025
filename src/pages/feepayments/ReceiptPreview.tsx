import React, { useEffect, useState, useRef } from 'react';
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
} from '@ionic/react';
import { printOutline, downloadOutline } from 'ionicons/icons';
import html2pdf from 'html2pdf.js';
import api from '../../services/api';
import { Invoice, FeePayment } from '../../types';
import Receipt from '../../components/feepayments/Receipt';

interface ReceiptData {
  invoice: Invoice;
  payments: FeePayment[];
}

const ReceiptPreviewPage: React.FC = () => {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const { id: invoiceId } = useParams<{ id: string }>();
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReceiptData = async () => {
      if (!invoiceId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get(`/invoices/${invoiceId}/receipt-data`);
        setReceiptData(data);
      } catch (error) {
        console.error("Failed to fetch receipt data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceiptData();
  }, [invoiceId]);

  const handlePrint = () => {
    if (receiptRef.current) {
      const element = receiptRef.current;
      const opt = {
        margin:       0,
        filename:     `receipt_${invoiceId}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().from(element).set(opt).toPdf().get('pdf').then(function (pdf) {
        window.open(pdf.output('bloburl'), '_blank');
      });
    }
  };

  const handleDownload = () => {
    if (receiptRef.current) {
      const element = receiptRef.current;
      const opt = {
        margin:       0,
        filename:     `receipt_${invoiceId}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().from(element).set(opt).save();
    }
  };

  if (loading) {
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/feepayments" />
          </IonButtons>
          <IonTitle>Receipt Preview</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handlePrint}><IonIcon icon={printOutline} /></IonButton>
            <IonButton onClick={handleDownload}><IonIcon icon={downloadOutline} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div ref={receiptRef}>
          <Receipt receiptData={receiptData} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReceiptPreviewPage;
