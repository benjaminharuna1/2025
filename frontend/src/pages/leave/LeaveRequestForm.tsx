import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonDatetime,
  IonTextarea,
  IonLoading,
  IonToast,
  IonButtons,
  IonMenuButton,
} from '@ionic/react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Student } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';

const LeaveRequestForm: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('');

  useEffect(() => {
    const fetchMyStudents = async () => {
      if (user?.role === 'Parent') {
        setLoading(true);
        try {
          // Assuming an endpoint to get students linked to the parent
          const { data } = await api.get('/students/my-children');
          setStudents(data.students || []);
        } catch (error) {
          setToastMessage('Error fetching your children');
          setToastColor('danger');
          setShowToast(true);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMyStudents();
  }, [user]);

  const handleSubmit = async () => {
    if (!selectedStudent || !startDate || !endDate || reason.length < 10) {
      setToastMessage('Please fill all fields. Reason must be at least 10 characters.');
      setToastColor('warning');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const leaveData = {
        studentId: selectedStudent,
        startDate: startDate.split('T')[0],
        endDate: endDate.split('T')[0],
        reason,
      };
      await api.post('/leaverequests', leaveData);
      setToastMessage('Leave request submitted successfully!');
      setToastColor('success');
      // Reset form
      setSelectedStudent('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (error) {
      setToastMessage('Error submitting leave request');
      setToastColor('danger');
    } finally {
      setLoading(false);
      setShowToast(true);
    }
  };

  if (user?.role !== 'Parent') {
     return <IonPage><IonHeader><IonToolbar><IonTitle>Unauthorized</IonTitle></IonToolbar></IonHeader><IonContent><p>This page is for parents only.</p></IonContent></IonPage>;
  }

  return (
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Submit Leave Request</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} message="Submitting..." />
          <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={3000} color={toastColor} />

          <IonItem>
            <IonLabel>Child</IonLabel>
            <IonSelect value={selectedStudent} onIonChange={e => setSelectedStudent(e.detail.value)}>
              {students.map(s => <IonSelectOption key={s._id} value={s._id}>{s.name}</IonSelectOption>)}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel>Start Date</IonLabel>
            <IonDatetime displayFormat="YYYY-MM-DD" value={startDate} onIonChange={e => setStartDate(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel>End Date</IonLabel>
            <IonDatetime displayFormat="YYYY-MM-DD" value={endDate} onIonChange={e => setEndDate(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Reason</IonLabel>
            <IonTextarea value={reason} onIonChange={e => setReason(e.detail.value!)} rows={5} placeholder="Minimum 10 characters" />
          </IonItem>
          <IonButton expand="full" onClick={handleSubmit}>Submit Request</IonButton>
        </IonContent>
      </IonPage>
    </>
  );
};

export default LeaveRequestForm;
