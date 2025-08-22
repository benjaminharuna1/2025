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
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import api from '../../services/api';
import { FeeStructure, Branch, ClassLevel } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './FeeStructures.css';

const FeeStructures: React.FC = () => {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);
  const [formData, setFormData] = useState<Partial<FeeStructure>>({ fees: [] });
  const [filterBranch, setFilterBranch] = useState('');
  const [filterClassLevel, setFilterClassLevel] = useState('');
  const [filterSession, setFilterSession] = useState('');
  const [filterTerm, setFilterTerm] = useState('');

  useEffect(() => {
    fetchFeeStructures();
    fetchBranches();
    fetchClassLevels();
  }, [filterBranch, filterClassLevel, filterSession, filterTerm]);

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

  const fetchClassLevels = async () => {
    try {
      const { data } = await api.get('/classlevels');
      if (Array.isArray(data)) {
        setClassLevels(data);
      }
    } catch (error) {
      console.error('Error fetching class levels:', error);
    }
  };

  const handleSave = async () => {
    console.log('Saving fee structure:', formData);
    if (selectedFeeStructure) {
      await api.put(`/feestructures/${selectedFeeStructure._id}`, formData);
    } else {
      await api.post('/feestructures', formData);
    }
    fetchFeeStructures();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/feestructures/${id}`);
    fetchFeeStructures();
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
    setFormData({ ...formData, [e.target.name]: e.detail.value });
  };

  const handleFeeChange = (index: number, e: any) => {
    const newFees = [...formData.fees];
    newFees[index][e.target.name] = e.target.name === 'amount' ? parseInt(e.detail.value, 10) : e.detail.value;
    setFormData({ ...formData, fees: newFees });
  };

  const addFee = () => {
    setFormData({ ...formData, fees: [...formData.fees, { type: '', amount: 0 }] });
  };

  const removeFee = (index: number) => {
    const newFees = [...formData.fees];
    newFees.splice(index, 1);
    setFormData({ ...formData, fees: newFees });
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
                <IonInput value={filterSession} onIonChange={(e) => setFilterSession(e.detail.value!)} />
              </IonItem>
            </IonCol>
            <IonCol>
              <IonItem>
                <IonLabel>Filter by Term</IonLabel>
                <IonInput value={filterTerm} onIonChange={(e) => setFilterTerm(e.detail.value!)} />
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
                        <td data-label="Branch">{fs.branchId?.name}</td>
                        <td data-label="Class Level">{fs.classLevel?.name}</td>
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
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{selectedFeeStructure ? 'Edit' : 'Add'} Fee Structure</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel>Branch</IonLabel>
                <IonSelect name="branchId" value={formData.branchId} onIonChange={handleInputChange}>
                  {branches.map((branch) => (
                    <IonSelectOption key={branch._id} value={branch._id}>
                      {branch.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Class Level</IonLabel>
                <IonSelect name="classLevel" value={formData.classLevel} onIonChange={handleInputChange}>
                  {classLevels.map((level) => (
                    <IonSelectOption key={level._id} value={level._id}>
                      {level.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Session</IonLabel>
                <IonInput name="session" value={formData.session} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Term</IonLabel>
                <IonInput name="term" value={formData.term} onIonChange={handleInputChange} />
              </IonItem>
              <IonCardTitle>Fees</IonCardTitle>
              {formData.fees.map((fee: any, index: number) => (
                <IonRow key={index}>
                  <IonCol>
                    <IonItem>
                      <IonLabel position="floating">Type</IonLabel>
                      <IonInput name="feeType" value={fee.feeType} onIonChange={(e) => handleFeeChange(index, e)} />
                    </IonItem>
                  </IonCol>
                  <IonCol>
                    <IonItem>
                      <IonLabel position="floating">Amount</IonLabel>
                      <IonInput name="amount" type="number" value={fee.amount} onIonChange={(e) => handleFeeChange(index, e)} />
                    </IonItem>
                  </IonCol>
                  <IonCol>
                    <IonButton color="danger" onClick={() => removeFee(index)}>
                      <IonIcon slot="icon-only" icon={trash} />
                    </IonButton>
                  </IonCol>
                </IonRow>
              ))}
              <IonButton onClick={addFee} className="ion-margin-top">
                Add Fee
              </IonButton>
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
    </>
  );
};

export default FeeStructures;
