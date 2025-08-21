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
  IonSpinner,
  IonToast,
} from "@ionic/react";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
    show: false,
    message: "",
    color: "",
  });

  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    role: "",
    branchId: null,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, branchesRes] = await Promise.all([
        axios.get(`${API_URL}/users`, { withCredentials: true }),
        axios.get(`${API_URL}/branches`, { withCredentials: true }),
      ]);
      setUsers(usersRes.data.users || []);
      setBranches(branchesRes.data.branches || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setToast({ show: true, message: "Failed to fetch data.", color: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (user: any = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId || null,
        password: "",
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        branchId: null,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      return setToast({ show: true, message: "Name, Email, and Role are required.", color: "warning" });
    }
    if (!selectedUser && !formData.password) {
        return setToast({ show: true, message: "Password is required for new users.", color: "warning" });
    }

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (!selectedUser && formData.password) {
        payload.password = formData.password;
      }

      if (formData.role === 'Branch Admin' || formData.role === 'Teacher' || formData.role === 'Student') {
          if (!formData.branchId) {
            return setToast({ show: true, message: "Branch is required for this role.", color: "warning" });
          }
          payload.branchId = formData.branchId;
      }

      if (selectedUser) {
        await axios.put(`${API_URL}/users/${selectedUser._id}`, payload, {
          withCredentials: true,
        });
        setToast({ show: true, message: "User updated successfully!", color: "success" });
      } else {
        await axios.post(`${API_URL}/users`, payload, { withCredentials: true });
        setToast({ show: true, message: "User created successfully!", color: "success" });
      }

      closeModal();
      fetchData();
    } catch (error: any) {
      console.error("Error saving user:", error);
      const message = error.response?.data?.message || "An error occurred.";
      setToast({ show: true, message, color: "danger" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
      setToast({ show: true, message: "User deleted.", color: "medium" });
      fetchData();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const message = error.response?.data?.message || "An error occurred.";
      setToast({ show: true, message, color: "danger" });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>User Management</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={() => openModal()}>
          Add User
        </IonButton>

        {isLoading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : (
          <IonList>
            {users.map((user) => (
              <IonItem key={user._id}>
                <IonLabel>
                  <h2>{user.name}</h2>
                  <p>
                    {user.email} - {user.role}
                  </p>
                </IonLabel>
                <IonButton slot="end" onClick={() => openModal(user)}>Edit</IonButton>
                <IonButton slot="end" color="danger" onClick={() => handleDelete(user._id)}>
                  Delete
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedUser ? "Edit User" : "Add User"}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Name</IonLabel>
                <IonInput
                  name="name"
                  value={formData.name}
                  onIonChange={handleInputChange}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  name="email"
                  type="email"
                  value={formData.email}
                  onIonChange={handleInputChange}
                />
              </IonItem>

              {!selectedUser && (
                <IonItem>
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput
                    name="password"
                    type="password"
                    value={formData.password}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
              )}

              <IonItem>
                <IonLabel>Role</IonLabel>
                <IonSelect
                  name="role"
                  value={formData.role}
                  onIonChange={(e) => handleSelectChange("role", e.detail.value)}
                >
                  <IonSelectOption value="Super Admin">Super Admin</IonSelectOption>
                  <IonSelectOption value="Branch Admin">Branch Admin</IonSelectOption>
                  <IonSelectOption value="Student">Student</IonSelectOption>
                  <IonSelectOption value="Teacher">Teacher</IonSelectOption>
                  <IonSelectOption value="Parent">Parent</IonSelectOption>
                </IonSelect>
              </IonItem>

              {(formData.role === "Branch Admin" || formData.role === "Teacher" || formData.role === "Student") && (
                <IonItem>
                  <IonLabel>Branch</IonLabel>
                  <IonSelect
                    name="branchId"
                    value={formData.branchId}
                    onIonChange={(e) => handleSelectChange("branchId", e.detail.value)}
                  >
                    {branches.map((branch) => (
                      <IonSelectOption key={branch._id} value={branch._id}>
                        {branch.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </Item>
              )}
            </IonList>

            <IonButton expand="block" onClick={handleSave}>
              Save
            </IonButton>
            <IonButton expand="block" color="medium" onClick={closeModal}>
              Cancel
            </IonButton>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={toast.show}
          message={toast.message}
          color={toast.color}
          duration={3000}
          onDidDismiss={() => setToast({ show: false, message: "", color: "" })}
        />
      </IonContent>
    </IonPage>
  );
};

export default UsersPage;
