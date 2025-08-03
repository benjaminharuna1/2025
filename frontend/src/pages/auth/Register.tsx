import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const history = useHistory();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/auth/register/parent`, { name, email, password });
      setSuccess(true);
      setTimeout(() => history.push('/login'), 2000);
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Parent Registration</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow class="ion-justify-content-center">
            <IonCol size-lg="4" size-md="6" size-xs="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle class="ion-text-center">Create Account</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <form onSubmit={handleRegister}>
                    <IonItem>
                      <IonLabel position="floating">Full Name</IonLabel>
                      <IonInput
                        type="text"
                        value={name}
                        onIonChange={(e) => setName(e.detail.value!)}
                        required
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="floating">Email</IonLabel>
                      <IonInput
                        type="email"
                        value={email}
                        onIonChange={(e) => setEmail(e.detail.value!)}
                        required
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="floating">Password</IonLabel>
                      <IonInput
                        type="password"
                        value={password}
                        onIonChange={(e) => setPassword(e.detail.value!)}
                        required
                      />
                    </IonItem>
                    <IonButton
                      type="submit"
                      expand="block"
                      class="ion-margin-top"
                      disabled={loading}
                    >
                      Register
                    </IonButton>
                  </form>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonLoading isOpen={loading} message={'Registering...'} />
        <IonToast
          isOpen={!!error}
          message={error || ''}
          duration={3000}
          onDidDismiss={() => setError(null)}
          color="danger"
        />
        <IonToast
          isOpen={success}
          message="Registration successful! Redirecting to login..."
          duration={2000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;
