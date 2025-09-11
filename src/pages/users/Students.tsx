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
  IonDatetime,
  IonDatetimeButton,
  IonLoading,
  IonToast,
  IonSearchbar,
  IonButtons,
  IonMenuButton,
} from "@ionic/react";
import { getStudents, createStudent, updateStudent, deleteStudent, getStudentById } from "../../services/studentApi";
import { Branch, Class } from "../../types";
import SidebarMenu from "../../components/SidebarMenu";
import api from "../../services/api";

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    branchId: "",
    classId: "",
    admissionNumber: "",
    gender: "",
    dateOfBirth: "",
    religion: "",
    state: "",
    localGovernment: "",
    country: "",
    genotype: "",
    nextOfKinName: "",
    nextOfKinPhoneNumber: "",
    nextOfKinAddress: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchBranches();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudents({
        keyword: searchText,
      });
      setStudents(res.data.students || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      showToast("Error fetching students");
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
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const openModal = async (student: any = null) => {
    if (student) {
        setLoading(true);
        try {
            const { data } = await getStudentById(student._id);
            setSelectedStudent(data);
            setFormData({
                name: data.userId.name,
                email: data.userId.email,
                branchId: data.branchId?._id,
                classId: data.classId?._id,
                admissionNumber: data.admissionNumber,
                gender: data.userId.gender || "",
                dateOfBirth: data.dateOfBirth || "",
                religion: data.religion || "",
                state: data.state || "",
                localGovernment: data.localGovernment || "",
                country: data.country || "",
                genotype: data.genotype || "",
                nextOfKinName: data.nextOfKinName || "",
                nextOfKinPhoneNumber: data.nextOfKinPhoneNumber || "",
                nextOfKinAddress: data.nextOfKinAddress || "",
            });
        } catch (error) {
            console.error("Failed to fetch student details", error);
            showToast("Could not load student details.");
            return;
        } finally {
            setLoading(false);
        }
    } else {
      setSelectedStudent(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        branchId: "",
        classId: "",
        admissionNumber: "",
        gender: "",
        dateOfBirth: "",
        religion: "",
        state: "",
        localGovernment: "",
        country: "",
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
    setSelectedStudent(null);
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
      if (selectedStudent) {
        await updateStudent(selectedStudent._id, formData);
        showToast("Student updated successfully");
      } else {
        await createStudent(formData);
        showToast("Student created successfully");
      }
      fetchStudents();
      closeModal();
    } catch (error) {
      console.error("Error saving student:", error);
      showToast("Failed to save student");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    setLoading(true);
    try {
      await deleteStudent(id);
      showToast("Student deleted successfully");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      showToast("Error deleting student");
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
            <IonTitle>Student Management</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
        <IonSearchbar
            value={searchText}
            onIonChange={(e) => setSearchText(e.detail.value!)}
            onIonClear={() => setSearchText("")}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                fetchStudents();
              }
            }}
            placeholder="Search by name or admission number"
          />
          <IonButton expand="block" onClick={() => openModal()}>Add Student</IonButton>
          <IonList>
            {students.map((student) => (
              <IonItem key={student._id}>
                <IonLabel>
                  <h2>{student.userId.name}</h2>
                  <p>{student.admissionNumber}</p>
                </IonLabel>
                <IonButton onClick={() => openModal(student)}>Edit</IonButton>
                <IonButton color="danger" onClick={() => handleDelete(student._id)}>Delete</IonButton>
              </IonItem>
            ))}
          </IonList>
          <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>{selectedStudent ? "Edit Student" : "Add Student"}</IonTitle>
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
                {!selectedStudent && (
                  <IonItem>
                    <IonLabel position="stacked">Password</IonLabel>
                    <IonInput name="password" type="password" value={formData.password} onIonChange={handleInputChange} />
                  </IonItem>
                )}
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
                <IonItem>
                  <IonLabel>Class</IonLabel>
                  <IonSelect name="classId" value={formData.classId} onIonChange={(e) => handleSelectChange("classId", e.detail.value)}>
                    {classes.map((cls) => (
                      <IonSelectOption key={cls._id} value={cls._id}>
                        {cls.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Admission Number</IonLabel>
                    <IonInput name="admissionNumber" value={formData.admissionNumber} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Gender</IonLabel>
                    <IonSelect name="gender" value={formData.gender} onIonChange={(e) => handleSelectChange("gender", e.detail.value)}>
                        <IonSelectOption value="Male">Male</IonSelectOption>
                        <IonSelectOption value="Female">Female</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Date of Birth</IonLabel>
                    <IonDatetimeButton datetime="dateOfBirth"></IonDatetimeButton>
                    <IonModal keepContentsMounted={true}>
                      <IonDatetime id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} presentation="date" onIonChange={(e) => handleSelectChange("dateOfBirth", e.detail.value)}></IonDatetime>
                    </IonModal>
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Religion</IonLabel>
                    <IonInput name="religion" value={formData.religion} onIonChange={handleInputChange} />
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

export default StudentsPage;
