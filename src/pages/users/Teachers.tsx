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
  IonSearchbar,
  IonButtons,
  IonMenuButton,
  IonAvatar,
} from "@ionic/react";
import { getTeachers, createTeacher, updateTeacher, deleteTeacher, getTeacherById, uploadTeacherProfilePicture } from "../../services/teacherApi";
import { Branch, Class, Subject } from "../../types";
import SidebarMenu from "../../components/SidebarMenu";
import api from "../../services/api";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getImageUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    const imagePath = path.replace('public/', '');
    return `${BACKEND_URL}/${imagePath}`;
  };

  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    branchId: "",
    gender: "",
    phoneNumber: "",
    classes: [],
    subjects: [],
    staffId: "",
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
    profilePictureUrl: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchBranches();
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await getTeachers({});
      setTeachers(res.data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      showToast("Error fetching teachers");
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

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.subjects || res.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const openModal = async (teacher: any = null) => {
    setSelectedFile(null);
    if (teacher) {
        setLoading(true);
        try {
            const { data } = await getTeacherById(teacher._id);
            setSelectedTeacher(data);
            setFormData({
                name: data.userId.name,
                email: data.userId.email,
                branchId: data.branchId?._id,
                gender: data.userId.gender || "",
                phoneNumber: data.phoneNumber,
                classes: data.classes,
                subjects: data.subjects,
                staffId: data.staffId || "",
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
                profilePictureUrl: data.userId.profilePicture || "",
            });
        } catch (error) {
            console.error("Failed to fetch teacher details", error);
            showToast("Could not load teacher details.");
            return;
        } finally {
            setLoading(false);
        }
    } else {
      setSelectedTeacher(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        branchId: "",
        gender: "",
        phoneNumber: "",
        classes: [],
        subjects: [],
        staffId: "",
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
        profilePictureUrl: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeacher(null);
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
      let teacherId = selectedTeacher?._id;
      if (selectedTeacher) {
        await updateTeacher(selectedTeacher._id, formData);
        showToast("Teacher updated successfully");
      } else {
        const response = await createTeacher(formData);
        teacherId = response.data.teacher._id;
        showToast("Teacher created successfully");
      }

      if (selectedFile && teacherId) {
        await uploadTeacherProfilePicture(teacherId, selectedFile);
        showToast("Profile picture updated");
      }

      fetchTeachers();
      closeModal();
    } catch (error) {
      console.error("Error saving teacher:", error);
      showToast("Failed to save teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    setLoading(true);
    try {
      await deleteTeacher(id);
      showToast("Teacher deleted successfully");
      fetchTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      showToast("Error deleting teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Teacher Management</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonButton expand="block" onClick={() => openModal()}>Add Teacher</IonButton>
          <IonList>
            {teachers.map((teacher) => (
              <IonItem key={teacher._id}>
                <IonAvatar slot="start">
                  <img src={`https://ui-avatars.com/api/?name=${teacher.userId.name.replace(/\s/g, '+')}`} alt="profile" />
                </IonAvatar>
                <IonLabel>
                  <h2>{teacher.userId.name}</h2>
                  <p>{teacher.userId.email}</p>
                </IonLabel>
                <IonButton onClick={() => openModal(teacher)}>Edit</IonButton>
                <IonButton color="danger" onClick={() => handleDelete(teacher._id)}>Delete</IonButton>
              </IonItem>
            ))}
          </IonList>
          <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>{selectedTeacher ? "Edit Teacher" : "Add Teacher"}</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <IonAvatar style={{ width: '100px', height: '100px', margin: 'auto' }}>
                  <img src={getImageUrl(formData.profilePictureUrl) || `https://ui-avatars.com/api/?name=${formData.name.replace(/\s/g, '+')}`} alt="profile" />
                </IonAvatar>
              </div>
              <IonList>
                {/* Core Information */}
                <IonItem>
                  <IonLabel position="stacked">Name</IonLabel>
                  <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput name="email" value={formData.email} onIonChange={handleInputChange} />
                </IonItem>
                {!selectedTeacher && (
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
                  <IonLabel position="stacked">Staff ID</IonLabel>
                  <IonInput name="staffId" value={formData.staffId} onIonChange={handleInputChange} />
                </IonItem>

                {/* Personal Information */}
                <IonItem>
                    <IonLabel position="stacked">Gender</IonLabel>
                    <IonSelect name="gender" value={formData.gender} onIonChange={(e) => handleSelectChange("gender", e.detail.value)}>
                        <IonSelectOption value="Male">Male</IonSelectOption>
                        <IonSelectOption value="Female">Female</IonSelectOption>
                    </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Date of Birth</IonLabel>
                  <IonInput name="dateOfBirth" type="date" value={formData.dateOfBirth} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Phone Number</IonLabel>
                    <IonInput name="phoneNumber" value={formData.phoneNumber} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Address</IonLabel>
                  <IonInput name="address" value={formData.address} onIonChange={handleInputChange} />
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

                {/* Additional Information */}
                <IonItem>
                  <IonLabel position="stacked">Religion</IonLabel>
                  <IonInput name="religion" value={formData.religion} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Blood Group</IonLabel>
                  <IonInput name="bloodGroup" value={formData.bloodGroup} onIonChange={handleInputChange} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Genotype</IonLabel>
                  <IonInput name="genotype" value={formData.genotype} onIonChange={handleInputChange} />
                </IonItem>

                {/* Next of Kin Information */}
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

                {/* Role-specific Information */}
                <IonItem>
                    <IonLabel>Classes</IonLabel>
                    <IonSelect multiple name="classes" value={formData.classes} onIonChange={(e) => handleSelectChange("classes", e.detail.value)}>
                        {classes.map((cls) => (
                            <IonSelectOption key={cls._id} value={cls._id}>
                                {cls.name}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel>Subjects</IonLabel>
                    <IonSelect multiple name="subjects" value={formData.subjects} onIonChange={(e) => handleSelectChange("subjects", e.detail.value)}>
                        {subjects.map((subj) => (
                            <IonSelectOption key={subj._id} value={subj._id}>
                                {subj.name}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                {/* Profile Picture */}
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

export default TeachersPage;
