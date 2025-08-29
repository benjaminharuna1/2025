import React, { useState, useEffect, useCallback } from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonToast,
  IonButtons,
  IonMenuButton,
  IonIcon,
} from '@ionic/react';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Branch, Class, LeaveRequest, Student } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';

const LeaveRequestManagement: React.FC = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('');

  // Fetch initial dropdown data
  useEffect(() => {
    if (user?.role === 'Super Admin') {
      api.get('/branches')
        .then(res => setBranches(res.data.branches || []))
        .catch(err => console.error("Error fetching branches", err));
    } else if (user?.branchId) {
      setSelectedBranch(user.branchId);
    }
  }, [user]);

  // Fetch classes when branch changes
  useEffect(() => {
    if (selectedBranch) {
      api.get(`/classes?branchId=${selectedBranch}`)
        .then(res => setClasses(res.data.classes || []))
        .catch(err => console.error("Error fetching classes", err));
    }
  }, [selectedBranch]);

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBranch) params.append('branchId', selectedBranch);
      if (selectedClass) params.append('classId', selectedClass);
      if (statusFilter) params.append('status', statusFilter);

      const { data } = await api.get(`/leaverequests?${params.toString()}`);
      setLeaveRequests(data.leaveRequests || []);
    } catch (error) {
      setToastMessage('Error fetching leave requests');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, selectedClass, statusFilter]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const handleUpdateRequest = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.put(`/leaverequests/${id}`, { status });
      setToastMessage(`Request ${status.toLowerCase()} successfully`);
      setToastColor('success');
      setShowToast(true);
      fetchLeaveRequests(); // Refresh the list
    } catch (error) {
      setToastMessage('Error updating request');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  if (!user || !['Super Admin', 'Branch Admin', 'Teacher'].includes(user.role)) {
    return <IonPage><IonHeader><IonToolbar><IonTitle>Unauthorized</IonTitle></IonToolbar></IonHeader><IonContent><p>You are not authorized to view this page.</p></IonContent></IonPage>;
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
            <IonTitle>Leave Requests</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} message="Loading..." />
          <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={2000} color={toastColor} />

          <div className="filters">
            {user.role === 'Super Admin' && (
              <IonItem>
                <IonLabel>Branch</IonLabel>
                <IonSelect value={selectedBranch} onIonChange={e => setSelectedBranch(e.detail.value)}>
                  {branches.map(b => <IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>)}
                </IonSelect>
              </IonItem>
            )}
             <IonItem>
                <IonLabel>Class</IonLabel>
                <IonSelect value={selectedClass} onIonChange={e => setSelectedClass(e.detail.value)}>
                     <IonSelectOption value="">All Classes</IonSelectOption>
                    {classes.map(c => <IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>)}
                </IonSelect>
            </IonItem>
            <IonItem>
                <IonLabel>Status</IonLabel>
                <IonSelect value={statusFilter} onIonChange={e => setStatusFilter(e.detail.value)}>
                    <IonSelectOption value="Pending">Pending</IonSelectOption>
                    <IonSelectOption value="Approved">Approved</IonSelectOption>
                    <IonSelectOption value="Rejected">Rejected</IonSelectOption>
                </IonSelect>
            </IonItem>
          </div>

          <IonGrid>
            <IonRow>
              <IonCol><strong>Student</strong></IonCol>
              <IonCol><strong>Dates</strong></IonCol>
              <IonCol><strong>Reason</strong></IonCol>
              <IonCol><strong>Status</strong></IonCol>
              <IonCol><strong>Actions</strong></IonCol>
            </IonRow>
            {leaveRequests.map(req => (
              <IonRow key={req._id}>
                <IonCol>{typeof req.studentId === 'object' ? req.studentId.name : req.studentId}</IonCol>
                <IonCol>{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</IonCol>
                <IonCol>{req.reason}</IonCol>
                <IonCol>{req.status}</IonCol>
                <IonCol>
                  {req.status === 'Pending' && (
                    <>
                      <IonButton color="success" onClick={() => handleUpdateRequest(req._id, 'Approved')}>
                        <IonIcon slot="icon-only" icon={checkmarkCircleOutline} />
                      </IonButton>
                      <IonButton color="danger" onClick={() => handleUpdateRequest(req._id, 'Rejected')}>
                        <IonIcon slot="icon-only" icon={closeCircleOutline} />
                      </IonButton>
                    </>
                  )}
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </IonContent>
      </IonPage>
    </>
  );
};

export default LeaveRequestManagement;
