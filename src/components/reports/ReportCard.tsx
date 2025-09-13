import React from 'react';
import './ReportCard.css';

interface ReportCardProps {
  report: any;
}

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return dateString.split('T')[0];
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="report-card">
      <div className="header">
        <h1>{report.schoolName}</h1>
        <p>{report.schoolAddress}</p>
        <h2>{report.term} Term Report Card</h2>
      </div>
      <div className="student-info">
        <div><strong>Student:</strong> {report.studentName}</div>
        <div><strong>Admission No:</strong> {report.admissionNumber}</div>
        <div><strong>Class:</strong> {report.className}</div>
        <div><strong>Gender:</strong> {report.gender}</div>
      </div>
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
          {report.subjects.map((subject: any, index: number) => (
            <tr key={index}>
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
      <div className="summary">
        <div><strong>Subjects Passed:</strong> {report.subjectsPassed}</div>
        <div><strong>Subjects Failed:</strong> {report.subjectsFailed}</div>
        <div><strong>Position in Class:</strong> {report.positionInClass}</div>
      </div>
      <div className="attendance">
        <h3>Attendance</h3>
        <div><strong>Present:</strong> {report.attendance.present}</div>
        <div><strong>Absent:</strong> {report.attendance.absent}</div>
      </div>
      <div className="comments">
        <h3>Comments</h3>
        <p><strong>Class Teacher:</strong> {report.classTeacher}</p>
        <p><strong>Promotion Status:</strong> {report.promotionStatus}</p>
        <p><strong>Promotion Comment:</strong> {report.promotionComment}</p>
      </div>
      <div className="footer">
        <p><strong>Next Term Begins:</strong> {report.nextTermBegins}</p>
        <p><strong>Report Date:</strong> {formatDate(report.reportDate)}</p>
      </div>
    </div>
  );
};

export default ReportCard;
