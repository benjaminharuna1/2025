import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Interfaces based on the LATEST API guide
interface Fee {
  feeType: string;
  amount: number;
}

interface FeeStructure {
  _id: string;
  name: string;
  description: string;
  fees: Fee[];
  totalAmount: number;
}

interface Invoice {
  _id: string;
  feeStructureId: FeeStructure;
}

interface User {
    _id: string;
    name: string;
    admissionNumber: string;
}

interface Student {
    _id: string;
    userId: User;
}

interface PayerDetails {
    name: string;
    phone: string;
    email: string;
}

interface FeePayment {
  _id: string;
  studentId: Student;
  invoiceId: Invoice;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  payerDetails?: PayerDetails;
  receivedBy: string; // This is an ID
  createdAt: string;
  updatedAt: string;
}

interface FeeReportDocumentProps {
  payments: FeePayment[];
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    textDecoration: 'underline',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    alignItems: 'center',
  },
  tableColHeader: {
    backgroundColor: '#f2f2f2',
    padding: 5,
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCol: {
    padding: 5,
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
  },
  colStudent: { width: '20%' },
  colAdmission: { width: '15%' },
  colInvoice: { width: '20%' },
  colAmount: { width: '10%', textAlign: 'right' },
  colDate: { width: '15%' },
  colMethod: { width: '10%' },
  colReceiver: { width: '10%' },
});

const FeeReportDocument: React.FC<FeeReportDocumentProps> = ({ payments }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <Text style={styles.title}>Fee Payment Report</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableColHeader, styles.colStudent]}>Student Name</Text>
          <Text style={[styles.tableColHeader, styles.colAdmission]}>Admission No.</Text>
          <Text style={[styles.tableColHeader, styles.colInvoice]}>Invoice</Text>
          <Text style={[styles.tableColHeader, styles.colAmount]}>Amount Paid</Text>
          <Text style={[styles.tableColHeader, styles.colDate]}>Payment Date</Text>
          <Text style={[styles.tableColHeader, styles.colMethod]}>Method</Text>
          <Text style={[styles.tableColHeader, styles.colReceiver]}>Recorded By</Text>
        </View>

        {/* Table Body */}
        {payments.map((payment) => (
          <View key={payment._id} style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.colStudent]}>{payment.studentId.userId.name}</Text>
            <Text style={[styles.tableCol, styles.colAdmission]}>{payment.studentId.userId.admissionNumber}</Text>
            <Text style={[styles.tableCol, styles.colInvoice]}>{payment.invoiceId.feeStructureId.name}</Text>
            <Text style={[styles.tableCol, styles.colAmount]}>{payment.amountPaid.toFixed(2)}</Text>
            <Text style={[styles.tableCol, styles.colDate]}>{new Date(payment.paymentDate).toLocaleDateString()}</Text>
            <Text style={[styles.tableCol, styles.colMethod]}>{payment.paymentMethod}</Text>
            <Text style={[styles.tableCol, styles.colReceiver]}>{payment.receivedBy}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default FeeReportDocument;
