import { Redirect, Route, Switch } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Branches from './pages/branches/Branches';
import Users from './pages/users/Users';
import Students from './pages/students/Students';
import Teachers from './pages/teachers/Teachers';
import Parents from './pages/parents/Parents';
import ClassLevels from './pages/classlevels/ClassLevels';
import Classes from './pages/classes/Classes';
import Subjects from './pages/subjects/Subjects';
import FeeStructures from './pages/feestructures/FeeStructures';
import FeePayments from './pages/feepayments/FeePayments';
import Attendance from './pages/attendance/Attendance';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const { user, loading } = useAuth();

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <ProtectedRoute path="/dashboard/attendance" component={Attendance} title="Attendance" />
            <ProtectedRoute path="/dashboard/feepayments" component={FeePayments} title="Fee Payments" />
            <ProtectedRoute path="/dashboard/feestructures" component={FeeStructures} title="Fee Structures" />
            <ProtectedRoute path="/dashboard/subjects" component={Subjects} title="Subjects" />
            <ProtectedRoute path="/dashboard/classes" component={Classes} title="Classes" />
            <ProtectedRoute path="/dashboard/classlevels" component={ClassLevels} title="Class Levels" />
            <ProtectedRoute path="/dashboard/users" component={Users} title="User Management" />
            <ProtectedRoute path="/dashboard/students" component={Students} title="Manage Students" />
            <ProtectedRoute path="/dashboard/teachers" component={Teachers} title="Manage Teachers" />
            <ProtectedRoute path="/dashboard/parents" component={Parents} title="Manage Parents" />
            <ProtectedRoute path="/dashboard/branches" component={Branches} title="Branches" />
            <ProtectedRoute path="/dashboard" component={Dashboard} title="Dashboard" />
            <Route exact path="/">
              {loading ? (
                <div>Loading...</div>
              ) : user ? (
                <Redirect to="/dashboard" />
              ) : (
                <Redirect to="/login" />
              )}
            </Route>
          </Switch>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
