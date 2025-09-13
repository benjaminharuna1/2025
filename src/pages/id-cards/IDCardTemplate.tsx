import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonLoading,
  IonToast,
  IonButtons,
  IonMenuButton,
  IonImg,
} from '@ionic/react';
import { Branch } from '../../types';
import { getBranches } from '../../services/branchApi';
import { getIdCardTemplate, updateIdCardTemplate } from '../../services/idCardTemplateApi';
import SidebarMenu from '../../components/SidebarMenu';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

const IDCardTemplatePage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [formData, setFormData] = useState({
    contact: '',
    principalName: '',
  });
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [existingSignature, setExistingSignature] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchTemplate(selectedBranch);
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const res = await getBranches();
      setBranches(res.data.branches || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchTemplate = async (branchId: string) => {
    setLoading(true);
    try {
      const res = await getIdCardTemplate(branchId);
      const { contact, principalName, principalSignature } = res.data;
      setFormData({ contact, principalName });
      setExistingSignature(principalSignature);
    } catch (error) {
      console.error('Error fetching ID card template:', error);
      // Reset form if template doesn't exist
      setFormData({ contact: '', principalName: '' });
      setExistingSignature('');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSignatureFile(e.target.files[0]);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleSave = async () => {
    if (!selectedBranch) {
      showToast('Please select a branch.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('contact', formData.contact);
      data.append('principalName', formData.principalName);
      if (signatureFile) {
        data.append('principalSignature', signatureFile);
      }

      await updateIdCardTemplate(selectedBranch, data);
      showToast('Template updated successfully');
      fetchTemplate(selectedBranch); // Refresh data
    } catch (error) {
      console.error('Error updating template:', error);
      showToast('Failed to update template');
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
            <IonTitle>ID Card Template</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonItem>
            <IonLabel>Select Branch</IonLabel>
            <IonSelect value={selectedBranch} onIonChange={(e) => setSelectedBranch(e.detail.value)}>
              {branches.map((branch) => (
                <IonSelectOption key={branch._id} value={branch._id}>
                  {branch.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {selectedBranch && (
            <>
              <IonItem>
                <IonLabel position="stacked">Contact Number</IonLabel>
                <IonInput
                  name="contact"
                  value={formData.contact}
                  onIonChange={handleInputChange}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Principal's Name</IonLabel>
                <IonInput
                  name="principalName"
                  value={formData.principalName}
                  onIonChange={handleInputChange}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Principal's Signature</IonLabel>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </IonItem>
              {existingSignature && (
                <IonItem>
                  <IonLabel>Current Signature</IonLabel>
                  <IonImg src={`${BACKEND_URL}/${existingSignature.replace('public/', '')}`} style={{ width: '150px' }} />
                </IonItem>
              )}
              <IonButton expand="block" onClick={handleSave} style={{ marginTop: '20px' }}>
                Save Template
              </IonButton>
            </>
          )}
          <IonLoading isOpen={loading} message="Please wait..." />
          <IonToast
            isOpen={toastOpen}
            onDidDismiss={() => setToastOpen(false)}
            message={toastMessage}
            duration={2000}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default IDCardTemplatePage;
