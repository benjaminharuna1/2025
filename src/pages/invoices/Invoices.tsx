import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonMenuButton,
  IonToast,
  IonList,
  IonListHeader,
  IonLoading,
} from '@ionic/react';
import { eye, documentText, cash, wallet, add, card } from 'ionicons/icons';
import api from '../../services/api';
import { Invoice, Branch, Student, Class } from '../../types';
import { TERMS, SESSIONS } from '../../constants';
import SidebarMenu from '../../components/SidebarMenu';
import './Invoices.css';

const Invoices: React.FC = () => {
  const history = useHistory();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFinancialsModal, setShowFinancialsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [financialsData, setFinancialsData] = useState({ amount: 0, type: 'discount' });
  const [generateFormData, setGenerateFormData] = useState({
    branchId: '',
    session: '',
    term: '',
    dueDate: '',
  });
  const [paymentData, setPaymentData] = useState({
    amountPaid: 0,
    paymentMethod: 'Bank Transfer',
    payerDetails: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInvoices();
    fetchBranches();
    fetchStudents();
    fetchClasses();
  }, [filterBranch, filterStudent, filterStatus, filterClass, page]);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      if (data && Array.isArray(data.classes)) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data } = await api.get('/invoices', {
        params: {
          branchId: filterBranch,
          studentId: filterStudent,
          status: filterStatus,
          classId: filterClass,
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

  const openDetailModal = async (invoiceId: string) => {
    setIsDetailLoading(true);
    setShowDetailModal(true);
    try {
      const { data } = await api.get(`/invoices/${invoiceId}`);
      setSelectedInvoice(data);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      setToastMessage('Could not load invoice details.');
      setShowToast(true);
      setShowDetailModal(false); // Close modal on error
    } finally {
      setIsDetailLoading(false);
    }
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
    setPaymentData({ amountPaid: 0, paymentMethod: 'Bank Transfer', payerDetails: '' });
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

  const handleShowReceipt = (invoiceId: string) => {
    history.push(`/receipt-preview/${invoiceId}`);
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
              <IonCol>
                <IonItem>
                  <IonLabel>Filter by Class</IonLabel>
                  <IonSelect value={filterClass} onIonChange={(e) => setFilterClass(e.detail.value)}>
                    <IonSelectOption value="">All</IonSelectOption>
                    {classes.map((c) => (
                      <IonSelectOption key={c._id} value={c._id}>
                        {c.name}
                      </IonSelectOption>
                    ))}
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
                        <th>S/N</th>
                        <th>Student</th>
                        <th>Admission No.</th>
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
                      {invoices.map((invoice, index) => (
                        <tr key={invoice._id}>
                          <td data-label="S/N">{index + 1}</td>
                          <td data-label="Student">{invoice.studentId?.userId?.name}</td>
                          <td data-label="Admission No.">{invoice.studentId?.admissionNumber}</td>
                          <td data-label="Branch">{invoice.branchId?.name}</td>
                          <td data-label="Session">{invoice.session}</td>
                          <td data-label="Term">{invoice.term}</td>
                          <td data-label="Status">{invoice.status}</td>
                          <td data-label="Total Payable">{invoice.totalPayable}</td>
                          <td data-label="Total Paid">{invoice.totalPaid}</td>
                          <td data-label="Balance">{invoice.balance}</td>
                          <td data-label="Due Date">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                          <td data-label="Actions">
                            <IonButton onClick={() => openDetailModal(invoice._id)}>
                              <IonIcon slot="icon-only" icon={eye} />
                            </IonButton>
                            <IonButton onClick={() => openFinancialsModal(invoice)}>
                              <IonIcon slot="icon-only" icon={wallet} />
                            </IonButton>
                            <IonButton onClick={() => handleShowReceipt(invoice._id)}>
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
            <IonHeader>
              <IonToolbar>
                <IonTitle>Invoice Details</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={closeDetailModal}>Close</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonLoading isOpen={isDetailLoading} message={'Loading details...'} />
              {!isDetailLoading && selectedInvoice && (
                <IonList>
                  <IonItem>
                    <IonLabel>Student:</IonLabel>
                    <p>{selectedInvoice.studentId.userId.name}</p>
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

                  {selectedInvoice.feeStructureId && selectedInvoice.feeStructureId.fees ? (
                    <>
                      <IonListHeader>
                        <IonLabel>Fee Breakdown</IonLabel>
                      </IonListHeader>
                      {selectedInvoice.feeStructureId.fees.map((fee: any, index: number) => (
                        <IonItem key={index}>
                          <IonLabel>{fee.feeType}:</IonLabel>
                          <p>{fee.amount}</p>
                        </IonItem>
                      ))}
                    </>
                  ) : (
                    <IonItem>
                      <IonLabel>No fee breakdown available.</IonLabel>
                    </IonItem>
                  )}
                </IonList>
              )}
            </IonContent>
          </IonModal>

          {/* Apply Financials Modal */}
          <IonModal isOpen={showFinancialsModal} onDidDismiss={closeFinancialsModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Apply Financials</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={closeFinancialsModal}>Close</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
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
            </IonContent>
          </IonModal>

          {/* Payment Modal */}
          <IonModal isOpen={showPaymentModal} onDidDismiss={closePaymentModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Record Payment</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={closePaymentModal}>Close</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
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
              <IonItem>
                <IonLabel position="floating">Payer Details (Optional)</IonLabel>
                <IonInput name="payerDetails" value={paymentData.payerDetails} onIonChange={handlePaymentChange} />
              </IonItem>
              <IonButton expand="full" onClick={handleMakePayment} className="ion-margin-top">
                Record Payment
              </IonButton>
            </IonContent>
          </IonModal>

          {/* Generate Invoices Modal */}
          <IonModal isOpen={showGenerateModal} onDidDismiss={closeGenerateModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Generate Invoices</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={closeGenerateModal}>Close</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
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
                <IonLabel>Session</IonLabel>
                <IonSelect name="session" value={generateFormData.session} onIonChange={handleGenerateFormChange}>
                  {SESSIONS.map(session => (
                    <IonSelectOption key={session} value={session}>{session}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Term</IonLabel>
                <IonSelect name="term" value={generateFormData.term} onIonChange={handleGenerateFormChange}>
                  {TERMS.map(term => (
                    <IonSelectOption key={term} value={term}>{term}</IonSelectOption>
                  ))}
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

export default Invoices;
