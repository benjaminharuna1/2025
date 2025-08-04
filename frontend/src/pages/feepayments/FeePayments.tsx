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
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import axios from 'axios';
import './FeePayments.css';

const API_URL = 'http://localhost:3000/api';

const FeePayments: React.FC = () => {
  const [feePayments, setFeePayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeePayment, setSelectedFeePayment] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [filterStudent, setFilterStudent] = useState('');

  useEffect(() => {
    fetchFeePayments();
    fetchStudents();
    fetchFeeStructures();
  }, [filterStudent]);

  const fetchFeePayments = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/feepayments`, {
        withCredentials: true,
        params: { studentId: filterStudent },
      });
      if (data && Array.isArray(data.feePayments)) {
        setFeePayments(data.feePayments);
      } else {
        setFeePayments([]);
      }
    } catch (error) {
      console.error('Error fetching fee payments:', error);
      setFeePayments([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users`, {
        withCredentials: true,
        params: { role: 'Student' },
      });
      if (data && Array.isArray(data.users)) {
        setStudents(data.users);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/feestructures`, { withCredentials: true });
      if (data && Array.isArray(data.feeStructures)) {
        setFeeStructures(data.feeStructures);
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    }
  };

  const handleSave = async () => {
    if (selectedFeePayment) {
      await axios.put(`${API_URL}/feepayments/${selectedFeePayment._id}`, formData, { withCredentials: true });
    } else {
      await axios.post(`${API_URL}/feepayments`, formData, { withCredentials: true });
    }
    fetchFeePayments();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`${API_URL}/feepayments/${id}`, { withCredentials: true });
    fetchFeePayments();
  };

  const openModal = (feePayment: any | null = null) => {
    setSelectedFeePayment(feePayment);
    setFormData(feePayment ? { ...feePayment } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFeePayment(null);
    setFormData({});
  };

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.detail.value });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Fee Payments</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton onClick={() => openModal()}>
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
                      <th>Fee Structure</th>
                      <th>Amount Paid</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feePayments.map((fp) => (
                      <tr key={fp._id}>
                        <td data-label="Student">{fp.studentId?.userId.name}</td>
                        <td data-label="Fee Structure">{fp.feeStructureId?.session} - {fp.feeStructureId?.term}</td>
                        <td data-label="Amount Paid">{fp.amountPaid}</td>
                        <td data-label="Payment Method">{fp.paymentMethod}</td>
                        <td data-label="Status">{fp.status}</td>
                        <td data-label="Actions">
                          <IonButton onClick={() => openModal(fp)}>
                            <IonIcon slot="icon-only" icon={create} />
                          </IonButton>
                          <IonButton color="danger" onClick={() => handleDelete(fp._id)}>
                            <IonIcon slot="icon-only" icon={trash} />
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
        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{selectedFeePayment ? 'Edit' : 'Add'} Fee Payment</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel>Student</IonLabel>
                <IonSelect name="studentId" value={formData.studentId} onIonChange={handleInputChange}>
                  {students.map((student) => (
                    <IonSelectOption key={student._id} value={student._id}>
                      {student.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Fee Structure</IonLabel>
                <IonSelect name="feeStructureId" value={formData.feeStructureId} onIonChange={handleInputChange}>
                  {feeStructures.map((fs) => (
                    <IonSelectOption key={fs._id} value={fs._id}>
                      {fs.session} - {fs.term}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Amount Paid</IonLabel>
                <IonInput name="amountPaid" type="number" value={formData.amountPaid} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Payment Method</IonLabel>
                <IonInput name="paymentMethod" value={formData.paymentMethod} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel>Status</IonLabel>
                <IonSelect name="status" value={formData.status} onIonChange={handleInputChange}>
                  <IonSelectOption value="Paid">Paid</IonSelectOption>
                  <IonSelectOption value="Pending">Pending</IonSelectOption>
                  <IonSelectOption value="Failed">Failed</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonButton expand="full" onClick={handleSave} className="ion-margin-top">
                Save
              </IonButton>
              <IonButton expand="full" color="light" onClick={closeModal}>
                Cancel
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default FeePayments;
