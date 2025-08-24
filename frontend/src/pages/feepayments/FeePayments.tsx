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
import { FeePayment, User } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './FeePayments.css';

const FeePayments: React.FC = () => {
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [filterStudent, setFilterStudent] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    invoiceId: '',
    amountPaid: '',
    paymentMethod: 'Cash',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFeePayments();
    fetchStudents();
  }, [filterStudent, page]);

  const fetchFeePayments = async () => {
    try {
      const { data } = await api.get('/feepayments', {
        params: { studentId: filterStudent, page },
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
      const { data } = await api.get('/users', {
        params: { role: 'Student' },
      });
      setStudents(data.users || []);
    } catch (error) {
      console.error('Error fetching students:', error);
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
    setAddFormData({ invoiceId: '', amountPaid: '', paymentMethod: 'Cash' });
  };

  const handleAddFormChange = (e: any) => {
    const { name, value } = e.target;
    setAddFormData({ ...addFormData, [name]: value });
  };

  const handleAddPayment = async () => {
    try {
      await api.post('/feepayments', {
        ...addFormData,
        amountPaid: Number(addFormData.amountPaid),
      });
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
                        {student.name}
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
                          <td data-label="Invoice ID">{fp.invoiceId?._id}</td>
                          <td data-label="Amount Paid">{fp.amountPaid}</td>
                          <td data-label="Payment Date">{new Date(fp.paymentDate).toLocaleDate-String()}</td>
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
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Add Fee Payment</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="floating">Invoice ID</IonLabel>
                  <IonInput
                    name="invoiceId"
                    value={addFormData.invoiceId}
                    onIonChange={handleAddFormChange}
                    required
                  />
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
                <IonButton expand="full" onClick={handleAddPayment} className="ion-margin-top">
                  Save Payment
                </IonButton>
                <IonButton expand="full" color="light" onClick={closeAddModal}>
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

export default FeePayments;
