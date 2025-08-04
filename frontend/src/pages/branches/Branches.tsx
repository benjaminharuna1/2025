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
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/branches`, { withCredentials: true });
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
    if (selectedBranch) {
      await axios.put(`${API_URL}/branches/${selectedBranch._id}`, branchData, { withCredentials: true });
    } else {
      await axios.post(`${API_URL}/branches`, branchData, { withCredentials: true });
    }
    fetchBranches();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`${API_URL}/branches/${id}`, { withCredentials: true });
    fetchBranches();
  };

  const openModal = (branch: any | null = null) => {
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
    <IonPage>
      <IonHeader>
        <IonToolbar>
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
              <div className="ion-padding" style={{ overflowX: 'auto' }}>
                <table className="ion-table">
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
                        <td>{branch.name}</td>
                        <td>{branch.address}</td>
                        <td>
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
      </IonContent>
    </IonPage>
  );
};

export default Branches;
