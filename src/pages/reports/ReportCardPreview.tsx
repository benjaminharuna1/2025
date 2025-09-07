import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner, IonButtons, IonBackButton } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';

// This is a simplified interface. You can make it more detailed.
interface ReportData {
  studentName: string;
  className: string;
  schoolName: string;
  schoolAddress: string;
  subjects: {
    subjectName: string;
    total: number;
    grade: string;
  }[];
  // ... add all the other fields from the JSON
}

const ReportCardPreviewPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // Example: /report-card-preview?classId=123&branchId=456&sessionId=789
        const params = new URLSearchParams(location.search);

        const { data } = await api.get('/reports/report-card-json', { params });

        // The endpoint returns an array for a class, or a single object for one student.
        // We'll always work with an array to keep it simple.
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

  if (!reportData) {
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
              {/* === Report Card HTML Structure === */}
              <header>
                {/* You can add your logo here */}
                <h1>{report.schoolName}</h1>
                <p>{report.schoolAddress}</p>
              </header>
              <main>
                <h2>{report.studentName} - {report.className}</h2>
                {/* Render the subjects table, summary, attendance etc. here */}
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Total</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.subjects.map((subject: any, i: number) => (
                      <tr key={i}>
                        <td>{subject.subjectName}</td>
                        <td>{subject.total}</td>
                        <td>{subject.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </main>
              <footer>
                <div className="signature">Class Teacher</div>
                <div className="signature">Principal</div>
              </footer>
              {/* === End of HTML Structure === */}
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportCardPreviewPage;
