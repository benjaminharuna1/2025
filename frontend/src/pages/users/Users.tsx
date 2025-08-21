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
} from "@ionic/react";
import axios from "axios";

const API_URL = "http://localhost:3000/api";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

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

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, { withCredentials: true });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_URL}/branches`, { withCredentials: true });
      setBranches(res.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`, { withCredentials: true });
      setClasses(res.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/subjects`, { withCredentials: true });
      setSubjects(res.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`, { withCredentials: true });
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Student
      if (formData.role === "Student") {
        payload.student = {
          classId: formData.classId,
          dateOfBirth: formData.dateOfBirth,
          admissionNumber: formData.admissionNumber,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
      }

      // Teacher
      if (formData.role === "Teacher") {
        payload.teacher = {
          classes: formData.classes || [],
          subjects: formData.subjects || [],
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
      }

      // Parent
      if (formData.role === "Parent") {
        payload.parent = {
          students: formData.students || [],
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
      }

      // Super Admin / Branch Admin
      if (formData.role === "Super Admin" || formData.role === "Branch Admin") {
        payload.adminProfile = {
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
          branchId: formData.role === "Branch Admin" ? formData.branchId : null,
        };
      }

      if (selectedUser) {
        await axios.put(`${API_URL}/users/${selectedUser._id}`, payload, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${API_URL}/users`, payload, { withCredentials: true });
      }

      closeModal();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
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
        <IonButton expand="block" onClick={() => openModal()}>
          Add User
        </IonButton>

        <IonList>
          {users.map((user) => (
            <IonItem key={user._id}>
              <IonLabel>
                <h2>{user.name}</h2>
                <p>
                  {user.email} - {user.role}
                </p>
              </IonLabel>
              <IonButton onClick={() => openModal(user)}>Edit</IonButton>
              <IonButton color="danger" onClick={() => handleDelete(user._id)}>
                Delete
              </IonButton>
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
                <IonLabel position="stacked">Role</IonLabel>
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

              {(formData.role === "Student" ||
                formData.role === "Teacher" ||
                formData.role === "Parent" ||
                formData.role === "Super Admin" ||
                formData.role === "Branch Admin") && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Gender</IonLabel>
                    <IonInput
                      name="gender"
                      value={formData.gender}
                      onIonChange={handleInputChange}
                    />
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

              {formData.role === "Branch Admin" && (
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
                    <IonInput
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onIonChange={handleInputChange}
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

            <IonButton expand="block" onClick={handleSave}>
              Save
            </IonButton>
            <IonButton expand="block" color="medium" onClick={closeModal}>
              Cancel
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default UsersPage;
