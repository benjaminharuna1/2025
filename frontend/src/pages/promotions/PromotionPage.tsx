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
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonButtons,
  IonMenuButton,
  IonLoading,
  IonToast,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonTextarea,
} from '@ionic/react';
import { create } from 'ionicons/icons';
import SidebarMenu from '../../components/SidebarMenu';
import { Branch, Class, Session } from '../../types';
import api from '../../services/api';
import { getSessions } from '../../services/sessionsApi';

interface PromotionResult {
  studentId: { _id: string, name: string };
  sessionId: string;
  fromClassId: string;
  toClassId: string;
  status: 'Promoted' | 'Repeated';
  finalAverage: number;
  _id: string; // promotion record ID
}

const PromotionPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [promotionResults, setPromotionResults] = useState<PromotionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // State for override modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionResult | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<'Promoted' | 'Repeated'>('Promoted');
  const [overrideComment, setOverrideComment] = useState('');


  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [branchesRes, sessionsRes] = await Promise.all([
          api.get('/branches'),
          getSessions(),
        ]);
        setBranches(branchesRes.data.branches || []);
        setSessions(sessionsRes);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        setToastMessage("Could not load required data.");
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      if (selectedBranch) {
        setLoading(true);
        try {
          const res = await api.get(`/classes?branchId=${selectedBranch}`);
          setClasses(res.data.classes || []);
        } catch (error) {
          console.error("Failed to fetch classes", error);
          setToastMessage("Could not load classes for the selected branch.");
          setShowToast(true);
        } finally {
          setLoading(false);
        }
      } else {
        setClasses([]);
      }
    };
    fetchClasses();
  }, [selectedBranch]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    setSelectedClass(''); // Reset class selection
  };

  const handleRunPromotion = async () => {
    if (!selectedClass || !selectedSessionId) {
      setToastMessage("Please select both a class and a session.");
      setShowToast(true);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/promotions/run/${selectedClass}/${selectedSessionId}`);
      setPromotionResults(res.data.data || []);
      setToastMessage(res.data.message || "Promotion process completed.");
      setShowToast(true);
    } catch (error) {
      console.error("Promotion process failed", error);
      const errorMsg = (error as any).response?.data?.message || "An error occurred during promotion.";
      setToastMessage(errorMsg);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOverrideModal = (promotion: PromotionResult) => {
    setSelectedPromotion(promotion);
    setOverrideStatus(promotion.status);
    setOverrideComment('');
    setShowOverrideModal(true);
  };

  const handleCloseOverrideModal = () => {
    setShowOverrideModal(false);
    setSelectedPromotion(null);
    setOverrideComment('');
  };

  const handleSaveChanges = async () => {
    if (!selectedPromotion || !overrideComment) {
      setToastMessage("New status and comment are required for override.");
      setShowToast(true);
      return;
    }
    setLoading(true);
    try {
      const res = await api.put(`/promotions/${selectedPromotion._id}`, {
        status: overrideStatus,
        comment: overrideComment,
      });
      // Update the specific result in the local state
      setPromotionResults(prev =>
        prev.map(p => p._id === selectedPromotion._id ? res.data : p)
      );
      setToastMessage("Promotion status overridden successfully.");
      setShowToast(true);
      handleCloseOverrideModal();
    } catch (error) {
      console.error("Failed to override promotion status", error);
      const errorMsg = (error as any).response?.data?.message || "An error occurred during override.";
      setToastMessage(errorMsg);
      setShowToast(true);
    } finally {
      setLoading(false);
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
            <IonTitle>End of Session Processing</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} />
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={3000}
          />
          <IonGrid>
            <IonRow>
              <IonCol>
                <h1>Promotion & End of Session</h1>
                <p>Select a class and session to begin.</p>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size-md="4">
                <IonItem>
                  <IonLabel>Branch</IonLabel>
                  <IonSelect value={selectedBranch} onIonChange={e => handleBranchChange(e.detail.value)}>
                    {branches.map(b => <IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="4">
                <IonItem>
                  <IonLabel>Class</IonLabel>
                  <IonSelect value={selectedClass} onIonChange={e => setSelectedClass(e.detail.value)} disabled={!selectedBranch}>
                    {classes.map(c => <IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="4">
                <IonItem>
                  <IonLabel>Session</IonLabel>
                  <IonSelect value={selectedSessionId} onIonChange={e => setSelectedSessionId(e.detail.value)}>
                    {sessions.map(s => <IonSelectOption key={s._id} value={s._id}>{s.academicYear} {s.term}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="4" className="ion-align-self-end">
                <IonButton expand="block" onClick={handleRunPromotion} disabled={!selectedClass || !selectedSessionId}>
                  Run Promotion Process
                </IonButton>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Final Average</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotionResults.map(result => (
                      <tr key={result._id}>
                        <td data-label="Student">{result.studentId.name}</td>
                        <td data-label="Final Average">{result.finalAverage.toFixed(2)}</td>
                        <td data-label="Status">{result.status}</td>
                        <td data-label="Actions">
                          <IonButton size="small" onClick={() => handleOpenOverrideModal(result)}>
                            <IonIcon icon={create} slot="icon-only" />
                          </IonButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Override Modal */}
          <IonModal isOpen={showOverrideModal} onDidDismiss={handleCloseOverrideModal}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Override Promotion Status</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>Student: <strong>{selectedPromotion?.studentId.name}</strong></p>
                <IonItem>
                  <IonLabel>New Status</IonLabel>
                  <IonSelect value={overrideStatus} onIonChange={e => setOverrideStatus(e.detail.value)}>
                    <IonSelectOption value="Promoted">Promoted</IonSelectOption>
                    <IonSelectOption value="Repeated">Repeated</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Comment</IonLabel>
                  <IonTextarea value={overrideComment} onIonChange={e => setOverrideComment(e.detail.value!)} rows={4} />
                </IonItem>
                <IonButton expand="block" onClick={handleSaveChanges} className="ion-margin-top">Save Changes</IonButton>
                <IonButton expand="block" color="light" onClick={handleCloseOverrideModal}>Cancel</IonButton>
              </IonCardContent>
            </IonCard>
          </IonModal>
        </IonContent>
      </IonPage>
    </>
  );
};

export default PromotionPage;
