import React from 'react';
import './ReportCard.css';

interface ReportCardSubject {
  subjectName: string;
  firstCA: number;
  secondCA: number;
  thirdCA: number;
  exam: number;
  total: number;
  grade: string;
  remarks: string;
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

interface ReportCardProps {
  report: ReportCardData;
  id: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, id }) => {
  const totalAttendance = report.attendance.present + report.attendance.absent;
  return (
    <div className="report-card-container" id={id}>
      <header className="report-header">
        <h1>{report.schoolName}</h1>
        <p>{report.schoolAddress}</p>
        <h3>{report.term} - {report.academicYear} Report Card</h3>
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
      <footer className="summary-section">
        <p><strong>Position in Class:</strong> {report.positionInClass}</p>
        <p><strong>Subjects Passed:</strong> {report.subjectsPassed} | <strong>Subjects Failed:</strong> {report.subjectsFailed}</p>
        <p><strong>Attendance:</strong> {report.attendance.present} / {totalAttendance} days</p>
        <p><strong>Class Teacher's Comment:</strong> {report.promotionComment}</p>
        <p><strong>Promotion Status:</strong> {report.promotionStatus}</p>
        <p><strong>Next Term Begins:</strong> {report.nextTermBegins}</p>
      </footer>
    </div>
  );
};

export default ReportCard;
