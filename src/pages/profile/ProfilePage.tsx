import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonLoading,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonInput,
  IonToast,
  IonAvatar,
} from '@ionic/react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const userRole = user?.role;
  const profileId = user?.profileId;

  const getProfileEndpoint = () => {
    if (!profileId) return null;
    switch (userRole) {
      case 'Super Admin':
      case 'Branch Admin':
        return `/admins/${profileId}`;
      case 'Teacher':
        return `/teachers/${profileId}`;
      case 'Student':
        return `/students/${profileId}`;
      case 'Parent':
        return `/parents/${profileId}`;
      default:
        return null;
    }
  };

  const fetchProfile = async () => {
    const endpoint = getProfileEndpoint();
    if (!endpoint) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(endpoint);
      // The response for a single profile might be nested under `user` and `profile` or be flat
      const fullProfileData = data.user ? { ...data.profile, userId: data.user, _id: data.profile._id } : data;
      setProfileData(fullProfileData);
      setFormData(fullProfileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profileId) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, profileId]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    const endpoint = getProfileEndpoint();
    if (!endpoint) return;

    setLoading(true);
    try {
      await api.put(endpoint, formData);
      setShowToast(true);
      setIsEditing(false);
      fetchProfile(); // Refetch data
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileField = (label: string, value: any, fieldName: string, readOnly = false) => {
    return (
      <IonItem>
        <IonLabel position="stacked">{label}</IonLabel>
        {isEditing ? (
          <IonInput
            name={fieldName}
            value={value}
            onIonChange={handleInputChange}
            readonly={readOnly}
          />
        ) : (
          <p>{value || 'N/A'}</p>
        )}
      </IonItem>
    );
  };

  const isStudent = userRole === 'Student';
  const isStaff = userRole === 'Super Admin' || userRole === 'Branch Admin' || userRole === 'Teacher';
  const isParent = userRole === 'Parent';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>My Profile</IonTitle>
          <IonButtons slot="end">
            {!isEditing ? (
              <IonButton onClick={() => setIsEditing(true)}>Edit</IonButton>
            ) : (
              <IonButton onClick={handleSave}>Save</IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={loading} message={'Loading profile...'} />
        {profileData && (
          <IonCard>
            <IonCardHeader>
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <IonAvatar style={{ width: '120px', height: '120px', margin: 'auto' }}>
                  <img src={profileData.userId?.profilePicture || `https://ui-avatars.com/api/?name=${profileData.userId?.name || 'User'}`} alt="profile" />
                </IonAvatar>
                <IonCardTitle style={{ marginTop: '10px' }}>{profileData.userId?.name}</IonCardTitle>
              </div>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {renderProfileField("Name", formData.userId?.name, "name", true)}
                {renderProfileField("Email", formData.userId?.email, "email")}
                {isStudent && renderProfileField("Admission Number", formData.admissionNumber, "admissionNumber", true)}

                {isStaff && renderProfileField("Staff ID", formData.staffId, "staffId", true)}
                {isParent && renderProfileField("Parent ID", formData.parentId, "parentId", true)}

                {renderProfileField("Phone Number", formData.phoneNumber, "phoneNumber")}
                {renderProfileField("Address", formData.address, "address")}
                {renderProfileField("State", formData.state, "state")}
                {renderProfileField("Local Government", formData.localGovernment, "localGovernment")}
                {renderProfileField("Country", formData.country, "country")}
                {renderProfileField("Religion", formData.religion, "religion")}
                {renderProfileField("Blood Group", formData.bloodGroup, "bloodGroup")}
                {renderProfileField("Genotype", formData.genotype, "genotype")}
                {renderProfileField("Date of Birth", formData.dateOfBirth?.split('T')[0], "dateOfBirth")}

                <IonItem lines="full"><IonLabel color="primary"><h4>Next of Kin Information</h4></IonLabel></IonItem>
                {renderProfileField("Next of Kin Name", formData.nextOfKinName, "nextOfKinName")}
                {renderProfileField("Next of Kin Phone", formData.nextOfKinPhoneNumber, "nextOfKinPhoneNumber")}
                {renderProfileField("Next of Kin Address", formData.nextOfKinAddress, "nextOfKinAddress")}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Profile updated successfully."
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
