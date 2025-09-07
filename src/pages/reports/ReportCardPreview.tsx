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
import ReportCardDocument from './ReportCardDocument';
import api from '../../services/api';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReportData {
  schoolName: string; schoolAddress: string; studentName: string; admissionNumber: string; className: string; classTeacher: string; gender: string; term: string; academicYear: string; reportDate: string;
  subjects: { subjectName: string; firstCA: number; secondCA: number; thirdCA: number; exam: number; total: number; grade: string; remarks: string; subjectTeacher: string; }[];
  subjectsPassed: number; subjectsFailed: number; positionInClass: string;
  attendance: { present: number; absent: number; late: number; excused: number; };
  promotionStatus: string; promotionComment: string; nextTermBegins: string;
}

const Viewer = ({ blob, fileName }: { blob: Blob, fileName: string }) => {
    const [scale, setScale] = useState(1.0);
    const [numPages, setNumPages] = useState<number | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

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
            <IonTitle>Report Card Preview</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={zoomOut} disabled={scale <= 0.5}><IonIcon icon={removeCircleOutline} /></IonButton>
              <IonButton onClick={zoomIn} disabled={scale >= 3.0}><IonIcon icon={addCircleOutline} /></IonButton>
              <IonButton onClick={handlePrint}><IonIcon icon={printOutline} /></IonButton>
              <IonButton onClick={handleDownload}><IonIcon icon={downloadOutline} /></IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" scrollY={false}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', overflow: 'auto' }}>
                <Document file={blob} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from(new Array(numPages), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale} renderTextLayer={false} />
                    ))}
                </Document>
            </div>
        </IonContent>
      </>
    );
};

const ReportCardPreviewPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[] | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const { data } = await api.get('/reports/report-card-json', { params });
        setReportData(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Failed to fetch report card data", error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchReportData();
  }, [location.search]);

  if (dataLoading) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/reports" /></IonButtons><IonTitle>Loading Report...</IonTitle></IonToolbar></IonHeader>
        <IonContent className="ion-padding"><IonLoading isOpen={true} message="Fetching report data..." /></IonContent>
      </IonPage>
    );
  }

  if (!reportData) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/reports" /></IonButtons><IonTitle>Error</IonTitle></IonToolbar></IonHeader>
        <IonContent className="ion-padding"><p>Could not load report card data.</p></IonContent>
      </IonPage>
    );
  }

  if (pdfBlob) {
      return (
          <IonPage>
              <Viewer blob={pdfBlob} fileName="report_card.pdf" />
          </IonPage>
      )
  }

  return (
    <IonPage>
      <BlobProvider document={<ReportCardDocument reports={reportData} />}>
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

export default ReportCardPreviewPage;
