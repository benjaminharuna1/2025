import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonModal,
  IonLoading,
  IonToast,
  IonButtons,
  IonMenuButton,
  IonAvatar,
} from "@ionic/react";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin, getAdminById, uploadAdminProfilePicture } from "../../services/adminApi";
import { Branch } from "../../types";
import SidebarMenu from "../../components/SidebarMenu";
import api from "../../services/api";

const AdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    role: "Branch Admin",
    branchId: "",
    phoneNumber: "",
    gender: "",
  });

  useEffect(() => {
    fetchAdmins();
    fetchBranches();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await getAdmins();
      setAdmins(res.data.admins || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
      showToast("Error fetching admins");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data.branches || res.data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    }
  };

  const openModal = async (admin: any = null) => {
    setSelectedFile(null);
    if (admin) {
        setLoading(true);
        try {
            const { data } = await getAdminById(admin._id);
            setSelectedAdmin(data.user);
            setFormData({
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                branchId: data.user.branchId || "",
                phoneNumber: data.profile?.phoneNumber || "",
                gender: data.profile?.gender || "",
                profilePictureUrl: data.profile?.profilePictureUrl || "",
            });
        } catch (error) {
            console.error("Failed to fetch admin details", error);
            showToast("Could not load admin details.");
            return;
        } finally {
            setLoading(false);
        }
    } else {
      setSelectedAdmin(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Branch Admin",
        branchId: "",
        fullName: "",
        phoneNumber: "",
        bio: "",
        officeLocation: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAdmin(null);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let adminId = selectedAdmin?._id;

      if (selectedAdmin) {
        const updatePayload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          branchId: formData.branchId,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
        };
        await updateAdmin(selectedAdmin._id, updatePayload);
        showToast("Admin updated successfully");
      } else {
        const response = await createAdmin(formData);
        adminId = response.data.user._id; // Get ID from response
        showToast("Admin created successfully");
      }

      if (selectedFile && adminId) {
        await uploadAdminProfilePicture(adminId, selectedFile);
        showToast("Profile picture updated");
      }

      fetchAdmins();
      closeModal();
    } catch (error) {
      console.error("Error saving admin:", error);
      showToast("Failed to save admin");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    setLoading(true);
    try {
      await deleteAdmin(id);
      showToast("Admin deleted successfully");
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      showToast("Error deleting admin");
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
            <IonTitle>Admin Management</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonButton expand="block" onClick={() => openModal()}>Add Admin</IonButton>
          <IonList>
            {admins.map((admin) => (
              <IonItem key={admin._id}>
                <IonAvatar slot="start">
                  <img src={`https://ui-avatars.com/api/?name=${admin.name.replace(/\s/g, '+')}`} alt="profile" />
                </IonAvatar>
                <IonLabel>
                  <h2>{admin.name}</h2>
                  <p>{admin.email} - {admin.role}</p>
                </IonLabel>
                <IonButton onClick={() => openModal(admin)}>Edit</IonButton>
                <IonButton color="danger" onClick={() => handleDelete(admin._id)}>Delete</IonButton>
              </IonItem>
            ))}
          </IonList>
          <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>{selectedAdmin ? "Edit Admin" : "Add Admin"}</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <IonAvatar style={{ width: '100px', height: '100px', margin: 'auto' }}>
                  <img src={formData.profilePictureUrl || `https://ui-avatars.com/api/?name=${formData.name.replace(/\s/g, '+')}`} alt="profile" />
                </IonAvatar>
              </div>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Name</IonLabel>
                  <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput name="email" value={formData.email} onIonChange={handleInputChange} />
                </IonItem>
                {!selectedAdmin && (
                  <IonItem>
                    <IonLabel position="stacked">Password</IonLabel>
                    <IonInput name="password" type="password" value={formData.password} onIonChange={handleInputChange} />
                  </IonItem>
                )}
                <IonItem>
                  <IonLabel position="stacked">Role</IonLabel>
                  <IonSelect name="role" value={formData.role} onIonChange={(e) => handleSelectChange("role", e.detail.value)}>
                    <IonSelectOption value="Super Admin">Super Admin</IonSelectOption>
                    <IonSelectOption value="Branch Admin">Branch Admin</IonSelectOption>
                  </IonSelect>
                </IonItem>
                {formData.role === "Branch Admin" && (
                  <IonItem>
                    <IonLabel>Branch</IonLabel>
                    <IonSelect name="branchId" value={formData.branchId} onIonChange={(e) => handleSelectChange("branchId", e.detail.value)}>
                      {branches.map((branch) => (
                        <IonSelectOption key={branch._id} value={branch._id}>
                          {branch.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                )}
                <IonItem>
                    <IonLabel position="stacked">Phone Number</IonLabel>
                    <IonInput name="phoneNumber" value={formData.phoneNumber} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Gender</IonLabel>
                  <IonSelect name="gender" value={formData.gender} onIonChange={(e) => handleSelectChange("gender", e.detail.value)}>
                    <IonSelectOption value="Male">Male</IonSelectOption>
                    <IonSelectOption value="Female">Female</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Profile Picture</IonLabel>
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                </IonItem>
              </IonList>
              <IonButton expand="block" onClick={handleSave}>Save</IonButton>
              <IonButton expand="block" color="medium" onClick={closeModal}>Cancel</IonButton>
            </IonContent>
          </IonModal>
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

export default AdminsPage;
