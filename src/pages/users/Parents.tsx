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
import { getParents, createParent, updateParent, deleteParent, getParentById, linkStudent, unlinkStudent } from "../../services/parentApi";
import { Student } from "../../types";
import SidebarMenu from "../../components/SidebarMenu";
import api from "../../services/api";

const ParentsPage: React.FC = () => {
  const [parents, setParents] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    gender: "",
    phoneNumber: "",
    students: [],
    parentId: "",
    address: "",
    religion: "",
    dateOfBirth: "",
    state: "",
    localGovernment: "",
    country: "",
    bloodGroup: "",
    genotype: "",
    nextOfKinName: "",
    nextOfKinPhoneNumber: "",
    nextOfKinAddress: "",
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
            setSelectedParent(data);
            const studentIds = (data.students || []).map((s: any) => s._id);
            setOriginalStudents(studentIds);
            setFormData({
                name: data.userId.name,
                email: data.userId.email,
                gender: data.userId.gender || "",
                phoneNumber: data.phoneNumber || "",
                students: studentIds,
                parentId: data.parentId || "",
                address: data.address || "",
                religion: data.religion || "",
                dateOfBirth: data.dateOfBirth || "",
                state: data.state || "",
                localGovernment: data.localGovernment || "",
                country: data.country || "",
                bloodGroup: data.bloodGroup || "",
                genotype: data.genotype || "",
                nextOfKinName: data.nextOfKinName || "",
                nextOfKinPhoneNumber: data.nextOfKinPhoneNumber || "",
                nextOfKinAddress: data.nextOfKinAddress || "",
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
        parentId: "",
        address: "",
        religion: "",
        dateOfBirth: "",
        state: "",
        localGovernment: "",
        country: "",
        bloodGroup: "",
        genotype: "",
        nextOfKinName: "",
        nextOfKinPhoneNumber: "",
        nextOfKinAddress: "",
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

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (selectedParent) {
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
        showToast("Parent updated successfully");
      } else {
        const response = await createParent(formData);
        const newParent = response.data;
        if (newParent && newParent._id && formData.students.length > 0) {
          for (const studentId of formData.students) {
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
                  <img src={`https://ui-avatars.com/api/?name=${parent.userId.name.replace(/\s/g, '+')}`} alt="profile" />
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
                <IonItem>
                    <IonLabel position="stacked">Parent ID</IonLabel>
                    <IonInput name="parentId" value={formData.parentId} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Address</IonLabel>
                    <IonInput name="address" value={formData.address} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Religion</IonLabel>
                    <IonInput name="religion" value={formData.religion} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Date of Birth</IonLabel>
                    <IonInput name="dateOfBirth" type="date" value={formData.dateOfBirth} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">State</IonLabel>
                    <IonInput name="state" value={formData.state} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Local Government</IonLabel>
                    <IonInput name="localGovernment" value={formData.localGovernment} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Country</IonLabel>
                    <IonInput name="country" value={formData.country} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Blood Group</IonLabel>
                    <IonInput name="bloodGroup" value={formData.bloodGroup} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Genotype</IonLabel>
                    <IonInput name="genotype" value={formData.genotype} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Next of Kin Name</IonLabel>
                    <IonInput name="nextOfKinName" value={formData.nextOfKinName} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Next of Kin Phone Number</IonLabel>
                    <IonInput name="nextOfKinPhoneNumber" value={formData.nextOfKinPhoneNumber} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Next of Kin Address</IonLabel>
                    <IonInput name="nextOfKinAddress" value={formData.nextOfKinAddress} onIonChange={handleInputChange} />
                </IonItem>
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
