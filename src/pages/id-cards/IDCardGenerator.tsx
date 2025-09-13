import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonTextarea,
  IonButton,
  IonLoading,
  IonToast,
  IonButtons,
  IonMenuButton,
} from '@ionic/react';
import { generateIdCards } from '../../services/idCardApi';
import SidebarMenu from '../../components/SidebarMenu';
import IDCard from '../../components/id-cards/IDCard';

const IDCardGeneratorPage: React.FC = () => {
  const [ids, setIds] = useState<string>('');
  const [cardData, setCardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleGenerate = async () => {
    if (!ids.trim()) {
      showToast('Please enter at least one ID.');
      return;
    }

    setLoading(true);
    setCardData([]);
    try {
      const res = await generateIdCards(ids);
      setCardData(res.data);
    } catch (error) {
      console.error('Error generating ID cards:', error);
      showToast('Failed to generate ID cards.');
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
            <IonTitle>ID Card Generator</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px' }}>
            <IonTextarea
              value={ids}
              onIonChange={(e) => setIds(e.detail.value!)}
              placeholder="Enter user IDs separated by commas (e.g., S123, T456, P555)"
              rows={5}
              style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '8px' }}
            />
            <IonButton expand="block" onClick={handleGenerate} style={{ marginTop: '16px' }}>
              Generate ID Cards
            </IonButton>
          </div>

          <div className="page">
            {cardData.map((data, index) => (
              <IDCard key={index} data={data} />
            ))}
          </div>

          <IonLoading isOpen={loading} message="Generating cards..." />
          <IonToast
            isOpen={toastOpen}
            onDidDismiss={() => setToastOpen(false)}
            message={toastMessage}
            duration={3000}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default IDCardGeneratorPage;
