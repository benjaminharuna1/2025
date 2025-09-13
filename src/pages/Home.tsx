import React from 'react';
import { IonContent, IonPage, IonButton, IonImg } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const appName = import.meta.env.VITE_APP_NAME || 'Multi School Management System';

  const goToLogin = () => {
    history.push('/login');
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="home-container">
          <div className="logo-container">
            <IonImg src="/favicon.png" alt="App Logo" />
          </div>
          <h1>Welcome to {appName}</h1>
          <div className="login-button-container">
            <IonButton expand="block" onClick={goToLogin}>
              Login
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
