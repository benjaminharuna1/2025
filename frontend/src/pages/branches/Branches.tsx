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
  IonButtons,
  IonMenuButton,
  IonToast,
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import api from '../../services/api';
import { Branch } from '../../types';
import SidebarMenu from '../../components/SidebarMenu';
import './Branches.css';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data } = await api.get('/branches');
      if (data && Array.isArray(data.branches)) {
        setBranches(data.branches);
      } else if (Array.isArray(data)) {
        setBranches(data);
      }
      else {
        console.error('API did not return an array of branches:', data);
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([]);
    }
  };

  const handleSave = async () => {
    const branchData = { name, address };
    try {
      if (selectedBranch) {
        await api.put(`/branches/${selectedBranch._id}`, branchData);
      } else {
        await api.post('/branches', branchData);
      }
      fetchBranches();
      closeModal();
    } catch (error) {
      console.error('Error saving branch:', error);
      setToastMessage('Failed to save branch.');
      setShowToast(true);
    }
  };

  const handleDelete = async (id:string) => {
    try {
      await api.delete(`/branches/${id}`);
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      setToastMessage('Failed to delete branch.');
      setShowToast(true);
    }
  };

  const openModal = (branch: Branch | null = null) => {
    setSelectedBranch(branch);
    setName(branch ? branch.name : '');
    setAddress(branch ? branch.address : '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBranch(null);
    setName('');
    setAddress('');
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
            <IonTitle>Branches</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
            <IonCol>
              <IonButton onClick={() => openModal()}>
                <IonIcon slot="start" icon={add} />
                Add Branch
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <div className="ion-padding">
                <table className="branches-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((branch) => (
                      <tr key={branch._id}>
                        <td data-label="Name">{branch.name}</td>
                        <td data-label="Address">{branch.address}</td>
                        <td data-label="Actions">
                          <IonButton onClick={() => openModal(branch)}>
                            <IonIcon slot="icon-only" icon={create} />
                          </IonButton>
                          <IonButton color="danger" onClick={() => handleDelete(branch._id)}>
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
              <IonCardTitle>{selectedBranch ? 'Edit' : 'Add'} Branch</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="floating">Name</IonLabel>
                <IonInput value={name} onIonChange={(e) => setName(e.detail.value!)} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Address</IonLabel>
                <IonInput value={address} onIonChange={(e) => setAddress(e.detail.value!)} />
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

export default Branches;
