import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Interfaces based on the API guide
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

interface FeePayment {
  _id: string;
  studentId: Student;
  invoiceId: Invoice;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

interface FeeReportDocumentProps {
  payments: FeePayment[];
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    textDecoration: 'underline',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '16.66%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f2f2f2',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '16.66%',
    borderStyle: 'solid',
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 5,
  },
  nameCol: {
      width: '25%',
  },
  invoiceCol: {
      width: '25%',
  },
  smallCol: {
      width: '12.5%',
  },
  dateCol: {
      width: '20%'
  },
  noBorder: {
      borderRightWidth: 0,
  }
});

const FeeReportDocument: React.FC<FeeReportDocumentProps> = ({ payments }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <Text style={styles.title}>Fee Payment Report</Text>
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableColHeader, styles.nameCol]}>Student Name</Text>
          <Text style={[styles.tableColHeader, styles.smallCol]}>Admission No.</Text>
          <Text style={[styles.tableColHeader, styles.invoiceCol]}>Invoice</Text>
          <Text style={[styles.tableColHeader, styles.smallCol]}>Amount Paid</Text>
          <Text style={[styles.tableColHeader, styles.dateCol]}>Payment Date</Text>
          <Text style={[styles.tableColHeader, styles.smallCol, styles.noBorder]}>Status</Text>
        </View>

        {/* Table Body */}
        {payments.map((payment) => (
          <View key={payment._id} style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.nameCol]}>{payment.studentId.userId.name}</Text>
            <Text style={[styles.tableCol, styles.smallCol]}>{payment.studentId.userId.admissionNumber}</Text>
            <Text style={[styles.tableCol, styles.invoiceCol]}>{payment.invoiceId.feeStructureId.name}</Text>
            <Text style={[styles.tableCol, styles.smallCol]}>{payment.amountPaid.toFixed(2)}</Text>
            <Text style={[styles.tableCol, styles.dateCol]}>{new Date(payment.paymentDate).toLocaleDateString()}</Text>
            <Text style={[styles.tableCol, styles.smallCol, styles.noBorder]}>{payment.status}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default FeeReportDocument;
