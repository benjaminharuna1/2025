import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IonSpinner } from '@ionic/react';
import Page from '../components/Page'; // Import the new Page component

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  title: string; // Add title prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, title, ...rest }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner />
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        user ? (
          <Page title={title}>
            <Component {...props} />
          </Page>
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default ProtectedRoute;
