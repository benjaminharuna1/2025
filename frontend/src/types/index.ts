export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Branch Admin' | 'Teacher' | 'Student' | 'Parent';
  branchId?: string;
  classId?: string;
  profilePicture?: string;
}

export interface Branch {
  _id: string;
  name: string;
  address: string;
}

export interface ClassLevel {
  _id: string;
  name: string;
  description?: string;
}

export interface Class {
  _id:string;
  name: string;
  classLevel: string | { _id: string; name: string };
  teacher: string | { _id: string; name: string };
  branchId: string;
}

export interface Subject {
  _id: string;
  name: string;
  classId: string;
  teacherId: string;
}

export interface Student extends User {
    userId: any;
    admissionNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    phoneNumber?: string;
    address?: string;
    bloodGroup?: string;
    sponsor?: string;
}

export interface TeacherProfile {
    _id: string;
    gender?: string;
    phoneNumber?: string;
    classes?: string[];
    subjects?: string[];
}

export interface ParentProfile {
    _id: string;
    gender?: string;
    phoneNumber?: string;
    students?: string[];
}

export interface Fee {
  feeType: string;
  amount: number;
}

export interface FeeStructure {
  _id: string;
  branchId: string | { _id: string; name: string };
  classLevel: string | { _id: string; name: string };
  session: string;
  term: string;
  fees: Fee[];
}

export interface Invoice {
  _id: string;
  studentId: { _id: string; name: string };
  branchId: { _id: string; name: string };
  session: string;
  term: string;
  status: 'Unpaid' | 'Paid' | 'Partially Paid';
  totalPayable: number;
  totalPaid: number;
  balance: number;
  dueDate: string;
  feeStructureId: {
    _id: string;
    fees: { feeType: string; amount: number }[];
  };
  amount: number;
  discount: number;
  scholarship: number;
  lateFee: number;
}

export interface FeePayment {
  _id: string;
  studentId: { _id: string; name: string; admissionNumber?: string; userId?: { name: string } };
  invoiceId: { _id: string; session: string; term: string };
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  receivedBy: { _id: string; name: string };
  payerDetails?: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface Attendance {
  _id: string;
  classId: string;
  branchId: string;
  date: string;
  records: AttendanceRecord[];
}

export interface Result {
  _id: string;
  studentId: string | Student;
  subjectId: string | Subject;
  classId: string | Class;
  branchId: string | Branch;
  session: string;
  term: 'First' | 'Second' | 'Third';
  marks: number; // This will be the total marks calculated by the backend
  firstCA?: number;
  secondCA?: number;
  thirdCA?: number;
  exam?: number;
  grade: string;
  remarks?: string;
  teacherComment?: string;
  status: 'Draft' | 'Approved';
  totalMarks?: number;
  average?: number;
  position?: number;
  recordedBy: string | User;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  branchId?: string | { _id: string; name: string };
}
