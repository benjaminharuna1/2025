import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Invoice, FeePayment } from '../../types'; // Assuming global types are sufficient

// The API returns a consolidated object.
interface ReceiptData {
    invoice: Invoice;
    payments: FeePayment[];
}

interface ReceiptDocumentProps {
  data: ReceiptData;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  receiptTitle: {
    fontSize: 18,
    marginTop: 10,
    textDecoration: 'underline',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f2f2f2',
    padding: 5,
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
      marginBottom: 3,
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
  summarySection: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 20,
  },
  summaryBox: {
      border: '1px solid #000',
      padding: 10,
      width: '50%',
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
                    <Text>{invoice.studentId.name}</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={styles.textRow}><Text style={styles.label}>Invoice #:</Text> {invoice._id}</Text>
                    <Text style={styles.textRow}><Text style={styles.label}>Date:</Text> {new Date().toLocaleDateString()}</Text>
                    <Text style={styles.textRow}><Text style={styles.label}>Due Date:</Text> {new Date(invoice.dueDate).toLocaleDateString()}</Text>
                    <Text style={styles.textRow}><Text style={styles.label}>Status:</Text> {invoice.status}</Text>
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
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
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableColHeader, {width: '25%'}]}>Payment ID</Text>
                    <Text style={[styles.tableColHeader, {width: '25%'}]}>Payment Date</Text>
                    <Text style={[styles.tableColHeader, {width: '25%'}]}>Method</Text>
                    <Text style={[styles.tableColHeader, {width: '25%', textAlign: 'right'}]}>Amount Paid</Text>
                </View>
                {payments.map((p, i) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={[styles.tableCol, {width: '25%'}]}>{p._id}</Text>
                        <Text style={[styles.tableCol, {width: '25%'}]}>{new Date(p.paymentDate).toLocaleDateString()}</Text>
                        <Text style={[styles.tableCol, {width: '25%'}]}>{p.paymentMethod}</Text>
                        <Text style={[styles.tableCol, {width: '25%', textAlign: 'right'}]}>{p.amountPaid.toFixed(2)}</Text>
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

      </Page>
    </Document>
  );
}

export default ReceiptDocument;
