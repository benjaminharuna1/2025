import React from 'react';
import './Receipt.css';
import { Invoice, FeePayment } from '../../types';

interface ReceiptProps {
  receiptData: {
    invoice: Invoice;
    payments: FeePayment[];
  };
}

const Receipt: React.FC<ReceiptProps> = ({ receiptData }) => {
  const { invoice, payments } = receiptData;

  return (
    <div className="receipt">
      <div className="header">
        <h1>{import.meta.env.VITE_APP_NAME || 'School Name'}</h1>
        <p>{invoice.branchId.name}</p>
        <h2>Payment Receipt</h2>
      </div>
      <div className="invoice-info">
        <div><strong>Invoice ID:</strong> {invoice._id}</div>
        <div><strong>Student:</strong> {invoice.studentId.userId.name}</div>
        <div><strong>Admission No:</strong> {invoice.studentId.admissionNumber}</div>
        <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
      </div>
      <h3>Fee Structure Details</h3>
      <table className="fee-structure-table">
        <thead>
          <tr>
            <th>Fee Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.feeStructureId.fees.map((fee, index) => (
            <tr key={index}>
              <td>{fee.feeType}</td>
              <td>{fee.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Payment History</h3>
      <table className="payments-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount Paid</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={index}>
              <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
              <td>{payment.amountPaid}</td>
              <td>{payment.paymentMethod}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="summary">
        <div><strong>Total Payable:</strong> {invoice.totalPayable}</div>
        <div><strong>Total Paid:</strong> {invoice.totalPaid}</div>
        <div><strong>Balance:</strong> {invoice.balance}</div>
      </div>
      <div className="footer">
        <p>Thank you for your payment.</p>
      </div>
    </div>
  );
};

export default Receipt;
