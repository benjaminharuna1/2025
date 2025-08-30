import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLoading,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { downloadOutline } from 'ionicons/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportCardSubject {
  subjectName: string;
  firstCA: number;
  secondCA: number;
  thirdCA: number;
  exam: number;
  total: number;
  grade: string;
  remarks: string;
  classAverage: string;
  subjectTeacher: string;
}

interface ReportCardData {
  schoolName: string;
  schoolAddress: string;
  academicYear: string;
  term: string;
  studentName: string;
  admissionNumber: string;
  gender: string;
  className: string;
  classTeacher: string;
  reportDate: string;
  positionInClass: string;
  attendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  subjects: ReportCardSubject[];
  subjectsPassed: number;
  subjectsFailed: number;
  promotionStatus: string;
  promotionComment: string;
  nextTermBegins: string;
}

const ReportCardPreviewPage: React.FC = () => {
  const { classId, sessionId } = useParams<{ classId: string; sessionId: string }>();
  const [reportData, setReportData] = useState<ReportCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const reportContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!classId || !sessionId) return;
      setLoading(true);
      try {
        const response = await api.get('/reports/report-card-data', {
          params: { classId, sessionId },
        });
        setReportData(response.data || []);
      } catch (error) {
        console.error('Error fetching report card data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [classId, sessionId]);

  const downloadPdf = async () => {
    const container = reportContainerRef.current;
    if (!container) return;

    setLoading(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const reportCards = container.querySelectorAll('.report-card-container');

    for (let i = 0; i < reportCards.length; i++) {
      const card = reportCards[i] as HTMLElement;
      const canvas = await html2canvas(card, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    }

    pdf.save('report-cards.pdf');
    setLoading(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard/results" />
          </IonButtons>
          <IonTitle>Report Card Preview</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={downloadPdf} disabled={loading || reportData.length === 0}>
              <IonIcon slot="icon-only" icon={downloadOutline} />
              Download All
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <style>{`
          .report-card-container {
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 20px;
            background: #fff;
            color: #000;
            page-break-after: always;
          }
          .report-header { text-align: center; }
          .student-info { display: flex; justify-content: space-between; margin: 10px 0; }
          .subjects-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .subjects-table th, .subjects-table td { border: 1px solid #ccc; padding: 5px; text-align: left; }
          .summary-section { margin-top: 15px; }
        `}</style>
        <IonLoading isOpen={loading} message="Generating report cards..." />

        <div ref={reportContainerRef}>
          {reportData.map((report, index) => (
            <div key={index} className="report-card-container" id={`report-card-${index}`}>
              <header className="report-header">
                <h1>{report.schoolName}</h1>
                <p>{report.schoolAddress}</p>
                <h3>{report.term} - {report.academicYear}</h3>
              </header>
              <section className="student-info">
                <div><strong>Student:</strong> {report.studentName}</div>
                <div><strong>Admission No:</strong> {report.admissionNumber}</div>
                <div><strong>Class:</strong> {report.className}</div>
              </section>
              <section>
                <table className="subjects-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>1st CA</th>
                      <th>2nd CA</th>
                      <th>3rd CA</th>
                      <th>Exam</th>
                      <th>Total</th>
                      <th>Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.subjects.map((sub, i) => (
                      <tr key={i}>
                        <td>{sub.subjectName}</td>
                        <td>{sub.firstCA}</td>
                        <td>{sub.secondCA}</td>
                        <td>{sub.thirdCA}</td>
                        <td>{sub.exam}</td>
                        <td>{sub.total}</td>
                        <td>{sub.grade}</td>
                        <td>{sub.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section className="summary-section">
                <p><strong>Position in Class:</strong> {report.positionInClass}</p>
                <p><strong>Subjects Passed:</strong> {report.subjectsPassed} | <strong>Subjects Failed:</strong> {report.subjectsFailed}</p>
                <p><strong>Attendance:</strong> {report.attendance.present} / {report.attendance.present + report.attendance.absent} days</p>
                <p><strong>Promotion Status:</strong> {report.promotionStatus} ({report.promotionComment})</p>
                <p><strong>Next Term Begins:</strong> {report.nextTermBegins}</p>
              </section>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportCardPreviewPage;
