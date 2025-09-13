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
import { QRCodeSVG } from 'qrcode.react';
import ReactDOM from 'react-dom';

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

  const handlePrint = () => {
  const printContainer = document.getElementById('print-container');
  const idCardDisplay = document.getElementById('id-card-display');
  if (!printContainer || !idCardDisplay) return;

  // Clear previous content
  printContainer.innerHTML = '';

  // Clone all ID cards from the display
  const clonedCards = idCardDisplay.cloneNode(true) as HTMLElement;

  // Append cloned cards to print container
  printContainer.appendChild(clonedCards);

  // Make sure print container is visible (in case display:none)
  printContainer.style.display = 'flex';
  printContainer.style.flexDirection = 'column';
  printContainer.style.alignItems = 'center';

  // Trigger print
  window.print();

  // Optional: hide print container again after printing
  printContainer.style.display = 'none';
};


  return (
    <>
      {/* <div style={{ display: 'none' }}>
        {cardData.map((data, index) => {
          const { user, profile, branch } = data;
          const qrCodeValue = `Name: ${user.name}, Role: ${user.role}, ID: ${profile.admissionNumber || profile.staffId || profile.parentId}, Branch: ${branch.name}`;
          return <QRCodeSVG value={qrCodeValue} size={80} className="qr-code" />
        })}
      </div> */}
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar color="primary">
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
            {cardData.length > 0 && (
              <IonButton expand="block" onClick={handlePrint} style={{ marginTop: '16px' }}>
                Print / Save as PDF
              </IonButton>
            )}
          </div>

          <div className="page" id="id-card-display">
            {cardData.map((data, index) => (
              <IDCard key={index} data={data} />
            ))}
          </div>

          <div id="print-container" style={{ display: 'none' }}></div>

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
