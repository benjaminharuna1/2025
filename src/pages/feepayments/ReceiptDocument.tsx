import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Invoice, FeePayment, Student } from '../../types';

// The API returns a consolidated object.
interface ReceiptData {
    invoice: Omit<Invoice, 'studentId'> & { studentId: Student }; // Ensure studentId is the full Student object
    payments: FeePayment[];
}

interface ReceiptDocumentProps {
  data: ReceiptData;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  receiptTitle: {
    fontSize: 16,
    marginTop: 10,
    textDecoration: 'underline',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    backgroundColor: '#e9e9e9',
    padding: 4,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
  textRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
  },
  label: {
      fontWeight: 'bold',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    alignItems: 'center',
    minHeight: 24,
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
    padding: 4,
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    borderRightColor: '#bfbfbf',
  },
  summarySection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 15,
  },
  summaryBox: {
      border: '1px solid #000',
      padding: 8,
      width: '45%',
  },
  footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      textAlign: 'center',
      fontSize: 8,
      color: 'grey',
  }
});

const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({ data }) => {
  const { invoice, payments } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.schoolName}>{typeof invoice.branchId === 'object' ? invoice.branchId.name : 'School Name'}</Text>
          <Text style={styles.receiptTitle}>OFFICIAL RECEIPT</Text>
        </View>

        <View style={styles.section}>
            <View style={styles.grid}>
                <View style={styles.gridItem}>
                    <Text style={styles.label}>Billed To:</Text>
                    <Text>{invoice.studentId?.userId?.name}</Text>
                    <Text>Admission No: {invoice.studentId?.admissionNumber}</Text>
                    <Text>Class: {invoice.studentId?.classId?.name}</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={styles.textRow}><Text style={styles.label}>Invoice #:</Text> {invoice._id}</Text>
                    <Text style={styles.textRow}><Text style={styles.label}>Session:</Text> {invoice.feeStructureId?.session}</Text>
                    <Text style={styles.textRow}><Text style={styles.label}>Term:</Text> {invoice.feeStructureId?.term}</Text>
                    <Text style={styles.textRow}><Text style={styles.label}>Status:</Text> {invoice.status}</Text>
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            {(invoice.feeStructureId?.fees && invoice.feeStructureId.fees.length > 0) ? (
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableColHeader, {width: '80%'}]}>Fee Type</Text>
                        <Text style={[styles.tableColHeader, {width: '20%', textAlign: 'right'}]}>Amount</Text>
                    </View>
                    {invoice.feeStructureId.fees.map((fee, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[styles.tableCol, {width: '80%'}]}>{fee.feeType}</Text>
                            <Text style={[styles.tableCol, {width: '20%', textAlign: 'right'}]}>{fee.amount.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text>No itemized fee breakdown available for this invoice.</Text>
            )}
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableColHeader, {width: '20%'}]}>Payment Date</Text>
                    <Text style={[styles.tableColHeader, {width: '15%'}]}>Method</Text>
                    <Text style={[styles.tableColHeader, {width: '25%'}]}>Payer Name</Text>
                    <Text style={[styles.tableColHeader, {width: '25%'}]}>Payer Email</Text>
                    <Text style={[styles.tableColHeader, {width: '15%', textAlign: 'right'}]}>Amount Paid</Text>
                </View>
                {payments.map((p, i) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={[styles.tableCol, {width: '20%'}]}>{new Date(p.paymentDate).toLocaleDateString()}</Text>
                        <Text style={[styles.tableCol, {width: '15%'}]}>{p.paymentMethod}</Text>
                        <Text style={[styles.tableCol, {width: '25%'}]}>{p.payerDetails?.name || 'N/A'}</Text>
                        <Text style={[styles.tableCol, {width: '25%'}]}>{p.payerDetails?.email || 'N/A'}</Text>
                        <Text style={[styles.tableCol, {width: '15%', textAlign: 'right'}]}>{p.amountPaid.toFixed(2)}</Text>
                    </View>
                ))}
            </View>
        </View>

        <View style={styles.summarySection}>
            <View style={styles.summaryBox}>
                <Text style={styles.textRow}><Text style={styles.label}>Total Payable:</Text> {invoice.totalPayable.toFixed(2)}</Text>
                <Text style={styles.textRow}><Text style={styles.label}>Total Paid:</Text> {invoice.totalPaid.toFixed(2)}</Text>
                <Text style={styles.textRow}><Text style={styles.label}>Balance:</Text> {invoice.balance.toFixed(2)}</Text>
            </View>
        </View>

        <Text style={styles.footer}>Thank you for your payment.</Text>
      </Page>
    </Document>
  );
}

export default ReceiptDocument;
