import React, { useState, useEffect, useMemo } from 'react';
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
import { Class, Session, Branch } from '../../types';
import api from '../../services/api';
import { getSessions } from '../../services/sessionsApi';
import { useAuth } from '../../contexts/AuthContext';

interface PromotionResult {
  studentId: { _id: string, name: string };
  sessionId: string;
  fromClassId: string;
  toClassId: string;
  status: 'Promoted' | 'Repeated' | 'Graduated';
  finalAverage: number;
  _id: string;
}

const PromotionPage: React.FC = () => {
  const { user } = useAuth();

  // Raw data from API
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);

  // Page specific state
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(user?.role === 'Branch Admin' ? user.branchId || '' : '');
  const [promotionResults, setPromotionResults] = useState<PromotionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionResult | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<'Promoted' | 'Repeated'>('Promoted');
  const [overrideComment, setOverrideComment] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [ api.get('/classes'), getSessions() ];
        if (user?.role === 'Super Admin') {
          promises.push(api.get('/branches'));
        }
        const [classesRes, sessionsRes, branchesRes] = await Promise.all(promises);
        setAllClasses(classesRes.data.classes || classesRes.data || []);
        setAllSessions(sessionsRes || []);
        if (branchesRes) {
          setAllBranches(branchesRes.data.branches || branchesRes.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        setToastMessage("Could not load required data.");
      } finally {
        setLoading(false);
      }
    };
    if(user) {
      fetchInitialData();
    }
  }, [user]);

  const filteredClasses = useMemo(() => {
    if (!user) return [];
    if (user.role === 'Teacher') {
      return user.classes ? allClasses.filter(c => user.classes.includes(c._id)) : [];
    }
    const branchId = user.role === 'Super Admin' ? selectedBranchId : user.branchId;
    if (branchId) {
      return allClasses.filter(c => c.branchId === branchId);
    }
    return user.role === 'Super Admin' ? allClasses : [];
  }, [user, allClasses, selectedBranchId]);

  const filteredSessions = useMemo(() => {
    if (!user) return [];
    const branchId = user.role === 'Super Admin' ? selectedBranchId : user.branchId;
    if (branchId) {
      return allSessions.filter(s => !s.branchId || s.branchId === branchId);
    }
    return allSessions;
  }, [user, allSessions, selectedBranchId]);

  const handleRunPromotion = async () => {
    if (!selectedClassId || !selectedSessionId) {
      setToastMessage("Please select both a class and a session.");
      return;
    }
    setLoading(true);
    setPromotionResults([]); // Clear previous results
    try {
      const res = await api.post(`/promotions/run/${selectedClassId}/${selectedSessionId}`);
      setPromotionResults(res.data.data || []);
      setToastMessage(res.data.message || "Promotion process completed.");
    } catch (error: any) {
      console.error("Promotion process failed", error);
      const errorMsg = error.response?.data?.message || "An error occurred during promotion.";
      setToastMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOverrideModal = (promotion: PromotionResult) => {
    setSelectedPromotion(promotion);
    setOverrideStatus(promotion.status as 'Promoted' | 'Repeated');
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
      return;
    }
    setLoading(true);
    try {
      const res = await api.put(`/promotions/${selectedPromotion._id}`, {
        status: overrideStatus,
        comment: overrideComment,
      });
      setPromotionResults(prev => prev.map(p => p._id === selectedPromotion._id ? { ...p, ...res.data } : p));
      setToastMessage("Promotion status overridden successfully.");
      handleCloseOverrideModal();
    } catch (error: any) {
      console.error("Failed to override promotion status", error);
      const errorMsg = error.response?.data?.message || "An error occurred during override.";
      setToastMessage(errorMsg);
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
            <IonButtons slot="start"><IonMenuButton /></IonButtons>
            <IonTitle>End of Session Processing</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} />
          <IonToast isOpen={!!toastMessage} onDidDismiss={() => setToastMessage('')} message={toastMessage} duration={3000} />
          <IonGrid>
            <IonRow>
              <IonCol>
                <h1>Promotion & End of Session</h1>
                <p>Select a branch, class, and session to begin the promotion process.</p>
              </IonCol>
            </IonRow>
            <IonRow>
              {user?.role === 'Super Admin' && (
                <IonCol size-md="4">
                  <IonItem>
                    <IonLabel>Branch</IonLabel>
                    <IonSelect value={selectedBranchId} onIonChange={e => {setSelectedBranchId(e.detail.value); setSelectedClassId('');}}>
                      {allBranches.map(b => <IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>)}
                    </IonSelect>
                  </IonItem>
                </IonCol>
              )}
              <IonCol size-md="4">
                <IonItem>
                  <IonLabel>Class</IonLabel>
                  <IonSelect value={selectedClassId} onIonChange={e => setSelectedClassId(e.detail.value)} disabled={user?.role === 'Super Admin' && !selectedBranchId}>
                    {filteredClasses.map(c => <IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size-md="4">
                <IonItem>
                  <IonLabel>Session</IonLabel>
                  <IonSelect value={selectedSessionId} onIonChange={e => setSelectedSessionId(e.detail.value)}>
                    {filteredSessions.map(s => <IonSelectOption key={s._id} value={s._id}>{s.academicYear} {s.term}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
                <IonCol>
                    <IonButton expand="block" onClick={handleRunPromotion} disabled={!selectedClassId || !selectedSessionId}>
                    Run Promotion Process
                    </IonButton>
                </IonCol>
            </IonRow>

            {promotionResults.length > 0 && (
              <IonRow>
                <IonCol>
                  <table className="responsive-table">
                    <thead><tr><th>Student</th><th>Final Average</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {promotionResults.map(result => (
                        <tr key={result._id}>
                          <td data-label="Student">{result.studentId.name}</td>
                          <td data-label="Final Average">{result.finalAverage.toFixed(2)}</td>
                          <td data-label="Status">{result.status}</td>
                          <td data-label="Actions">
                            <IonButton size="small" onClick={() => handleOpenOverrideModal(result)}><IonIcon icon={create} slot="icon-only" /></IonButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </IonCol>
              </IonRow>
            )}
          </IonGrid>

          <IonModal isOpen={showOverrideModal} onDidDismiss={handleCloseOverrideModal}>
            <IonCard>
              <IonCardHeader><IonCardTitle>Override Promotion Status</IonCardTitle></IonCardHeader>
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
