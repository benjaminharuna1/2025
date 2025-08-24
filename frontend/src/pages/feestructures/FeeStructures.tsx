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
  IonToast,
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
  const [formData, setFormData] = useState<Partial<FeeStructure>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterClassLevel, setFilterClassLevel] = useState('');

  useEffect(() => {
    fetchFeeStructures();
    fetchBranches();
    fetchClassLevels();
  }, [filterBranch, filterClassLevel]);

  const fetchFeeStructures = async () => {
    try {
      const { data } = await api.get('/feestructures', {
        params: {
          branchId: filterBranch,
          classLevelId: filterClassLevel,
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
    setFormData(feeStructure ? { ...feeStructure } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFeeStructure(null);
    setFormData({});
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
            </IonRow>
            <IonRow>
              <IonCol>
                <div className="ion-padding">
                  <table className="responsive-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Class Level</th>
                        <th>Branch</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeStructures.map((fs) => (
                        <tr key={fs._id}>
                          <td data-label="Name">{fs.name}</td>
                          <td data-label="Amount">{fs.amount}</td>
                          <td data-label="Class Level">{(fs.classLevelId as any)?.name}</td>
                          <td data-label="Branch">{(fs.branchId as any)?.name}</td>
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
                  <IonLabel position="floating">Name</IonLabel>
                  <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Amount</IonLabel>
                  <IonInput name="amount" type="number" value={formData.amount} onIonChange={handleInputChange} />
                </IonItem>
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
                  <IonSelect name="classLevelId" value={formData.classLevelId} onIonChange={handleInputChange}>
                    {classLevels.map((level) => (
                      <IonSelectOption key={level._id} value={level._id}>
                        {level.name}
                      </IonSelectOption>
                    ))}
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
