import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner, IonButtons, IonBackButton } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import './ReportCard.css'; // Importing a dedicated CSS file for styles

interface ReportData {
  schoolName: string;
  schoolAddress: string;
  studentName: string;
  admissionNumber: string;
  className: string;
  classTeacher: string;
  gender: string;
  term: string;
  academicYear: string;
  reportDate: string;
  subjects: {
    subjectName: string;
    firstCA: number;
    secondCA: number;
    thirdCA: number;
    exam: number;
    total: number;
    grade: string;
    remarks: string;
    subjectTeacher: string;
  }[];
  subjectsPassed: number;
  subjectsFailed: number;
  positionInClass: string;
  attendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  promotionStatus: string;
  promotionComment: string;
  nextTermBegins: string;
}

const ReportCardPreviewPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[] | null>(null);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      }
    };
    fetchReportData();
  }, [location.search]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <IonPage><IonContent className="ion-padding"><IonSpinner /></IonContent></IonPage>;
  }

  if (!reportData || reportData.length === 0) {
    return <IonPage><IonContent className="ion-padding"><p>No report data found.</p></IonContent></IonPage>;
  }

  return (
    <IonPage>
      <IonHeader className="no-print">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/reports" />
          </IonButtons>
          <IonTitle>Report Card Preview</IonTitle>
          <IonButton slot="end" onClick={handlePrint}>Print/Save as PDF</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div id="report-card-container">
          {reportData.map((report, index) => (
            <div key={index} className="report-card-page">
              <header className="report-header">
                {/* Optional: <img src="/path/to/logo.png" alt="School Logo" className="logo" /> */}
                <h1>{report.schoolName}</h1>
                <p>{report.schoolAddress}</p>
                <h2>{report.term} - {report.academicYear}</h2>
              </header>

              <main>
                <div className="student-details">
                  <h3>Student Information</h3>
                  <div className="details-grid">
                    <p><strong>Name:</strong> {report.studentName}</p>
                    <p><strong>Admission No:</strong> {report.admissionNumber}</p>
                    <p><strong>Class:</strong> {report.className}</p>
                    <p><strong>Gender:</strong> {report.gender}</p>
                    <p><strong>Class Teacher:</strong> {report.classTeacher}</p>
                    <p><strong>Report Date:</strong> {new Date(report.reportDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <h3>Academic Performance</h3>
                <table className="results-table">
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
                    {report.subjects.map((subject, i) => (
                      <tr key={i}>
                        <td>{subject.subjectName}</td>
                        <td>{subject.firstCA}</td>
                        <td>{subject.secondCA}</td>
                        <td>{subject.thirdCA}</td>
                        <td>{subject.exam}</td>
                        <td>{subject.total}</td>
                        <td>{subject.grade}</td>
                        <td>{subject.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="summary-section">
                  <div className="attendance-summary">
                    <h4>Attendance</h4>
                    <p><strong>Present:</strong> {report.attendance.present}</p>
                    <p><strong>Absent:</strong> {report.attendance.absent}</p>
                  </div>
                  <div className="performance-summary">
                    <h4>Performance Summary</h4>
                    <p><strong>Position in Class:</strong> {report.positionInClass}</p>
                    <p><strong>Subjects Passed:</strong> {report.subjectsPassed}</p>
                    <p><strong>Subjects Failed:</strong> {report.subjectsFailed}</p>
                  </div>
                </div>

                <div className="promotion-section">
                   <h4>Promotion Status</h4>
                   <p><strong>Status:</strong> {report.promotionStatus}</p>
                   <p><strong>Comment:</strong> {report.promotionComment}</p>
                   <p><strong>Next Term Begins:</strong> {report.nextTermBegins}</p>
                </div>

              </main>

              <footer className="report-footer">
                <div className="signature-box">
                  <p className="signature-line"></p>
                  <p>Class Teacher's Signature</p>
                </div>
                <div className="signature-box">
                  <p className="signature-line"></p>
                  <p>Principal's Signature</p>
                </div>
              </footer>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportCardPreviewPage;
