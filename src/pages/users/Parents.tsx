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
import { getParents, createParent, updateParent, deleteParent, getParentById, linkStudent, unlinkStudent, uploadParentProfilePicture } from "../../services/parentApi";
import { Student } from "../../types";
import SidebarMenu from "../../components/SidebarMenu";
import api from "../../services/api";
import { getImageUrl } from "../../utils/url";

const ParentsPage: React.FC = () => {
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    gender: "",
    phoneNumber: "",
    students: [],
  });
  const [originalStudents, setOriginalStudents] = useState<string[]>([]);

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  const fetchParents = async () => {
    setLoading(true);
    try {
      const res = await getParents();
      setParents(res.data || []);
    } catch (error) {
      console.error("Error fetching parents:", error);
      showToast("Error fetching parents");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data.students || res.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const openModal = async (parent: any = null) => {
    if (parent) {
        setLoading(true);
        try {
            const { data } = await getParentById(parent._id);
            const studentIds = (data.students || []).map((s: any) => s._id);
            setSelectedParent(data);
            setOriginalStudents(studentIds);
            setFormData({
                name: data.userId.name,
                email: data.userId.email,
                gender: data.gender,
                phoneNumber: data.phoneNumber,
                students: studentIds,
            });
        } catch (error) {
            console.error("Failed to fetch parent details", error);
            showToast("Could not load parent details.");
            return;
        } finally {
            setLoading(false);
        }
    } else {
      setSelectedParent(null);
      setOriginalStudents([]);
      setFormData({
        name: "",
        email: "",
        password: "",
        gender: "",
        phoneNumber: "",
        students: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedParent(null);
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
      if (selectedParent) {
        // --- This update logic is already correct! ---
        await updateParent(selectedParent._id, formData);
        const newStudentIds = new Set(formData.students);
        const oldStudentIds = new Set(originalStudents);
        const toLink = formData.students.filter((id: string) => !oldStudentIds.has(id));
        const toUnlink = originalStudents.filter((id: string) => !newStudentIds.has(id));
        for (const studentId of toLink) {
            await linkStudent(selectedParent._id, studentId);
        }
        for (const studentId of toUnlink) {
            await unlinkStudent(selectedParent._id, studentId);
        }

        if (selectedFile) {
            await uploadParentProfilePicture(selectedParent._id, selectedFile);
            showToast("Profile picture uploaded successfully");
        }

        showToast("Parent updated successfully");
      } else {
        // --- This is the modified create logic ---
        // 1. Create the parent first
        const response = await createParent(formData);
        const newParent = response.data; // Assuming the API returns the new parent object

        // 2. If students were selected, link them now using the new parent's ID
        if (newParent && newParent._id && formData.students.length > 0) {
          for (const studentId of formData.students) {
            // No need to await each one if you don't need to stop for errors
            linkStudent(newParent._id, studentId);
          }
        }
        showToast("Parent created successfully");
      }
      fetchParents();
      closeModal();
    } catch (error) {
      console.error("Error saving parent:", error);
      showToast("Failed to save parent");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this parent?")) return;
    setLoading(true);
    try {
      await deleteParent(id);
      showToast("Parent deleted successfully");
      fetchParents();
    } catch (error) {
      console.error("Error deleting parent:", error);
      showToast("Error deleting parent");
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
            <IonTitle>Parent Management</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonButton expand="block" onClick={() => openModal()}>Add Parent</IonButton>
          <IonList>
            {parents.map((parent) => (
              <IonItem key={parent._id}>
                <IonAvatar slot="start">
                  <img src={getImageUrl(parent.userId.profilePicture) || `https://ui-avatars.com/api/?name=${parent.userId.name.replace(/\s/g, '+')}`} alt="profile" />
                </IonAvatar>
                <IonLabel>
                  <h2>{parent.userId.name}</h2>
                  <p>{parent.userId.email}</p>
                </IonLabel>
                <IonButton onClick={() => openModal(parent)}>Edit</IonButton>
                <IonButton color="danger" onClick={() => handleDelete(parent._id)}>Delete</IonButton>
              </IonItem>
            ))}
          </IonList>
          <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>{selectedParent ? "Edit Parent" : "Add Parent"}</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Name</IonLabel>
                  <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput name="email" value={formData.email} onIonChange={handleInputChange} />
                </IonItem>
                {!selectedParent && (
                  <IonItem>
                    <IonLabel position="stacked">Password</IonLabel>
                    <IonInput name="password" type="password" value={formData.password} onIonChange={handleInputChange} />
                  </IonItem>
                )}
                <IonItem>
                    <IonLabel position="stacked">Gender</IonLabel>
                    <IonSelect name="gender" value={formData.gender} onIonChange={(e) => handleSelectChange("gender", e.detail.value)}>
                        <IonSelectOption value="Male">Male</IonSelectOption>
                        <IonSelectOption value="Female">Female</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Phone Number</IonLabel>
                    <IonInput name="phoneNumber" value={formData.phoneNumber} onIonChange={handleInputChange} />
                </IonItem>
                {selectedParent && (
                  <IonItem>
                    <IonLabel position="stacked">Profile Picture</IonLabel>
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                  </IonItem>
                )}
                {selectedParent && (
                    <IonItem>
                        <IonLabel>Students</IonLabel>
                        <IonSelect multiple name="students" value={formData.students} onIonChange={(e) => handleSelectChange("students", e.detail.value)}>
                            {students.map((stu) => (
                                <IonSelectOption key={stu._id} value={stu._id}>
                                    {stu.userId.name}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>
                )}
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

export default ParentsPage;
