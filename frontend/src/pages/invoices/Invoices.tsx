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
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonMenuButton,
  IonToast,
  IonList,
} from '@ionic/react';
import { eye, documentText, cash, wallet, add, card } from 'ionicons/icons';
import api from '../../services/api';
import { Invoice, Branch, Student } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './Invoices.css';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFinancialsModal, setShowFinancialsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [financialsData, setFinancialsData] = useState({ amount: 0, type: 'discount' });
  const [generateFormData, setGenerateFormData] = useState({
    branchId: '',
    session: '',
    term: '',
    dueDate: '',
  });
  const [paymentData, setPaymentData] = useState({ amountPaid: 0, paymentMethod: 'Bank Transfer' });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInvoices();
    fetchBranches();
    fetchStudents();
  }, [filterBranch, filterStudent, filterStatus, page]);

  const fetchInvoices = async () => {
    try {
      const { data } = await api.get('/invoices', {
        params: {
          branchId: filterBranch,
          studentId: filterStudent,
          status: filterStatus,
          page,
        },
      });
      if (data && Array.isArray(data.invoices)) {
        setInvoices(data.invoices);
        setTotalPages(data.pages);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
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

  const handleApplyFinancials = async () => {
    if (!selectedInvoice) return;
    try {
      await api.post(`/invoices/${selectedInvoice._id}/${financialsData.type}`, { amount: financialsData.amount });
      fetchInvoices();
      closeFinancialsModal();
      setToastMessage('Financials applied successfully.');
      setShowToast(true);
    } catch (error) {
      console.error('Error applying financials:', error);
      setToastMessage('Failed to apply financials.');
      setShowToast(true);
    }
  };

  const handleMakePayment = async () => {
    if (!selectedInvoice) return;
    try {
      await api.post('/feepayments', {
        ...paymentData,
        invoiceId: selectedInvoice._id,
      });
      fetchInvoices();
      closePaymentModal();
      setToastMessage('Payment recorded successfully.');
      setShowToast(true);
    } catch (error) {
      console.error('Error making payment:', error);
      setToastMessage('Failed to record payment.');
      setShowToast(true);
    }
  };

  const handleGenerateInvoices = async () => {
    try {
      const { data } = await api.post('/invoices/generate', generateFormData);
      closeGenerateModal();
      fetchInvoices(); // Refresh the list
      setToastMessage(
        `Invoice generation complete. Generated: ${data.generatedCount}, Skipped: ${data.skippedCount}.`
      );
      setShowToast(true);
    } catch (error) {
      console.error('Error generating invoices:', error);
      setToastMessage('Failed to generate invoices.');
      setShowToast(true);
    }
  };

  const handleInitiateOnlinePayment = async (invoiceId: string) => {
    try {
      const { data } = await api.post(`/invoices/${invoiceId}/initiate-payment`);
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
      }
      setToastMessage('Redirecting to payment gateway...');
      setShowToast(true);
    } catch (error) {
      console.error('Error initiating online payment:', error);
      setToastMessage('Failed to initiate online payment.');
      setShowToast(true);
    }
  };

  const openDetailModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedInvoice(null);
  };

  const openFinancialsModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowFinancialsModal(true);
  };

  const closeFinancialsModal = () => {
    setShowFinancialsModal(false);
    setSelectedInvoice(null);
    setFinancialsData({ amount: 0, type: 'discount' });
  };

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentData({ amountPaid: 0, paymentMethod: 'Bank Transfer' });
  };

  const handleFinancialsChange = (e: any) => {
    const { name, value } = e.target;
    setFinancialsData({ ...financialsData, [name]: value });
  };

  const handlePaymentChange = (e: any) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
  };

  const handleGenerateFormChange = (e: any) => {
    const { name, value } = e.target;
    setGenerateFormData({ ...generateFormData, [name]: value });
  };

  const openGenerateModal = () => {
    setShowGenerateModal(true);
  };

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setGenerateFormData({ branchId: '', session: '', term: '', dueDate: '' });
  };

  const downloadPDF = (id: string) => {
    window.open(`${api.defaults.baseURL}/invoices/${id}/pdf`, '_blank');
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
            <IonTitle>Invoices</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
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
                  <IonLabel>Filter by Status</IonLabel>
                  <IonSelect value={filterStatus} onIonChange={(e) => setFilterStatus(e.detail.value)}>
                    <IonSelectOption value="">All</IonSelectOption>
                    <IonSelectOption value="Unpaid">Unpaid</IonSelectOption>
                    <IonSelectOption value="Paid">Paid</IonSelectOption>
                    <IonSelectOption value="Partially Paid">Partially Paid</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size="auto">
                <IonButton onClick={openGenerateModal}>
                  <IonIcon slot="start" icon={add} />
                  Generate Invoices
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <div className="ion-padding">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Branch</th>
                        <th>Session</th>
                        <th>Term</th>
                        <th>Status</th>
                        <th>Total Payable</th>
                        <th>Total Paid</th>
                        <th>Balance</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice._id}>
                          <td data-label="Student">{invoice.studentId?.name}</td>
                          <td data-label="Branch">{invoice.branchId?.name}</td>
                          <td data-label="Session">{invoice.session}</td>
                          <td data-label="Term">{invoice.term}</td>
                          <td data-label="Status">{invoice.status}</td>
                          <td data-label="Total Payable">{invoice.totalPayable}</td>
                          <td data-label="Total Paid">{invoice.totalPaid}</td>
                          <td data-label="Balance">{invoice.balance}</td>
                          <td data-label="Due Date">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                          <td data-label="Actions">
                            <IonButton onClick={() => openDetailModal(invoice)}>
                              <IonIcon slot="icon-only" icon={eye} />
                            </IonButton>
                            <IonButton onClick={() => openFinancialsModal(invoice)}>
                              <IonIcon slot="icon-only" icon={wallet} />
                            </IonButton>
                            <IonButton onClick={() => downloadPDF(invoice._id)}>
                              <IonIcon slot="icon-only" icon={documentText} />
                            </IonButton>
                            <IonButton onClick={() => openPaymentModal(invoice)}>
                              <IonIcon slot="icon-only" icon={cash} />
                            </IonButton>
                            <IonButton color="secondary" onClick={() => handleInitiateOnlinePayment(invoice._id)}>
                              <IonIcon slot="icon-only" icon={card} />
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

          {/* Invoice Detail Modal */}
          <IonModal isOpen={showDetailModal} onDidDismiss={closeDetailModal}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Invoice Details</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {selectedInvoice && (
                  <IonList>
                    <IonItem>
                      <IonLabel>Student:</IonLabel>
                      <p>{selectedInvoice.studentId.name}</p>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Branch:</IonLabel>
                      <p>{selectedInvoice.branchId.name}</p>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Session:</IonLabel>
                      <p>{selectedInvoice.session} - {selectedInvoice.term}</p>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Status:</IonLabel>
                      <p>{selectedInvoice.status}</p>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Total Payable:</IonLabel>
                      <p>{selectedInvoice.totalPayable}</p>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Total Paid:</IonLabel>
                      <p>{selectedInvoice.totalPaid}</p>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Balance:</IonLabel>
                      <p>{selectedInvoice.balance}</p>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Due Date:</IonLabel>
                      <p>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    </IonItem>
                    <IonCardTitle>Fee Breakdown</IonCardTitle>
                    {selectedInvoice.feeStructureId.fees.map((fee, index) => (
                      <IonItem key={index}>
                        <IonLabel>{fee.feeType}:</IonLabel>
                        <p>{fee.amount}</p>
                      </IonItem>
                    ))}
                  </IonList>
                )}
                <IonButton expand="full" color="light" onClick={closeDetailModal}>
                  Close
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>

          {/* Apply Financials Modal */}
          <IonModal isOpen={showFinancialsModal} onDidDismiss={closeFinancialsModal}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Apply Discount/Scholarship/Late Fee</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel>Type</IonLabel>
                  <IonSelect name="type" value={financialsData.type} onIonChange={handleFinancialsChange}>
                    <IonSelectOption value="discount">Discount</IonSelectOption>
                    <IonSelectOption value="scholarship">Scholarship</IonSelectOption>
                    <IonSelectOption value="latefee">Late Fee</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Amount</IonLabel>
                  <IonInput name="amount" type="number" value={financialsData.amount} onIonChange={handleFinancialsChange} />
                </IonItem>
                <IonButton expand="full" onClick={handleApplyFinancials} className="ion-margin-top">
                  Apply
                </IonButton>
                <IonButton expand="full" color="light" onClick={closeFinancialsModal}>
                  Cancel
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>

          {/* Payment Modal */}
          <IonModal isOpen={showPaymentModal} onDidDismiss={closePaymentModal}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Record Payment</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="floating">Amount Paid</IonLabel>
                  <IonInput name="amountPaid" type="number" value={paymentData.amountPaid} onIonChange={handlePaymentChange} />
                </IonItem>
                <IonItem>
                  <IonLabel>Payment Method</IonLabel>
                  <IonSelect name="paymentMethod" value={paymentData.paymentMethod} onIonChange={handlePaymentChange}>
                    <IonSelectOption value="Bank Transfer">Bank Transfer</IonSelectOption>
                    <IonSelectOption value="Cash">Cash</IonSelectOption>
                    <IonSelectOption value="Online">Online</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonButton expand="full" onClick={handleMakePayment} className="ion-margin-top">
                  Record Payment
                </IonButton>
                <IonButton expand="full" color="light" onClick={closePaymentModal}>
                  Cancel
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>

          {/* Generate Invoices Modal */}
          <IonModal isOpen={showGenerateModal} onDidDismiss={closeGenerateModal}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Generate Invoices in Bulk</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel>Branch</IonLabel>
                  <IonSelect
                    name="branchId"
                    value={generateFormData.branchId}
                    onIonChange={handleGenerateFormChange}
                  >
                    {branches.map((branch) => (
                      <IonSelectOption key={branch._id} value={branch._id}>
                        {branch.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Session (e.g., 2023/2024)</IonLabel>
                  <IonInput
                    name="session"
                    value={generateFormData.session}
                    onIonChange={handleGenerateFormChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel>Term</IonLabel>
                  <IonSelect name="term" value={generateFormData.term} onIonChange={handleGenerateFormChange}>
                    <IonSelectOption value="First Term">First Term</IonSelectOption>
                    <IonSelectOption value="Second Term">Second Term</IonSelectOption>
                    <IonSelectOption value="Third Term">Third Term</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Due Date</IonLabel>
                  <IonInput
                    name="dueDate"
                    type="date"
                    value={generateFormData.dueDate}
                    onIonChange={handleGenerateFormChange}
                  />
                </IonItem>
                <IonButton expand="full" onClick={handleGenerateInvoices} className="ion-margin-top">
                  Generate
                </IonButton>
                <IonButton expand="full" color="light" onClick={closeGenerateModal}>
                  Cancel
                </IonButton>
              </IonCardContent>
            </IonCard>
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

export default Invoices;
