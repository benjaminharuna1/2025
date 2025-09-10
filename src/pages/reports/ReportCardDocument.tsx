import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Define the shape of the report data, reusing from the preview page if possible,
// but defined here for clarity as a standalone component.
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
  }[];
  subjectsPassed: number;
  subjectsFailed: number;
  positionInClass: string;
  attendance: {
    present: number;
    absent: number;
  };
  promotionStatus: string;
  promotionComment: string;
  nextTermBegins: string;
}

// Register fonts
// Note: In a real app, you would need to host these font files.
// For this example, we'll rely on default fonts but show where to register.
// Font.register({
//   family: 'Oswald',
//   src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
// });

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  schoolAddress: {
    fontSize: 12,
  },
  reportTitle: {
    fontSize: 14,
    marginTop: 10,
    textDecoration: 'underline',
  },
  studentDetails: {
    border: '1px solid #000',
    padding: 10,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailItem: {
    width: '48%',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f2f2f2',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    textAlign: 'center',
  },
  subjectCol: {
    width: '25%',
    textAlign: 'left',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryBox: {
    width: '48%',
    border: '1px solid #000',
    padding: 10,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    textDecoration: 'underline',
  },
  promotionSection: {
    border: '1px solid #000',
    padding: 10,
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1px solid #000',
  },
  signatureBox: {
    textAlign: 'center',
  },
  signatureLine: {
    borderBottom: '1px solid #000',
    width: 150,
    marginBottom: 5,
  },
});

interface ReportCardDocumentProps {
  reports: ReportData[];
}

const ReportCardDocument: React.FC<ReportCardDocumentProps> = ({ reports }) => (
  <Document>
    {reports.map((report, index) => (
      <Page key={index} size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.schoolName}>{report.schoolName || 'N/A'}</Text>
          <Text style={styles.schoolAddress}>{report.schoolAddress || 'N/A'}</Text>
          <Text style={styles.reportTitle}>ACADEMIC REPORT - {report.term || 'N/A'} {report.academicYear || 'N/A'}</Text>
        </View>

        <View style={styles.studentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailItem}>Student Name: {report.studentName || 'N/A'}</Text>
            <Text style={styles.detailItem}>Admission No: {report.admissionNumber || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailItem}>Class: {report.className || 'N/A'}</Text>
            <Text style={styles.detailItem}>Gender: {report.gender || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailItem}>Report Date: {new Date(report.reportDate).toLocaleDateString()}</Text>
            <Text style={styles.detailItem}>Class Teacher: {report.classTeacher}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, styles.subjectCol]}>Subject</Text>
            <Text style={styles.tableColHeader}>1st CA</Text>
            <Text style={styles.tableColHeader}>2nd CA</Text>
            <Text style={styles.tableColHeader}>3rd CA</Text>
            <Text style={styles.tableColHeader}>Exam</Text>
            <Text style={styles.tableColHeader}>Total</Text>
            <Text style={styles.tableColHeader}>Grade</Text>
            <Text style={styles.tableColHeader}>Remarks</Text>
          </View>
          {report.subjects.map((subject, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.subjectCol]}>{subject.subjectName}</Text>
              <Text style={styles.tableCol}>{subject.firstCA}</Text>
              <Text style={styles.tableCol}>{subject.secondCA}</Text>
              <Text style={styles.tableCol}>{subject.thirdCA}</Text>
              <Text style={styles.tableCol}>{subject.exam}</Text>
              <Text style={styles.tableCol}>{subject.total}</Text>
              <Text style={styles.tableCol}>{subject.grade}</Text>
              <Text style={styles.tableCol}>{subject.remarks}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Attendance Summary</Text>
            <Text>Days Present: {report.attendance.present}</Text>
            <Text>Days Absent: {report.attendance.absent}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Performance Summary</Text>
            <Text>Position in Class: {report.positionInClass}</Text>
            <Text>Subjects Passed: {report.subjectsPassed}</Text>
            <Text>Subjects Failed: {report.subjectsFailed}</Text>
          </View>
        </View>

        <View style={styles.promotionSection}>
            <Text style={styles.summaryTitle}>Promotion Status</Text>
            <Text>Status: {report.promotionStatus} ({report.promotionComment})</Text>
            <Text>Next Term Begins: {report.nextTermBegins}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}></Text>
            <Text>Class Teacher's Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}></Text>
            <Text>Principal's Signature</Text>
          </View>
        </View>
      </Page>
    ))}
  </Document>
);

export default ReportCardDocument;
