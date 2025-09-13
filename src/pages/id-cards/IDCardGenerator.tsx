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
import { QRCodeCanvas } from 'qrcode.react';
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
    if (printContainer) {
      const qrCodeElements = document.querySelectorAll('.qr-code-canvas');
      const qrCodeDataUrls = Array.from(qrCodeElements).map(canvas => (canvas as HTMLCanvasElement).toDataURL());

      const printContent = cardData.map((data, index) => {
        const { user, profile, branch } = data;
        const qrCodeUrl = qrCodeDataUrls[index];
        return `
          <div class="card-container">
            <div class="card front">
              <div class="header">
                <div class="center-text">
                  <div class="school-name">${branch.schoolName || 'School Name'}</div>
                  <div class="branch-name">${branch.name}</div>
                  <div class="address">${branch.address}</div>
                </div>
              </div>
              <div class="id-card-type">${user.role === 'Student' ? 'Student ID Card' : 'Staff ID Card'}</div>
              <div class="body">
                <div class="body-left">
                  <div class="photo"><img src="https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}" alt="photo" /></div>
                  <div class="user-name">${user.name}</div>
                  <div class="id-number">${profile.admissionNumber || profile.staffId || profile.parentId}</div>
                </div>
                <div class="body-right">
                  <div class="info">
                    <div><label>Gender:</label> <div class="value">${user.gender || 'N/A'}</div></div>
                    <div><label>Date of Birth:</label> <div class="value">${profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</div></div>
                    <div><label>Blood Group/Genotype:</label> <div class="value">${profile.bloodGroup || 'N/A'} / ${profile.genotype || 'N/A'}</div></div>
                    <div><label>Address:</label> <div class="value">${profile.address || 'N/A'}</div></div>
                    <div><label>Contact:</label> <div class="value">${profile.phoneNumber || 'N/A'}</div></div>
                  </div>
                </div>
              </div>
              <div class="footer-shape"></div>
            </div>
            <div class="card back">
              <div class="terms">
                <div class="term-title">Important notice</div>
                <div class="term-text small">
                  This ID card must be carried at all times while on school premises.<br />
                  The card remains the property of ${branch.schoolName} and must be returned upon request.<br />
                  If found, please return to:<br />
                  ${branch.schoolName} - ${branch.name}<br />
                  ${branch.address}<br />
                  Tel: ${branch.contact}
                </div>
              </div>
              <div class="meta">
                <div class="left">
                  <div class="small"><strong>Next of Kin:</strong> ${profile.nextOfKinName || 'N/A'}</div>
                  <div class="small"><strong>Contact:</strong> ${profile.nextOfKinPhoneNumber || 'N/A'}</div>
                </div>
                <div class="right">
                  <div class="qr"><img src="${qrCodeUrl}" alt="qr code" /></div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
      printContainer.innerHTML = printContent;
      window.print();
    }
  };

  return (
    <>
      <div style={{ display: 'none' }}>
        {cardData.map((data, index) => {
          const { user, profile, branch } = data;
          const qrCodeValue = `Name: ${user.name}, Role: ${user.role}, ID: ${profile.admissionNumber || profile.staffId || profile.parentId}, Branch: ${branch.name}`;
          return <QRCodeCanvas key={index} value={qrCodeValue} size={80} className="qr-code-canvas" />;
        })}
      </div>
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
