import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import axios from 'axios';
import './Users.css';


const API_URL = 'http://localhost:3000/api';

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [filterRole, setFilterRole] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchBranches();
    fetchClasses();
    fetchSubjects();
    fetchStudents();
  }, [filterRole, filterBranch]);


  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users`, {
        withCredentials: true,
        params: { role: filterRole, branchId: filterBranch },
      });
      if (data && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/branches`, { withCredentials: true });
      if (data && Array.isArray(data.branches)) {
        setBranches(data.branches);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchClasses = async () => {
    const { data } = await axios.get(`${API_URL}/classes`, { withCredentials: true });
    setClasses(data.classes || []);
  };

  const fetchSubjects = async () => {
    const { data } = await axios.get(`${API_URL}/subjects`, { withCredentials: true });
    setSubjects(data.subjects || []);
  };

  const fetchStudents = async () => {
    const { data } = await axios.get(`${API_URL}/students`, { withCredentials: true });
    setStudents(data.students || []);
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        branchId: formData.branchId,
      };

      // Role-specific payload
      if (formData.role === 'Student') {
        payload.student = {
          classId: formData.classId,
          dateOfBirth: formData.dateOfBirth,
          admissionNumber: formData.admissionNumber,
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
      }

      if (formData.role === 'Teacher') {
        payload.teacher = {
          classes: formData.classes || [],
          subjects: formData.subjects || [],
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
      }

      if (formData.role === 'Parent') {
        payload.parent = {
          students: formData.students || [],
          gender: formData.gender,
          phoneNumber: formData.phoneNumber,
        };
      }

      if (selectedUser) {
        await axios.put(`${API_URL}/users/${selectedUser._id}`, payload, { withCredentials: true });
      } else {
        await axios.post(`${API_URL}/users`, payload, { withCredentials: true });
      }

      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
    fetchUsers();
  };

  const openModal = (user: any | null = null) => {
    setSelectedUser(user);
    setFormData(user ? { ...user } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({});
  };

  const handleInputChange = (e: any) => {
  const { name, value } = e.target;
  setFormData((prev: any) => ({ ...prev, [name]: value }));
};

  const handleSelectChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Users</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton onClick={() => openModal()}>
                <IonIcon slot="start" icon={add} />
                Add User
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonLabel>Filter by Role</IonLabel>
                <IonSelect value={filterRole} onIonChange={(e) => setFilterRole(e.detail.value)}>
                  <IonSelectOption value="">All</IonSelectOption>
                  <IonSelectOption value="Student">Student</IonSelectOption>
                  <IonSelectOption value="Teacher">Teacher</IonSelectOption>
                  <IonSelectOption value="Parent">Parent</IonSelectOption>
                  <IonSelectOption value="Branch Admin">Branch Admin</IonSelectOption>
                  <IonSelectOption value="Accountant">Accountant</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCol>
            <IonCol>
              <IonItem>
                <IonLabel>Filter by Branch</IonLabel>
                <IonSelect value={filterBranch} onIonChange={(e) => setFilterBranch(e.detail.value)}>
                  <IonSelectOption value="">All</IonSelectOption>
                  {branches.map((branch) => (
                    <IonSelectOption key={branch._id} value={branch._id}>
                      {branch.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <div className="ion-padding">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td data-label="Name">{user.name}</td>
                        <td data-label="Email">{user.email}</td>
                        <td data-label="Role">{user.role}</td>
                        <td data-label="Actions">
                          <IonButton onClick={() => openModal(user)}>
                            <IonIcon slot="icon-only" icon={create} />
                          </IonButton>
                          <IonButton color="danger" onClick={() => handleDelete(user._id)}>
                            <IonIcon slot="icon-only" icon={trash} />
                          </IonButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{selectedUser ? 'Edit' : 'Add'} User</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="floating">Name</IonLabel>
                <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Email</IonLabel>
                <IonInput name="email" type="email" value={formData.email} onIonChange={handleInputChange} />
              </IonItem>
              {!selectedUser && (
                <IonItem>
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput name="password" type="password" value={formData.password} onIonChange={handleInputChange} />
                </IonItem>
              )}
              <IonItem>
                <IonLabel>Role</IonLabel>
                <IonSelect name="role" value={formData.role} onIonChange={(e) => handleSelectChange('role', e.detail.value)}>
                  <IonSelectOption value="Student">Student</IonSelectOption>
                  <IonSelectOption value="Teacher">Teacher</IonSelectOption>
                  <IonSelectOption value="Parent">Parent</IonSelectOption>
                  <IonSelectOption value="Branch Admin">Branch Admin</IonSelectOption>
                  <IonSelectOption value="Accountant">Accountant</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Branch</IonLabel>
                <IonSelect name="branchId" value={formData.branchId} onIonChange={(e) => handleSelectChange('branchId', e.detail.value)}>
                  {branches.map((branch) => (
                    <IonSelectOption key={branch._id} value={branch._id}>
                      {branch.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                  <IonLabel position="floating">Gender</IonLabel>
                  <IonSelect name="gender" value={formData.gender} onIonChange={(e) => handleSelectChange('gender', e.detail.value)}>
                    <IonSelectOption value="Male">Male</IonSelectOption>
                    <IonSelectOption value="Female">Female</IonSelectOption>
                    <IonSelectOption value="Other">Other</IonSelectOption>
                  </IonSelect>
              </IonItem>

              <IonItem>
                  <IonLabel position="floating">Phone Number</IonLabel>
                  <IonInput
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onIonChange={handleInputChange}
                />
              </IonItem>
              
              {formData.role === 'Student' && (
                <>
                  <IonItem>
                    <IonLabel position="floating">Class ID</IonLabel>
                    <IonInput name="classId" value={formData.classId} onIonChange={(e) => handleInputChange(e)} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="floating">Date of Birth</IonLabel>
                    <IonInput name="dateOfBirth" type="date" value={formData.dateOfBirth} onIonChange={(e) => handleInputChange(e)} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="floating">Admission Number</IonLabel>
                    <IonInput name="admissionNumber" value={formData.admissionNumber} onIonChange={(e) => handleInputChange(e)} />
                  </IonItem>
                </>
              )}

              {formData.role === 'Teacher' && (
                <>
                  <IonItem>
                    <IonLabel>Classes</IonLabel>
                    <IonSelect
                      multiple
                      value={formData.classes || []}
                      onIonChange={(e) => handleSelectChange('classes', e.detail.value)}
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
                      value={formData.subjects || []}
                      onIonChange={(e) => handleSelectChange('subjects', e.detail.value)}
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



              <IonButton expand="full" onClick={handleSave} className="ion-margin-top">
                Save
              </IonButton>
              <IonButton expand="full" color="light" onClick={closeModal}>
                Cancel
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Users;
