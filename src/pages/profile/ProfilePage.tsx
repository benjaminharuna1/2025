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
      const { data } = await api.get('/v1/profiles/me');
      setProfileData(data);
      setFormData({ ...data, ...(data.profile || {}) });
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
    const name = (e.target as HTMLInputElement).name;
    const value = e.detail?.value;
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

    // ✅ Only append if values are non-empty
    if (formData.name?.trim()) dataToUpdate.append("name", formData.name.trim());
    if (formData.email?.trim()) dataToUpdate.append("email", formData.email.trim());
    if (formData.gender?.trim()) dataToUpdate.append("gender", formData.gender.trim());
    if (profilePictureFile) dataToUpdate.append("profilePicture", profilePictureFile);

    // Role-specific identifiers
if (user?.role === "Student" && formData.admissionNumber) {
  dataToUpdate.append("admissionNumber", formData.admissionNumber);
}
if (user?.role === "Parent" && formData.parentNumber) {
  dataToUpdate.append("parentNumber", formData.parentNumber);
}
if (
  (user?.role === "Teacher" || user?.role === "Branch Admin" || user?.role === "Super Admin") &&
  formData.staffId
) {
  dataToUpdate.append("staffId", formData.staffId);
}
  

    // ✅ Profile model fields
    const profileFields = [
      "phoneNumber",
      "address",
      "state",
      "localGovernment",
      "country",
      "religion",
      "bloodGroup",
      "genotype",
      "dateOfBirth",
      "nextOfKinName",
      "nextOfKinPhoneNumber",
      "nextOfKinAddress",
    ];

    profileFields.forEach((field) => {
      if (formData[field]?.toString().trim()) {
        dataToUpdate.append(field, formData[field]);
      }
    });

    // Make the request
    await api.put("/v1/profiles/me", dataToUpdate, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Refresh UI
    setShowToast(true);
    setIsEditing(false);
    fetchProfile();
  } catch (err: any) {
    console.error("Error updating profile:", err.response?.data || err.message);
    setError(err.response?.data?.message || "Failed to update profile.");
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
            type={fieldName === 'dateOfBirth' ? 'date' : 'text'}
          />
        ) : (
          <p>{value || 'N/A'}</p>
        )}
      </IonItem>
    );
  };

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
                  <img
  src={
    profileData.profilePicture ||
    profileData.profile?.profilePicture ||
    `https://ui-avatars.com/api/?name=${profileData.name || 'User'}`
  }
  alt="profile"
/>

                </IonAvatar>
                <IonCardTitle style={{ marginTop: '10px' }}>{profileData.name}</IonCardTitle>
              </div>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {renderProfileField("Name", formData.name, "name", true)}
                {renderProfileField("Email", formData.email, "email")}
                {user?.role === "Student" &&
                renderProfileField("Admission Number", formData.admissionNumber, "admissionNumber", true)}

              {user?.role === "Parent" &&
                renderProfileField("Parent Number", formData.parentNumber, "parentNumber", true)}

              {(user?.role === "Teacher" || user?.role === "Branch Admin" || user?.role === "Super Admin") &&
                renderProfileField("Staff ID", formData.staffId, "staffId", true)}


                {renderProfileField("Phone Number", formData.phoneNumber, "phoneNumber")}
                {renderProfileField("Address", formData.address, "address")}
                {renderProfileField("State", formData.state, "state")}
                {renderProfileField("Local Government", formData.localGovernment, "localGovernment")}
                {renderProfileField("Country", formData.country, "country")}
                {renderProfileField("Religion", formData.religion, "religion")}
                {renderProfileField("Blood Group", formData.bloodGroup, "bloodGroup")}
                {renderProfileField("Genotype", formData.genotype, "genotype")}
                {renderProfileField("Date of Birth", formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split("T")[0] : "", "dateOfBirth")}

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
