import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonToast,
  IonButton,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
    show: false,
    message: '',
    color: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, classesRes, branchesRes] = await Promise.all([
        axios.get(`${API_URL}/students`, { withCredentials: true }),
        axios.get(`${API_URL}/classes`, { withCredentials: true }),
        axios.get(`${API_URL}/branches`, { withCredentials: true }),
      ]);
      setStudents(studentsRes.data.students || []);
      setClasses(classesRes.data.classes || []);
      setBranches(branchesRes.data.branches || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ show: true, message: 'Failed to fetch students, classes, or branches.', color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (studentProfile: any = null) => {
    if (studentProfile) {
      // Editing an existing student
      setSelectedStudent(studentProfile);
      setFormData({
        name: studentProfile.userId.name,
        email: studentProfile.userId.email,
        classId: studentProfile.classId?._id,
        branchId: studentProfile.branchId?._id,
        admissionNumber: studentProfile.admissionNumber || '',
        dateOfBirth: studentProfile.dateOfBirth?.split('T')[0] || '',
        gender: studentProfile.gender || '',
        phoneNumber: studentProfile.phoneNumber || '',
        address: studentProfile.address || '',
        bloodGroup: studentProfile.bloodGroup || '',
        sponsor: studentProfile.sponsor || '',
      });
      setShowModal(true);
    } else {
      // Adding a new student
      setSelectedStudent(null);
      setFormData({
        name: '', email: '', password: '', role: 'Student',
        classId: '', branchId: '', admissionNumber: '', dateOfBirth: '',
        gender: '', phoneNumber: '', address: '', bloodGroup: '', sponsor: ''
      });
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleInputChange = (e: any) => {
    const name = e.target.name;
    const value = e.detail?.value ?? e.target.value;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (selectedStudent) {
        // Update logic
        const userPayload = { name: formData.name, email: formData.email };
        await axios.put(`${API_URL}/users/${selectedStudent.userId._id}`, userPayload, { withCredentials: true });

        const profilePayload = {
            classId: formData.classId,
            admissionNumber: formData.admissionNumber,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            bloodGroup: formData.bloodGroup,
            sponsor: formData.sponsor,
            branchId: formData.branchId,
        };
        await axios.put(`${API_URL}/students/${selectedStudent._id}`, profilePayload, { withCredentials: true });

        setToast({ show: true, message: 'Student updated successfully!', color: 'success' });
        closeModal();
        fetchData();
      } else {
        // Create logic (2-step)
        if (!formData.password) {
            setIsLoading(false);
            return setToast({ show: true, message: "Password is required.", color: "warning" });
        }
        // 1. Create the core user
        const userPayload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'Student',
            branchId: formData.branchId, // branchId is part of the core user for students
        };
        const res = await axios.post(`${API_URL}/users`, userPayload, { withCredentials: true });

        // 2. Update the newly created profile with the rest of the details
        const newUser = res.data.user;
        const profileId = newUser.student?._id; // Assumes profile stub is returned

        if (profileId) {
            const profilePayload = {
                classId: formData.classId,
                admissionNumber: formData.admissionNumber,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                bloodGroup: formData.bloodGroup,
                sponsor: formData.sponsor,
            };
            await axios.put(`${API_URL}/students/${profileId}`, profilePayload, { withCredentials: true });
        }

        setToast({ show: true, message: 'Student created successfully!', color: 'success' });
        closeModal();
        fetchData();
      }
    } catch (error: any) {
      console.error('Error saving student:', error);
      let message = 'Failed to save student.';
      if (error.response?.data?.errors) {
        const errorFields = Object.keys(error.response.data.errors);
        if (errorFields.length > 0) {
          message = error.response.data.errors[errorFields[0]].message;
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      setToast({ show: true, message, color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This action is irreversible.')) {
        try {
            setIsLoading(true);
            await axios.delete(`${API_URL}/users/${userId}`, { withCredentials: true });
            setToast({ show: true, message: 'Student deleted successfully.', color: 'medium' });
            fetchData();
        } catch (error: any) {
            console.error('Error deleting student:', error);
            const message = error.response?.data?.message || 'Failed to delete student.';
            setToast({ show: true, message, color: 'danger' });
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <>
      <IonButton expand="block" onClick={() => openModal()}>
        Add Student
      </IonButton>

      {isLoading ? (
        <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : (
          <IonList>
            {students.map(student => (
              <IonItem key={student._id}>
                <IonLabel>
                  <h2>{student.userId.name}</h2>
                  <p>{student.userId.email}</p>
                </IonLabel>
                <IonButton slot="end" onClick={() => openModal(student)}>Edit</IonButton>
                <IonButton slot="end" color="danger" onClick={() => handleDelete(student.userId._id)}>Delete</IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{selectedStudent ? 'Edit' : 'Add'} Student</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Name</IonLabel>
                <IonInput name="name" value={formData.name} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput name="email" type="email" value={formData.email} onIonChange={handleInputChange} />
              </IonItem>
              {!selectedStudent && (
                  <IonItem>
                      <IonLabel position="stacked">Password</IonLabel>
                      <IonInput name="password" type="password" value={formData.password} onIonChange={handleInputChange} />
                  </IonItem>
              )}
              <IonItem>
                <IonLabel>Class</IonLabel>
                <IonSelect name="classId" value={formData.classId} onIonChange={(e) => handleSelectChange('classId', e.detail.value)}>
                  {classes.map(c => (
                    <IonSelectOption key={c._id} value={c._id}>{c.name}</IonSelectOption>
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
              <IonItem>
                <IonLabel>Gender</IonLabel>
                <IonSelect name="gender" value={formData.gender} onIonChange={(e) => handleSelectChange('gender', e.detail.value)}>
                  <IonSelectOption value="Male">Male</IonSelectOption>
                  <IonSelectOption value="Female">Female</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Phone Number</IonLabel>
                <IonInput name="phoneNumber" type="tel" value={formData.phoneNumber} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel>Branch</IonLabel>
                <IonSelect name="branchId" value={formData.branchId} onIonChange={(e) => handleSelectChange('branchId', e.detail.value)}>
                  {branches.map(b => (
                    <IonSelectOption key={b._id} value={b._id}>{b.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Address</IonLabel>
                <IonInput name="address" value={formData.address} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Blood Group</IonLabel>
                <IonInput name="bloodGroup" value={formData.bloodGroup} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Sponsor</IonLabel>
                <IonInput name="sponsor" value={formData.sponsor} onIonChange={handleInputChange} />
              </IonItem>
            </IonList>
            <IonButton expand="block" onClick={handleSave}>Save Changes</IonButton>
            <IonButton expand="block" color="medium" onClick={closeModal}>Cancel</IonButton>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={toast.show}
          message={toast.message}
          color={toast.color}
          duration={3000}
          onDidDismiss={() => setToast({ show: false, message: '', color: '' })}
        />
    </>
  );
};

export default StudentsPage;
