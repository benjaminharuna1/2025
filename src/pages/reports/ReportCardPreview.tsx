import React, { useEffect, useState, useRef } from "react";
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
} from "@ionic/react";
import { printOutline, downloadOutline } from "ionicons/icons";
import html2pdf from 'html2pdf.js';
import api from '../../services/api';
import ReportCard from '../../components/reports/ReportCard';

interface ReportData {
  schoolName: string; schoolAddress: string; studentName: string; admissionNumber: string; className: string; classTeacher: string; gender: string; term: string; academicYear: string; reportDate: string;
  subjects: { subjectName: string; firstCA: number; secondCA: number; thirdCA: number; exam: number; total: number; grade: string; remarks: string; subjectTeacher: string; }[];
  subjectsPassed: number; subjectsFailed: number; positionInClass: string;
  attendance: { present: number; absent: number; late: number; excused: number; };
  promotionStatus: string; promotionComment: string; nextTermBegins: string;
}

const ReportCardPreviewPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const reportCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const { data } = await api.get('/reports/report-card-json', { params });
        setReportData(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Failed to fetch report card data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [location.search]);

  const handlePrint = () => {
    if (reportCardRef.current) {
      const element = reportCardRef.current;
      const opt = {
        margin:       0,
        filename:     'report-card.pdf',
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
    if (reportCardRef.current) {
      const element = reportCardRef.current;
      const opt = {
        margin:       0,
        filename:     'report-card.pdf',
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/reports" />
          </IonButtons>
          <IonTitle>Report Card Preview</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handlePrint}><IonIcon icon={printOutline} /></IonButton>
            <IonButton onClick={handleDownload}><IonIcon icon={downloadOutline} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div ref={reportCardRef}>
          {reportData.map((report, index) => (
            <ReportCard key={index} report={report} />
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportCardPreviewPage;
