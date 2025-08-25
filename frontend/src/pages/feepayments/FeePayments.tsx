import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonMenuButton,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonInput,
  IonToast,
} from '@ionic/react';
import { documentText, add } from 'ionicons/icons';
import api from '../../services/api';
import { FeePayment, Student, Invoice, Branch } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './FeePayments.css';

const FeePayments: React.FC = () => {
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [studentInvoices, setStudentInvoices] = useState<Invoice[]>([]);
  const [filterStudent, setFilterStudent] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    studentId: '',
    invoiceId: '',
    amountPaid: '',
    paymentMethod: 'Cash',
    payerDetails: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFeePayments();
    fetchStudents();
    fetchBranches();
  }, [filterStudent, filterBranch, page]);

  useEffect(() => {
    if (addFormData.studentId) {
      const fetchStudentInvoices = async () => {
        try {
          // Fetch unpaid and partially paid invoices for the selected student
          const [unpaidRes, partiallyPaidRes] = await Promise.all([
            api.get('/invoices', { params: { studentId: addFormData.studentId, status: 'Unpaid' } }),
            api.get('/invoices', { params: { studentId: addFormData.studentId, status: 'Partially Paid' } }),
          ]);

          const unpaidInvoices = unpaidRes.data.invoices || [];
          const partiallyPaidInvoices = partiallyPaidRes.data.invoices || [];

          setStudentInvoices([...unpaidInvoices, ...partiallyPaidInvoices]);
        } catch (error) {
          console.error('Error fetching student invoices:', error);
          setStudentInvoices([]);
        }
      };
      fetchStudentInvoices();
    } else {
      setStudentInvoices([]);
    }
  }, [addFormData.studentId]);

  const fetchFeePayments = async () => {
    try {
      const { data } = await api.get('/feepayments', {
        params: { studentId: filterStudent, branchId: filterBranch, page },
      });
      setFeePayments(data.feePayments || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error('Error fetching fee payments:', error);
      setFeePayments([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      if (data && Array.isArray(data.students)) {
        const sortedStudents = data.students.sort((a: Student, b: Student) =>
          a.userId.name.localeCompare(b.userId.name)
        );
        setStudents(sortedStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches');
      if (data && Array.isArray(data.branches)) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const downloadReceipt = (id: string) => {
    window.open(`${api.defaults.baseURL}/feepayments/${id}/receipt`, '_blank');
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddFormData({
      studentId: '',
      invoiceId: '',
      amountPaid: '',
      paymentMethod: 'Cash',
      payerDetails: '',
    });
    setStudentInvoices([]);
  };

  const handleAddFormChange = (e: any) => {
    const { name, value } = e.target;
    setAddFormData({ ...addFormData, [name]: value });
  };

  const handleAddPayment = async () => {
    try {
      const paymentData = {
        invoiceId: addFormData.invoiceId,
        amountPaid: Number(addFormData.amountPaid),
        paymentMethod: addFormData.paymentMethod,
        payerDetails: addFormData.payerDetails,
      };
      await api.post('/feepayments', paymentData);
      closeAddModal();
      fetchFeePayments(); // Refresh the list
      setToastMessage('Fee payment recorded successfully.');
      setShowToast(true);
    } catch (error) {
      console.error('Error recording fee payment:', error);
      setToastMessage('Failed to record fee payment.');
      setShowToast(true);
    }
  };

  return (
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Fee Payments</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton onClick={openAddModal}>
                  <IonIcon slot="start" icon={add} />
                  Add Fee Payment
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonItem>
                  <IonLabel>Filter by Student</IonLabel>
                  <IonSelect value={filterStudent} onIonChange={(e) => setFilterStudent(e.detail.value)}>
                    <IonSelectOption value="">All</IonSelectOption>
                    {students.map((student) => (
                      <IonSelectOption key={student._id} value={student._id}>
                        {student.userId.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol>
                <IonItem>
                  <IonLabel>Filter by Branch</IonLabel>
                  <IonSelect value={filterBranch} onIonChange={(e) => setFilterBranch(e.detail.value)}>
                    <IonSelectOption value="">All</IonSelectOption>
                    {branches.map((branch) => (
                      <IonSelectOption key={branch._id} value={branch._id}>
                        {branch.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <div className="ion-padding">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Admission No.</th>
                        <th>Invoice ID</th>
                        <th>Amount Paid</th>
                        <th>Payment Date</th>
                        <th>Payment Method</th>
                        <th>Recorded By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feePayments.map((fp) => (
                        <tr key={fp._id}>
                          <td data-label="Student">{fp.studentId?.name}</td>
                          <td data-label="Admission No.">{fp.studentId?.admissionNumber}</td>
                          <td data-label="Invoice ID">{fp.invoiceId?._id}</td>
                          <td data-label="Amount Paid">{fp.amountPaid}</td>
                          <td data-label="Payment Date">{new Date(fp.paymentDate).toLocaleDateString()}</td>
                          <td data-label="Payment Method">{fp.paymentMethod}</td>
                          <td data-label="Recorded By">{fp.receivedBy?.name}</td>
                          <td data-label="Actions">
                            <IonButton onClick={() => downloadReceipt(fp._id)}>
                              <IonIcon slot="icon-only" icon={documentText} />
                            </IonButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonModal isOpen={showAddModal} onDidDismiss={closeAddModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Add Fee Payment</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={closeAddModal}>Close</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonItem>
                <IonLabel>Student</IonLabel>
                <IonSelect
                    name="studentId"
                    value={addFormData.studentId}
                    onIonChange={handleAddFormChange}
                  >
                    {students.map((student) => (
                      <IonSelectOption key={student._id} value={student._id}>
                        {student.userId.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel>Invoice</IonLabel>
                  <IonSelect
                    name="invoiceId"
                    value={addFormData.invoiceId}
                    onIonChange={handleAddFormChange}
                    disabled={!addFormData.studentId}
                  >
                    {studentInvoices.map((invoice) => (
                      <IonSelectOption key={invoice._id} value={invoice._id}>
                        {`ID: ${invoice._id} - Due: ${new Date(invoice.dueDate).toLocaleDateString()} - Balance: ${invoice.balance}`}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Amount Paid</IonLabel>
                  <IonInput
                    name="amountPaid"
                    type="number"
                    value={addFormData.amountPaid}
                    onIonChange={handleAddFormChange}
                    required
                  />
                </IonItem>
                <IonItem>
                  <IonLabel>Payment Method</IonLabel>
                  <IonSelect
                    name="paymentMethod"
                    value={addFormData.paymentMethod}
                    onIonChange={handleAddFormChange}
                  >
                    <IonSelectOption value="Cash">Cash</IonSelectOption>
                    <IonSelectOption value="Bank Transfer">Bank Transfer</IonSelectOption>
                    <IonSelectOption value="Online">Online</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Payer Details (Optional)</IonLabel>
                  <IonInput
                    name="payerDetails"
                    value={addFormData.payerDetails}
                    onIonChange={handleAddFormChange}
                  />
                </IonItem>
                <IonButton expand="full" onClick={handleAddPayment} className="ion-margin-top">
                  Save Payment
                </IonButton>
            </IonContent>
          </IonModal>
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={2000}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default FeePayments;
