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

  const [classes, setClasses] = useState<Class[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [selectedBranch, setSelectedBranch] = useState(user?.role === 'Branch Admin' ? user.branchId || '' : '');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const [promotionResults, setPromotionResults] = useState<PromotionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionResult | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<'Promoted' | 'Repeated'>('Promoted');
  const [overrideComment, setOverrideComment] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [api.get('/dropdowns/sessions')];
        if (user?.role === 'Super Admin') {
          promises.push(api.get('/dropdowns/branches'));
        } else {
          promises.push(api.get('/dropdowns/classes'));
        }
        const [sessionsRes, mainDataRes] = await Promise.all(promises);
        setSessions(sessionsRes.data || []);
        if (user?.role === 'Super Admin') {
          setBranches(mainDataRes.data || []);
        } else {
          setClasses(mainDataRes.data || []);
        }
      } catch (error) {
        setToastMessage("Could not load required data.");
      } finally {
        setLoading(false);
      }
    };
    if(user) fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (user?.role === 'Super Admin' && selectedBranch) {
      const fetchClassesForBranch = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/dropdowns/classes?branchId=${selectedBranch}`);
          setClasses(data || []);
        } catch (error) {
          console.error("Failed to fetch classes", error);
        } finally {
          setLoading(false);
        }
      };
      fetchClassesForBranch();
    }
    setSelectedClass('');
  }, [selectedBranch, user?.role]);

  const handleRunPromotion = async () => {
    if (!selectedClass || !selectedSessionId) {
      setToastMessage("Please select both a class and a session.");
      return;
    }
    setLoading(true);
    setPromotionResults([]);
    try {
      const res = await api.post(`/promotions/run/${selectedClass}/${selectedSessionId}`);
      setPromotionResults(res.data.data || []);
      setToastMessage(res.data.message || "Promotion process completed.");
    } catch (error: any) {
      setToastMessage(error.response?.data?.message || "An error occurred.");
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
      setToastMessage(error.response?.data?.message || "An error occurred during override.");
    } finally {
      setLoading(false);
    }
  };

  const academicYears = useMemo(() => [...new Set(sessions.map(s => s.academicYear))].sort().reverse(), [sessions]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const availableTerms = useMemo(() => selectedAcademicYear ? [...new Set(sessions.filter(s => s.academicYear === selectedAcademicYear).map(s => s.term))] : [], [sessions, selectedAcademicYear]);

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
    const sessionObj = sessions.find(s => s.academicYear === selectedAcademicYear && s.term === term);
    setSelectedSessionId(sessionObj?._id || '');
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
                <p>Select a class and session to begin.</p>
              </IonCol>
            </IonRow>
            <IonRow>
              {user?.role === 'Super Admin' && (
                <IonCol size-md="3"><IonItem><IonLabel>Branch</IonLabel><IonSelect value={selectedBranch} onIonChange={e => setSelectedBranch(e.detail.value)}>{branches.map(b => <IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>)}</IonSelect></IonItem></IonCol>
              )}
              <IonCol size-md="3"><IonItem><IonLabel>Class</IonLabel><IonSelect value={selectedClass} onIonChange={e => setSelectedClass(e.detail.value)} disabled={user?.role === 'Super Admin' && !selectedBranch}>{classes.map(c => <IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>)}</IonSelect></IonItem></IonCol>
              <IonCol size-md="2"><IonItem><IonLabel>Session</IonLabel><IonSelect value={selectedAcademicYear} onIonChange={e => {setSelectedAcademicYear(e.detail.value); setSelectedTerm('');}}>{academicYears.map(year => <IonSelectOption key={year} value={year}>{year}</IonSelectOption>)}</IonSelect></IonItem></IonCol>
              <IonCol size-md="2"><IonItem><IonLabel>Term</IonLabel><IonSelect value={selectedTerm} onIonChange={e => handleTermChange(e.detail.value)} disabled={!selectedAcademicYear}>{availableTerms.map(term => <IonSelectOption key={term} value={term}>{term}</IonSelectOption>)}</IonSelect></IonItem></IonCol>
              <IonCol size-md="2" className="ion-align-self-end"><IonButton expand="block" onClick={handleRunPromotion} disabled={!selectedClass || !selectedSessionId}>Run</IonButton></IonCol>
            </IonRow>
            {promotionResults.length > 0 && (
              <IonRow><IonCol><table className="responsive-table"><thead><tr><th>Student</th><th>Final Average</th><th>Status</th><th>Actions</th></tr></thead><tbody>{promotionResults.map(result => (<tr key={result._id}><td data-label="Student">{result.studentId.name}</td><td data-label="Final Average">{result.finalAverage.toFixed(2)}</td><td data-label="Status">{result.status}</td><td data-label="Actions"><IonButton size="small" onClick={() => handleOpenOverrideModal(result)}><IonIcon icon={create} slot="icon-only" /></IonButton></td></tr>))}</tbody></table></IonCol></IonRow>
            )}
          </IonGrid>
          <IonModal isOpen={showOverrideModal} onDidDismiss={handleCloseOverrideModal}>
            <IonCard>
              <IonCardHeader><IonCardTitle>Override Promotion Status</IonCardTitle></IonCardHeader>
              <IonCardContent>
                <p>Student: <strong>{selectedPromotion?.studentId.name}</strong></p>
                <IonItem><IonLabel>New Status</IonLabel><IonSelect value={overrideStatus} onIonChange={e => setOverrideStatus(e.detail.value)}><IonSelectOption value="Promoted">Promoted</IonSelectOption><IonSelectOption value="Repeated">Repeated</IonSelectOption></IonSelect></IonItem>
                <IonItem><IonLabel position="floating">Comment</IonLabel><IonTextarea value={overrideComment} onIonChange={e => setOverrideComment(e.detail.value!)} rows={4} /></IonItem>
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
