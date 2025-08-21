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
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [linkStudentId, setLinkStudentId] = useState<string | null>(null);
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
    // ... other fields
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, branchesRes, studentsRes, classesRes, subjectsRes] = await Promise.all([
        axios.get(`${API_URL}/users`, { withCredentials: true }),
        axios.get(`${API_URL}/branches`, { withCredentials: true }),
        axios.get(`${API_URL}/students`, { withCredentials: true }),
        axios.get(`${API_URL}/classes`, { withCredentials: true }),
        axios.get(`${API_URL}/subjects`, { withCredentials: true }),
      ]);
      setUsers(usersRes.data.users || []);
      setBranches(branchesRes.data.branches || []);
      setAllStudents(studentsRes.data.students || []);
      setClasses(classesRes.data.classes || []);
      setSubjects(subjectsRes.data.subjects || []);
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

  const openModal = async (user: any = null) => {
    if (user) {
      try {
        setIsLoading(true);
        // Fetch the full user object to ensure we have the populated profile
        const res = await axios.get(`${API_URL}/users/${user._id}`, { withCredentials: true });
        const fullUser = res.data.user;
        setSelectedUser(fullUser);

        const profile = fullUser.student || fullUser.teacher || fullUser.parent || fullUser.adminProfile || {};
        setFormData({
          name: fullUser.name,
          email: fullUser.email,
          role: fullUser.role,
          branchId: fullUser.branchId || null,
          password: "",
          gender: profile.gender || "",
          phoneNumber: profile.phoneNumber || "",
          classId: fullUser.student?.classId || "",
          dateOfBirth: fullUser.student?.dateOfBirth || "",
          admissionNumber: fullUser.student?.admissionNumber || "",
          classes: fullUser.teacher?.classes?.map((c: any) => c._id) || [],
          subjects: fullUser.teacher?.subjects?.map((s: any) => s._id) || [],
          students: fullUser.parent?.students?.map((s: any) => s._id) || [],
        });
        setShowModal(true);
      } catch (error) {
        console.error("Failed to fetch user details", error);
        setToast({ show: true, message: "Failed to load user data.", color: "danger" });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Reset form for creating a new user
      setSelectedUser(null);
      setFormData({
        name: "", email: "", password: "", role: "", branchId: null,
        gender: "", phoneNumber: "", classId: "", dateOfBirth: "",
        admissionNumber: "", classes: [], subjects: [], students: [],
      });
      setShowModal(true);
    }
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
      setIsLoading(true);
      if (selectedUser) {
        // Two-step update process
        const userPayload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          branchId: formData.branchId,
        };
        // 1. Update the core user
        await axios.put(`${API_URL}/users/${selectedUser._id}`, userPayload, {
          withCredentials: true,
        });

        // 2. Update the profile
        let profilePayload: any = {};
        let profileEndpoint = '';
        let profileId = '';

        if (formData.role === 'Student' && selectedUser.student) {
            profileEndpoint = `/students/${selectedUser.student._id}`;
            profilePayload = {
                classId: formData.classId,
                admissionNumber: formData.admissionNumber,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber
            };
        } else if (formData.role === 'Teacher' && selectedUser.teacher) {
            profileEndpoint = `/teachers/${selectedUser.teacher._id}`;
            profilePayload = {
                classes: formData.classes,
                subjects: formData.subjects,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber
            };
        } else if (formData.role === 'Parent' && selectedUser.parent) {
            profileEndpoint = `/parents/${selectedUser.parent._id}`;
            profilePayload = {
                students: formData.students,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber
            };
        } else if ((formData.role === 'Branch Admin' || formData.role === 'Super Admin') && selectedUser.adminProfile) {
            profileEndpoint = `/admins/${selectedUser.adminProfile._id}`;
            profilePayload = {
                gender: formData.gender,
                phoneNumber: formData.phoneNumber
            };
        }

        if (profileEndpoint) {
           const profileRes = await axios.put(`${API_URL}${profileEndpoint}`, profilePayload, { withCredentials: true });
           // Use backend message if available
           const message = profileRes.data?.message || "User updated successfully!";
           setToast({ show: true, message, color: "success" });
        } else {
            setToast({ show: true, message: "User core data updated. No profile to update.", color: "success" });
        }

      } else {
        // One-step creation process
        const payload: any = { ...formData };
        const createRes = await axios.post(`${API_URL}/users`, payload, { withCredentials: true });
        const message = createRes.data?.message || "User created successfully!";
        setToast({ show: true, message, color: "success" });
      }

      closeModal();
      fetchData();
    } catch (error: any) {
      console.error("Error saving user:", error);
      const message = error.response?.data?.message || "An error occurred.";
      setToast({ show: true, message, color: "danger" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleLinkStudent = async () => {
    if (!linkStudentId || !selectedUser?.parent?._id) return;
    try {
        await axios.put(`${API_URL}/parents/${selectedUser.parent._id}/link`, { studentId: linkStudentId }, { withCredentials: true });
        setToast({ show: true, message: 'Student linked successfully!', color: 'success' });
        fetchData(); // Refresh all data to get updated parent info
    } catch (error: any) {
        setToast({ show: true, message: error.response?.data?.message || 'Failed to link student.', color: 'danger' });
    }
  };

  const handleUnlinkStudent = async (studentId: string) => {
    if (!selectedUser?.parent?._id) return;
    try {
        await axios.put(`${API_URL}/parents/${selectedUser.parent._id}/unlink`, { studentId }, { withCredentials: true });
        setToast({ show: true, message: 'Student unlinked successfully!', color: 'success' });
        fetchData(); // Refresh all data
    } catch (error: any) {
        setToast({ show: true, message: error.response?.data?.message || 'Failed to unlink student.', color: 'danger' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const deleteRes = await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
      const message = deleteRes.data?.message || "User deleted.";
      setToast({ show: true, message, color: "medium" });
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

              {/* Fields for gender and phone number */}
              {["Student", "Teacher", "Parent", "Branch Admin", "Super Admin"].includes(formData.role) && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Gender</IonLabel>
                    <IonSelect name="gender" value={formData.gender} onIonChange={e => handleSelectChange('gender', e.detail.value)}>
                      <IonSelectOption value="Male">Male</IonSelectOption>
                      <IonSelectOption value="Female">Female</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Phone Number</IonLabel>
                    <IonInput name="phoneNumber" value={formData.phoneNumber} onIonChange={handleInputChange} />
                  </IonItem>
                </>
              )}

              {/* Branch selection */}
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
                </IonItem>
              )}

              {/* Student-specific fields */}
              {formData.role === "Student" && (
                <>
                  <IonItem>
                    <IonLabel>Class</IonLabel>
                    <IonSelect name="classId" value={formData.classId} onIonChange={e => handleSelectChange('classId', e.detail.value)}>
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
                    <IonLabel position="stacked">Date of Birth</IonLabel>
                    <IonInput name="dateOfBirth" type="date" value={formData.dateOfBirth} onIonChange={handleInputChange} />
                  </IonItem>
                </>
              )}

              {/* Teacher-specific fields */}
              {formData.role === "Teacher" && (
                <>
                  <IonItem>
                    <IonLabel>Classes</IonLabel>
                    <IonSelect name="classes" multiple value={formData.classes} onIonChange={e => handleSelectChange('classes', e.detail.value)}>
                      {classes.map((cls) => (
                        <IonSelectOption key={cls._id} value={cls._id}>
                          {cls.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Subjects</IonLabel>
                    <IonSelect name="subjects" multiple value={formData.subjects} onIonChange={e => handleSelectChange('subjects', e.detail.value)}>
                      {subjects.map((subj) => (
                        <IonSelectOption key={subj._id} value={subj._id}>
                          {subj.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </>
              )}

              {/* Parent-specific fields */}
              {formData.role === "Parent" && selectedUser?.parent && (
                <>
                  <IonItem>
                    <IonLabel>
                      <h3>Linked Students</h3>
                    </IonLabel>
                  </IonItem>
                  <IonList>
                    {selectedUser.parent.students.map((student: any) => (
                        <IonItem key={student._id}>
                            <IonLabel>{student.name}</IonLabel>
                            <IonButton color="danger" onClick={() => handleUnlinkStudent(student._id)}>Unlink</IonButton>
                        </IonItem>
                    ))}
                  </IonList>
                  <IonItem>
                      <IonLabel>Link New Student</IonLabel>
                      <IonSelect value={linkStudentId} onIonChange={e => setLinkStudentId(e.detail.value)}>
                          {allStudents.map(student => (
                              <IonSelectOption key={student._id} value={student._id}>{student.name}</IonSelectOption>
                          ))}
                      </IonSelect>
                      <IonButton onClick={handleLinkStudent} disabled={!linkStudentId}>Link</IonButton>
                  </IonItem>
                </>
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
