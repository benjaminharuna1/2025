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
import api from '../../services/api';
import { Result, Student, Subject } from '../../types';

const Results: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [formData, setFormData] = useState<Partial<Result>>({});

  useEffect(() => {
    fetchResults();
    fetchStudents();
    fetchSubjects();
  }, []);

  const fetchResults = async () => {
    try {
      const { data } = await api.get('/results');
      setResults(data.results || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/users?role=Student');
      setStudents(data.users || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSave = async () => {
    if (selectedResult) {
      await api.put(`/results/${selectedResult._id}`, formData);
    } else {
      await api.post('/results', formData);
    }
    fetchResults();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/results/${id}`);
    fetchResults();
  };

  const openModal = (result: Result | null = null) => {
    setSelectedResult(result);
    setFormData(result ? { ...result } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedResult(null);
    setFormData({});
  };

  const handleInputChange = (e: any) => {
    const { name } = e.target;
    const value = e.detail.value;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Results</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton onClick={() => openModal()}>
                <IonIcon slot="start" icon={add} />
                Add Result
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <div className="ion-padding">
                <table className="responsive-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result._id}>
                        <td>{typeof result.studentId === 'object' && result.studentId.name}</td>
                        <td>{typeof result.subjectId === 'object' && result.subjectId.name}</td>
                        <td>{result.marks}</td>
                        <td>{result.grade}</td>
                        <td>
                          <IonButton onClick={() => openModal(result)}>
                            <IonIcon slot="icon-only" icon={create} />
                          </IonButton>
                          <IonButton color="danger" onClick={() => handleDelete(result._id)}>
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
              <IonCardTitle>{selectedResult ? 'Edit' : 'Add'} Result</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel>Student</IonLabel>
                <IonSelect name="studentId" value={formData.studentId} onIonChange={handleInputChange}>
                  {students.map((student) => (
                    <IonSelectOption key={student._id} value={student._id}>
                      {student.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Subject</IonLabel>
                <IonSelect name="subjectId" value={formData.subjectId} onIonChange={handleInputChange}>
                  {subjects.map((subject) => (
                    <IonSelectOption key={subject._id} value={subject._id}>
                      {subject.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Marks</IonLabel>
                <IonInput name="marks" type="number" value={formData.marks} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Grade</IonLabel>
                <IonInput name="grade" value={formData.grade} onIonChange={handleInputChange} />
              </IonItem>
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

export default Results;
