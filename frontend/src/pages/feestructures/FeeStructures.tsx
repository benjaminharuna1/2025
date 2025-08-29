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
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonMenuButton,
  IonToast,
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import api from '../../services/api';
import { FeeStructure, Branch, ClassLevel, Session } from '../../types';
import { TERMS } from '../../constants';
import SidebarMenu from '../../components/SidebarMenu';
import { getSessions } from '../../services/sessionsApi';

const FeeStructures: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);
  const [formData, setFormData] = useState<Partial<FeeStructure>>({ fees: [] });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterClassLevel, setFilterClassLevel] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterTerm, setFilterTerm] = useState('');

  useEffect(() => {
    fetchFeeStructures();
  }, [filterBranch, filterClassLevel, filterSession, filterTerm]);

  useEffect(() => {
    // Fetch non-filter-dependent data once
    const fetchInitialData = async () => {
      try {
        const [branchesData, classLevelsData, sessionsData] = await Promise.all([
          api.get('/branches'),
          api.get('/classlevels'),
          getSessions(),
        ]);
        setBranches(branchesData.data.branches || []);
        setClassLevels(classLevelsData.data || []);
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const { data } = await api.get('/feestructures', {
        params: {
          branchId: filterBranch,
          classLevel: filterClassLevel,
          session: filterSession,
          term: filterTerm,
        },
      });
      if (data && Array.isArray(data.feeStructures)) {
        setFeeStructures(data.feeStructures);
      } else {
        setFeeStructures([]);
      }
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      setFeeStructures([]);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedFeeStructure) {
        await api.put(`/feestructures/${selectedFeeStructure._id}`, formData);
      } else {
        await api.post('/feestructures', formData);
      }
      fetchFeeStructures();
      closeModal();
    } catch (error) {
      console.error('Error saving fee structure:', error);
      setToastMessage('Failed to save fee structure.');
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/feestructures/${id}`);
      fetchFeeStructures();
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      setToastMessage('Failed to delete fee structure.');
      setShowToast(true);
    }
  };

  const openModal = (feeStructure: FeeStructure | null = null) => {
    setSelectedFeeStructure(feeStructure);
    setFormData(feeStructure ? { ...feeStructure } : { fees: [] });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFeeStructure(null);
    setFormData({ fees: [] });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFeeChange = (index: number, e: any) => {
    const newFees = [...(formData.fees || [])];
    newFees[index] = { ...newFees[index], [e.target.name]: e.target.name === 'amount' ? parseInt(e.detail.value, 10) : e.detail.value };
    setFormData({ ...formData, fees: newFees });
  };

  const addFee = () => {
    setFormData({ ...formData, fees: [...(formData.fees || []), { feeType: '', amount: 0 }] });
  };

  const removeFee = (index: number) => {
    const newFees = [...(formData.fees || [])];
    newFees.splice(index, 1);
    setFormData({ ...formData, fees: newFees });
  };

  const academicYears = [...new Set(sessions.map(s => s.academicYear))].sort().reverse();
  const availableTerms = filterSession ? [...new Set(sessions.filter(s => s.academicYear === filterSession).map(s => s.term))] : [];

  const handleSessionChange = (e: any) => {
    setFilterSession(e.detail.value);
    setFilterTerm(''); // Reset term when session changes
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
            <IonTitle>Fee Structures</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
            <IonCol>
              <IonButton onClick={() => openModal()}>
                <IonIcon slot="start" icon={add} />
                Add Fee Structure
              </IonButton>
            </IonCol>
          </IonRow>
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
                <IonLabel>Filter by Class Level</IonLabel>
                <IonSelect value={filterClassLevel} onIonChange={(e) => setFilterClassLevel(e.detail.value)}>
                  <IonSelectOption value="">All</IonSelectOption>
                  {classLevels.map((level) => (
                    <IonSelectOption key={level._id} value={level._id}>
                      {level.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol>
              <IonItem>
                <IonLabel>Filter by Session</IonLabel>
                <IonSelect value={filterSession} onIonChange={handleSessionChange}>
                  <IonSelectOption value="">All</IonSelectOption>
                  {academicYears.map(session => (
                    <IonSelectOption key={session} value={session}>{session}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol>
              <IonItem>
                <IonLabel>Filter by Term</IonLabel>
                <IonSelect value={filterTerm} onIonChange={(e) => setFilterTerm(e.detail.value)} disabled={!filterSession}>
                  <IonSelectOption value="">All</IonSelectOption>
                  {availableTerms.map(term => (
                    <IonSelectOption key={term} value={term}>{term}</IonSelectOption>
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
                      <th>Branch</th>
                      <th>Class Level</th>
                      <th>Session</th>
                      <th>Term</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeStructures.map((fs) => (
                      <tr key={fs._id}>
                        <td data-label="Branch">{(fs.branchId as any)?.name}</td>
                        <td data-label="Class Level">{(fs.classLevel as any)?.name}</td>
                        <td data-label="Session">{fs.session}</td>
                        <td data-label="Term">{fs.term}</td>
                        <td data-label="Actions">
                          <IonButton onClick={() => openModal(fs)}>
                            <IonIcon slot="icon-only" icon={create} />
                          </IonButton>
                          <IonButton color="danger" onClick={() => handleDelete(fs._id)}>
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
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedFeeStructure ? 'Edit' : 'Add'} Fee Structure</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeModal}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel>Branch</IonLabel>
              <IonSelect name="branchId" value={(formData.branchId as any)?._id || formData.branchId} onIonChange={handleInputChange}>
                {branches.map((branch) => (
                  <IonSelectOption key={branch._id} value={branch._id}>
                    {branch.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Class Level</IonLabel>
              <IonSelect name="classLevel" value={(formData.classLevel as any)?._id || formData.classLevel} onIonChange={handleInputChange}>
                {classLevels.map((level) => (
                  <IonSelectOption key={level._id} value={level._id}>
                    {level.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Session</IonLabel>
              <IonSelect name="session" value={formData.session} onIonChange={handleInputChange}>
                {academicYears.map(session => (
                  <IonSelectOption key={session} value={session}>{session}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Term</IonLabel>
              <IonSelect name="term" value={formData.term} onIonChange={handleInputChange}>
                {TERMS.map(term => (
                  <IonSelectOption key={term} value={term}>{term}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonTitle>Fees</IonTitle>
            {(formData.fees || []).map((fee: any, index: number) => (
              <IonRow key={index} className="ion-align-items-center">
                <IonCol>
                  <IonItem>
                    <IonLabel position="floating">Fee Type</IonLabel>
                    <IonInput name="feeType" value={fee.feeType} onIonChange={(e) => handleFeeChange(index, e)} />
                  </IonItem>
                </IonCol>
                <IonCol>
                  <IonItem>
                    <IonLabel position="floating">Amount</IonLabel>
                    <IonInput name="amount" type="number" value={fee.amount} onIonChange={(e) => handleFeeChange(index, e)} />
                  </IonItem>
                </IonCol>
                <IonCol size="auto">
                  <IonButton color="danger" onClick={() => removeFee(index)}>
                    <IonIcon slot="icon-only" icon={trash} />
                  </IonButton>
                </IonCol>
              </IonRow>
            ))}
            <IonButton onClick={addFee} className="ion-margin-top">
              <IonIcon slot="start" icon={add} />
              Add Fee
            </IonButton>
            <IonButton expand="full" onClick={handleSave} className="ion-margin-top">
              Save
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

export default FeeStructures;
