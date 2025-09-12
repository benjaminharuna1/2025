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
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/profiles/me');
      setProfileData(data);
      // Combine user and profile data into a single flat object for the form
      setFormData({ ...(data.profile || {}), ...data });
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Could not load your profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePictureFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToUpdate = new FormData();

      // Append all form fields that the user can edit
      dataToUpdate.append('email', formData.email);
      dataToUpdate.append('gender', formData.gender);
      dataToUpdate.append('phoneNumber', formData.phoneNumber);
      dataToUpdate.append('address', formData.address);
      dataToUpdate.append('state', formData.state);
      dataToUpdate.append('localGovernment', formData.localGovernment);
      dataToUpdate.append('country', formData.country);
      dataToUpdate.append('religion', formData.religion);
      dataToUpdate.append('bloodGroup', formData.bloodGroup);
      dataToUpdate.append('genotype', formData.genotype);
      dataToUpdate.append('dateOfBirth', formData.dateOfBirth);
      dataToUpdate.append('nextOfKinName', formData.nextOfKinName);
      dataToUpdate.append('nextOfKinPhoneNumber', formData.nextOfKinPhoneNumber);
      dataToUpdate.append('nextOfKinAddress', formData.nextOfKinAddress);

      if (profilePictureFile) {
        dataToUpdate.append('profilePicture', profilePictureFile);
      }

      await api.put('/profiles/me', dataToUpdate, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowToast(true);
      setIsEditing(false);
      fetchProfile(); // Refetch data
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile.');
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

  const userRole = user?.role;
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
                  <img src={profileData.profilePicture || `https://ui-avatars.com/api/?name=${profileData.name || 'User'}`} alt="profile" />
                </IonAvatar>
                <IonCardTitle style={{ marginTop: '10px' }}>{profileData.name}</IonCardTitle>
              </div>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {renderProfileField("Name", formData.name, "name", true)}
                {renderProfileField("Email", formData.email, "email")}

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

                {isEditing && (
                  <IonItem>
                    <IonLabel position="stacked">Update Profile Picture</IonLabel>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                  </IonItem>
                )}
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
        <IonToast
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          message={error || ''}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
