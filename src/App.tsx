import { Redirect, Route, Switch } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Branches from './pages/branches/Branches';
import Users from './pages/users/Users';
import AdminsPage from './pages/users/Admins';
import StudentsPage from './pages/users/Students';
import TeachersPage from './pages/users/Teachers';
import ParentsPage from './pages/users/Parents';
import ClassLevels from './pages/classlevels/ClassLevels';
import Classes from './pages/classes/Classes';
import Subjects from './pages/subjects/Subjects';
import FeeStructures from './pages/feestructures/FeeStructures';
import Invoices from './pages/invoices/Invoices';
import FeePayments from './pages/feepayments/FeePayments';
import Attendance from './pages/attendance/Attendance';
import AttendanceReports from './pages/attendance/AttendanceReports';
import Results from './pages/results/Results';
import BulkAddResultsPage from './pages/results/BulkAddResultsPage';
import Announcements from './pages/announcements/Announcements';
import Reports from './pages/reports/Reports';
import LeaveRequestManagement from './pages/leave/LeaveRequests';
import LeaveRequestForm from './pages/leave/LeaveRequestForm';
import PromotionPage from './pages/promotions/PromotionPage';
import ReportCardPreviewPage from './pages/reports/ReportCardPreview';
import FeeReportPreviewPage from './pages/reports/FeeReportPreview';
import ReceiptPreviewPage from './pages/feepayments/ReceiptPreview';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";


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
            <ProtectedRoute path="/dashboard/promotions" component={PromotionPage} />
            {/* <ProtectedRoute path="/reports/report-card/:classId/:sessionId" component={ReportCardPreviewPage} /> */}
            <ProtectedRoute path="/reports/report-card-preview" component={ReportCardPreviewPage} />
            <ProtectedRoute path="/reports/fee-report-preview" component={FeeReportPreviewPage} />
            <ProtectedRoute path="/receipt-preview/:id" component={ReceiptPreviewPage} />
            <ProtectedRoute path="/dashboard/reports" component={Reports} />
            <ProtectedRoute path="/results/bulk-add" component={BulkAddResultsPage} />
            <ProtectedRoute path="/dashboard/results" component={Results} />
            <ProtectedRoute path="/dashboard/announcements" component={Announcements} />
            <ProtectedRoute path="/dashboard/attendance/reports" component={AttendanceReports} />
            <ProtectedRoute path="/dashboard/leave-request/new" component={LeaveRequestForm} />
            <ProtectedRoute path="/dashboard/leave-requests" component={LeaveRequestManagement} />
            <ProtectedRoute path="/dashboard/attendance" component={Attendance} />
            <ProtectedRoute path="/dashboard/feepayments" component={FeePayments} />
            <ProtectedRoute path="/dashboard/invoices" component={Invoices} />
            <ProtectedRoute path="/dashboard/feestructures" component={FeeStructures} />
            <ProtectedRoute path="/dashboard/subjects" component={Subjects} />
            <ProtectedRoute path="/dashboard/classes" component={Classes} />
            <ProtectedRoute path="/dashboard/classlevels" component={ClassLevels} />
            <ProtectedRoute path="/dashboard/parents" component={ParentsPage} />
            <ProtectedRoute path="/dashboard/teachers" component={TeachersPage} />
            <ProtectedRoute path="/dashboard/students" component={StudentsPage} />
            <ProtectedRoute path="/dashboard/admins" component={AdminsPage} />
            <ProtectedRoute path="/dashboard/users" component={Users} />
            <ProtectedRoute path="/dashboard/branches" component={Branches} />
            <ProtectedRoute path="/dashboard" component={Dashboard} />
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
