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
  IonLoading,
  IonToast,
  IonSearchbar,
} from "@ionic/react";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    role: "",
    gender: "",
    phoneNumber: "",
    branchId: "",
    classId: "",
    dateOfBirth: "",
    admissionNumber: "",
    classes: [],
    subjects: [],
    students: [],
  });

  useEffect(() => {
    fetchUsers();
    fetchBranches();
    fetchClasses();
    fetchSubjects();
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchText, filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users`, { withCredentials: true });
      setUsers(res.data.users || res.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      showToast("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_URL}/branches`, { withCredentials: true });
      setBranches(res.data.branches || res.data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`, { withCredentials: true });
      setClasses(res.data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/subjects`, { withCredentials: true });
      setSubjects(res.data.subjects || res.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`, { withCredentials: true });
      setStudents(res.data.students || res.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const applyFilters = () => {
    let temp = [...users];
    if (searchText.trim() !== "") {
      temp = temp.filter((user) =>
        user.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (filterRole) {
      temp = temp.filter((user) => user.role === filterRole);
    }
    setFilteredUsers(temp);
  };

  const openModal = (user: any = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        ...user,
        branchId: user.branchId || "",
        classId: user.student?.classId || "",
        dateOfBirth: user.student?.dateOfBirth || "",
        admissionNumber: user.student?.admissionNumber || "",
        gender:
          user.student?.gender ||
          user.teacher?.gender ||
          user.parent?.gender ||
          user.adminProfile?.gender ||
          "",
        phoneNumber:
          user.student?.phoneNumber ||
          user.teacher?.phoneNumber ||
          user.parent?.phoneNumber ||
          user.adminProfile?.phoneNumber ||
          "",
        classes: user.teacher?.classes || [],
        subjects: user.teacher?.subjects || [],
        students: user.parent?.students || [],
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        gender: "",
        phoneNumber: "",
        branchId: "",
        classId: "",
        dateOfBirth: "",
        admissionNumber: "",
        classes: [],
        subjects: [],
        students: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e: any) => {
    const name = e.target.name;
    const value = e.detail?.value ?? e.target.value;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const getProfileEndpoint = (role: string) => {
    switch (role) {
      case "Student":
        return "students";
      case "Teacher":
        return "teachers";
      case "Parent":
        return "parents";
      // Admins might have a different profile endpoint or none at all
      // Assuming 'admins' based on common practice, adjust if needed
      case "Branch Admin":
      case "Super Admin":
        return "admins";
      default:
        return null;
    }
  };

  const buildProfilePayload = (role: string, data: any) => {
    switch (role) {
      case "Student":
        return {
          classId: data.classId,
          dateOfBirth: data.dateOfBirth,
          admissionNumber: data.admissionNumber,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
        };
      case "Teacher":
        return {
          classes: data.classes,
          subjects: data.subjects,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
        };
      case "Parent":
        return {
          students: data.students,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
        };
      case "Branch Admin":
      case "Super Admin":
        return {
          gender: data.gender,
          phoneNumber: data.phoneNumber,
        };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.email || (!selectedUser && !formData.password) || !formData.role) {
        showToast("Please fill all required fields");
        return;
      }

      setLoading(true);

      if (selectedUser) {
        // Update user and profile
        const userPayload = { name: formData.name, email: formData.email };
        await axios.put(`${API_URL}/users/${selectedUser._id}`, userPayload, { withCredentials: true });

        const profileEndpoint = getProfileEndpoint(selectedUser.role);
        const profilePayload = buildProfilePayload(selectedUser.role, formData);

        // This assumes the profile ID is stored in a field like `student._id`, `teacher._id` etc.
        // You might need to adjust this based on the actual structure of your user object.
        const profileId = selectedUser[selectedUser.role.toLowerCase()]?._id;

        if (profileEndpoint && profileId && Object.keys(profilePayload).length > 0) {
          await axios.put(`${API_URL}/${profileEndpoint}/${profileId}`, profilePayload, { withCredentials: true });
        }

        showToast("User updated successfully");

      } else {
        // Create user
        const creationPayload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          branchId: formData.branchId,
          classId: formData.classId,
          dateOfBirth: formData.dateOfBirth,
          admissionNumber: formData.admissionNumber,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          classes: formData.classes,
          subjects: formData.subjects,
          students: formData.students,
        };
        await axios.post(`${API_URL}/users`, creationPayload, { withCredentials: true });
        showToast("User created successfully");
      }

      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      showToast(`Failed to save user: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      closeModal();
    }
  };


  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
      showToast("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>User Management</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Search by name"
        />
        <IonItem>
          <IonLabel>Filter by Role</IonLabel>
          <IonSelect value={filterRole} onIonChange={(e) => setFilterRole(e.detail.value)}>
            <IonSelectOption value="">All</IonSelectOption>
            <IonSelectOption value="Super Admin">Super Admin</IonSelectOption>
            <IonSelectOption value="Branch Admin">Branch Admin</IonSelectOption>
            <IonSelectOption value="Teacher">Teacher</IonSelectOption>
            <IonSelectOption value="Student">Student</IonSelectOption>
            <IonSelectOption value="Parent">Parent</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonButton expand="block" onClick={() => openModal()}>Add User</IonButton>

        <IonList>
          {filteredUsers.map((user) => (
            <IonItem key={user._id}>
              <IonLabel>
                <h2>{user.name}</h2>
                <p>{user.email} - {user.role}</p>
              </IonLabel>
              <IonButton onClick={() => openModal(user)}>Edit</IonButton>
              <IonButton color="danger" onClick={() => handleDelete(user._id, user.name)}>Delete</IonButton>
            </IonItem>
          ))}
        </IonList>

        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedUser ? "Edit User" : "Add User"}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {/* Name */}
              <IonItem>
                <IonLabel position="stacked">Name</IonLabel>
                <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
              </IonItem>

              {/* Email */}
              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput name="email" value={formData.email} onIonChange={handleInputChange} />
              </IonItem>

              {/* Password */}
              {!selectedUser && (
                <IonItem>
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput name="password" type="password" value={formData.password} onIonChange={handleInputChange} />
                </IonItem>
              )}

              {/* Role */}
              <IonItem>
                <IonLabel position="stacked">Role</IonLabel>
                <IonSelect name="role" value={formData.role} onIonChange={(e) => handleSelectChange("role", e.detail.value)}>
                  <IonSelectOption value="Super Admin">Super Admin</IonSelectOption>
                  <IonSelectOption value="Branch Admin">Branch Admin</IonSelectOption>
                  <IonSelectOption value="Teacher">Teacher</IonSelectOption>
                  <IonSelectOption value="Student">Student</IonSelectOption>
                  <IonSelectOption value="Parent">Parent</IonSelectOption>
                </IonSelect>
              </IonItem>

              {/* Gender & Phone */}
              {["Student","Teacher","Parent","Super Admin","Branch Admin"].includes(formData.role) && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Gender</IonLabel>
                    <IonSelect name="gender" value={formData.gender} onIonChange={(e) => handleSelectChange("gender", e.detail.value)}>
                      <IonSelectOption value="Male">Male</IonSelectOption>
                      <IonSelectOption value="Female">Female</IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Phone Number</IonLabel>
                    <IonInput
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onIonChange={handleInputChange}
                    />
                  </IonItem>
                </>
              )}

              {/* Branch selection for roles that need it */}
              {["Branch Admin", "Teacher", "Student"].includes(formData.role) && (
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
                    <IonSelect
                      name="classId"
                      value={formData.classId}
                      onIonChange={(e) => handleSelectChange("classId", e.detail.value)}
                    >
                      {classes.map((cls) => (
                        <IonSelectOption key={cls._id} value={cls._id}>
                          {cls.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Date of Birth</IonLabel>
                    <IonDatetime
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      presentation="date"
                      onIonChange={(e) => handleSelectChange("dateOfBirth", e.detail.value)}
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Admission Number</IonLabel>
                    <IonInput
                      name="admissionNumber"
                      value={formData.admissionNumber}
                      onIonChange={handleInputChange}
                    />
                  </IonItem>
                </>
              )}

              {/* Teacher-specific fields */}
              {formData.role === "Teacher" && (
                <>
                  <IonItem>
                    <IonLabel>Classes</IonLabel>
                    <IonSelect
                      multiple
                      name="classes"
                      value={formData.classes}
                      onIonChange={(e) => handleSelectChange("classes", e.detail.value)}
                    >
                      {classes.map((cls) => (
                        <IonSelectOption key={cls._id} value={cls._id}>
                          {cls.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel>Subjects</IonLabel>
                    <IonSelect
                      multiple
                      name="subjects"
                      value={formData.subjects}
                      onIonChange={(e) => handleSelectChange("subjects", e.detail.value)}
                    >
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
              {formData.role === "Parent" && (
                <IonItem>
                  <IonLabel>Students</IonLabel>
                  <IonSelect
                    multiple
                    name="students"
                    value={formData.students}
                    onIonChange={(e) => handleSelectChange("students", e.detail.value)}
                  >
                    {students.map((stu) => (
                      <IonSelectOption key={stu._id} value={stu._id}>
                        {stu.name}
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
  );
};

export default UsersPage;
