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
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { generateIdCards } from '../../services/idCardApi';
import SidebarMenu from '../../components/SidebarMenu';
import IDCard from '../../components/id-cards/IDCard';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    width: '520px',
    height: '320px',
  },
  header: {
    backgroundColor: '#0b63b8',
    color: '#ffffff',
    padding: '12px 18px',
    textAlign: 'center',
  },
  schoolName: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 1.2,
  },
  branchName: {
    fontSize: 14,
    fontWeight: 600,
  },
  address: {
    fontSize: 12,
  },
  idCardType: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    padding: '8px 0',
    textTransform: 'uppercase',
    backgroundColor: '#f0f0f0',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    padding: '8px 18px',
  },
  bodyLeft: {
    width: '35%',
    alignItems: 'center',
  },
  photo: {
    width: '100px',
    height: '115px',
    borderRadius: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 8,
    textAlign: 'center',
  },
  idNumber: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  bodyRight: {
    width: '65%',
    justifyContent: 'center',
  },
  info: {
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: 600,
    width: '120px',
  },
  footer: {
    height: '12px',
    width: '100%',
    backgroundColor: '#2f9bd6',
  },
  backTerms: {
    padding: 12,
    borderRadius: 8,
    height: 180,
    fontSize: 12,
    lineHeight: 1.25,
  },
  termTitle: {
    fontWeight: 700,
    marginBottom: 8,
  },
  termText: {
    fontSize: 11,
  },
  backMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
  },
  backLeft: {
    flex: 1,
  },
  backRight: {
    textAlign: 'right',
  },
});

const IDCardPDF = ({ data }: { data: any[] }) => (
  <Document>
    {data.map((card, index) => {
      const { user, profile, branch } = card;

      const getImageUrl = (path?: string) => {
        if (!path) return 'https://ui-avatars.com/api/?name=' + user.name.replace(/\s/g, '+');
        const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
        return `${BACKEND_URL}/${path.replace('public/', '')}`;
      };

      const getIdCardType = () => {
        switch (user.role) {
          case 'Student': return 'Student ID Card';
          case 'Teacher': case 'Admin': return 'Staff ID Card';
          case 'Parent': return 'Parent ID Card';
          default: return 'ID Card';
        }
      };

      const getIdNumber = () => {
        switch (user.role) {
          case 'Student': return profile.admissionNumber;
          case 'Teacher': case 'Admin': return profile.staffId;
          case 'Parent': return profile.parentId;
          default: return 'N/A';
        }
      };

      const qrCodeValue = `Name: ${user.name}, Role: ${user.role}, ID: ${getIdNumber()}, Branch: ${branch.name}`;

      return [
        <Page key={`${index}-front`} size={[520, 320]} style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.schoolName}>{branch.schoolName || 'School Name'}</Text>
            <Text style={styles.branchName}>{branch.name}</Text>
            <Text style={styles.address}>{branch.address}</Text>
          </View>
          <Text style={styles.idCardType}>{getIdCardType()}</Text>
          <View style={styles.body}>
            <View style={styles.bodyLeft}>
              <Image style={styles.photo} src={getImageUrl(user.profilePicture)} />
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.idNumber}>{getIdNumber()}</Text>
            </View>
            <View style={styles.bodyRight}>
              <View style={styles.info}>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Gender:</Text><Text>{user.gender || 'N/A'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Date of Birth:</Text><Text>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Blood Group/Genotype:</Text><Text>{profile.bloodGroup || 'N/A'} / {profile.genotype || 'N/A'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Address:</Text><Text>{profile.address || 'N/A'}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Contact:</Text><Text>{profile.phoneNumber || 'N/A'}</Text></View>
              </View>
            </View>
          </View>
          <View style={styles.footer} />
        </Page>,
        <Page key={`${index}-back`} size={[520, 320]} style={styles.page}>
          <View style={styles.backTerms}>
            <Text style={styles.termTitle}>Important notice</Text>
            <Text style={styles.termText}>
              This ID card must be carried at all times while on school premises.
              The card remains the property of {branch.schoolName} and must be returned upon request.
              If found, please return to:
              {branch.schoolName} - {branch.name}
              {branch.address}
              Tel: {branch.contact}
            </Text>
          </View>
          <View style={styles.backMeta}>
            <View style={styles.backLeft}>
              <Text>Next of Kin: {profile.nextOfKinName || 'N/A'}</Text>
              <Text>Contact: {profile.nextOfKinPhoneNumber || 'N/A'}</Text>
            </View>
            <View style={styles.backRight}>
              {/* The QR code will be a placeholder for now as we can't easily generate it in the PDF */}
              <Text>QR Code: {qrCodeValue}</Text>
            </View>
          </View>
        </Page>
      ];
    })}
  </Document>
);

const IDCardGeneratorPage: React.FC = () => {
  const [ids, setIds] = useState<string>('');
  const [cardData, setCardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [showPdf, setShowPdf] = useState(false);

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
    setShowPdf(false);
    try {
      const res = await generateIdCards(ids);
      setCardData(res.data);
      if (res.data.length > 0) {
        setShowPdf(true);
      }
    } catch (error) {
      console.error('Error generating ID cards:', error);
      showToast('Failed to generate ID cards.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDevice = async () => {
    setLoading(true);
    try {
      const blob = await pdf(<IDCardPDF data={cardData} />).toBlob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        await Filesystem.writeFile({
          path: `id-cards-${Date.now()}.pdf`,
          data: base64data,
          directory: Directory.Documents,
        });
        showToast('PDF saved to Documents directory.');
      };
    } catch (error) {
      console.error('Error saving PDF to device:', error);
      showToast('Failed to save PDF.');
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
            {showPdf && (
              Capacitor.isNativePlatform() ? (
                <IonButton expand="block" onClick={handleSaveToDevice} style={{ marginTop: '16px' }}>
                  Save as PDF
                </IonButton>
              ) : (
                <PDFDownloadLink document={<IDCardPDF data={cardData} />} fileName="id-cards.pdf">
                  {({ blob, url, loading, error }) =>
                    loading ? 'Loading document...' : (
                      <IonButton expand="block" style={{ marginTop: '16px' }}>
                        Save as PDF
                      </IonButton>
                    )
                  }
                </PDFDownloadLink>
              )
            )}
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
