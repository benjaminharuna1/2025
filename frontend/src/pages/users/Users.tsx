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
  IonButtons,
  IonMenuButton,
} from "@ionic/react";
import api from "../../services/api";
import { User, Branch, Class, Subject, Student } from "../../types";
import SidebarMenu from "../../components/SidebarMenu";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
      const res = await api.get('/users');
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
      const res = await api.get('/branches');
      setBranches(res.data.branches || res.data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data.subjects || res.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
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

  /** Build payload based on role so backend updates/creates the correct profile table */
  const buildPayload = () => {
    const payload: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };
    if (!selectedUser) payload.password = formData.password;

    switch (formData.role) {
      case "Student":
        payload.branchId = formData.branchId;
        payload.classId = formData.classId;
        payload.dateOfBirth = formData.dateOfBirth;
        payload.admissionNumber = formData.admissionNumber;
        payload.gender = formData.gender;
        payload.phoneNumber = formData.phoneNumber;
        break;

      case "Teacher":
        payload.branchId = formData.branchId;
        payload.classes = formData.classes;
        payload.subjects = formData.subjects;
        payload.gender = formData.gender;
        payload.phoneNumber = formData.phoneNumber;
        break;

      case "Parent":
        payload.students = formData.students;
        payload.gender = formData.gender;
        payload.phoneNumber = formData.phoneNumber;
        break;

      case "Branch Admin":
        payload.branchId = formData.branchId;
        payload.gender = formData.gender;
        payload.phoneNumber = formData.phoneNumber;
        break;

      case "Super Admin":
        payload.gender = formData.gender;
        payload.phoneNumber = formData.phoneNumber;
        break;
    }

    return payload;
  };

  const handleSave = async () => {
  try {
    if (!formData.name || !formData.email || (!selectedUser && !formData.password) || !formData.role) {
      setToastMessage("Please fill all required fields");
      setToastOpen(true);
      return;
    }

    // Build the payload according to role
    const payload: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };

    if (!selectedUser) payload.password = formData.password; // Only when creating

    switch (formData.role) {
      case "Student":
        payload.branchId = formData.branchId;
        payload.student = {
          classId: formData.classId,
          dateOfBirth: formData.dateOfBirth,
          admissionNumber: formData.admissionNumber,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
        break;

      case "Teacher":
        payload.branchId = formData.branchId;
        payload.teacher = {
          classes: formData.classes,
          subjects: formData.subjects,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
        break;

      case "Parent":
        payload.parent = {
          students: formData.students,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
        break;

      case "Branch Admin":
        payload.branchId = formData.branchId;
        payload.adminProfile = {
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
        break;

      case "Super Admin":
        payload.adminProfile = {
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
        break;
    }

    if (selectedUser) {
      // Update
      await api.put(`/users/${selectedUser._id}`, payload);
    } else {
      // Create
      await api.post('/users', payload);
    }

    fetchUsers();
    closeModal();
    setToastMessage("User saved successfully");
    setToastOpen(true);

  } catch (error) {
    console.error("Error saving user:", error);
    setToastMessage("Failed to save user");
    setToastOpen(true);
  }
};


  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    setLoading(true);
    try {
      await api.delete(`/users/${id}`);
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
    <>
      <SidebarMenu />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
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
    </>
  );
};

export default UsersPage;
