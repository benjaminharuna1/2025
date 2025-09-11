import React from 'react';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  IonButton,
  IonAvatar,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import {
  homeOutline,
  logOutOutline,
  peopleOutline,
  businessOutline,
  schoolOutline,
  bookOutline,
  cashOutline,
  calendarOutline,
  documentTextOutline,
  megaphoneOutline,
  barChartOutline,
} from 'ionicons/icons';
import { getImageUrl } from '../utils/url';

const SidebarMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    await logout();
    history.push('/login');
  };

  const renderMenuItems = () => {
    if (!user) return null;

    const allLinks = [
      { text: 'Dashboard', icon: homeOutline, path: '/dashboard', roles: ['Super Admin', 'Branch Admin', 'Teacher', 'Accountant', 'Student', 'Parent'] },
      { text: 'Branches', icon: businessOutline, path: '/dashboard/branches', roles: ['Super Admin'] },
      { text: 'Admins', icon: peopleOutline, path: '/dashboard/admins', roles: ['Super Admin'] },
      { text: 'Students', icon: schoolOutline, path: '/dashboard/students', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Teachers', icon: peopleOutline, path: '/dashboard/teachers', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Parents', icon: peopleOutline, path: '/dashboard/parents', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Class Levels', icon: schoolOutline, path: '/dashboard/classlevels', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Classes', icon: schoolOutline, path: '/dashboard/classes', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'End of Session', icon: schoolOutline, path: '/dashboard/promotions', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Subjects', icon: bookOutline, path: '/dashboard/subjects', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Fee Structures', icon: cashOutline, path: '/dashboard/feestructures', roles: ['Super Admin', 'Branch Admin', 'Accountant'] },
      { text: 'Invoices', icon: cashOutline, path: '/dashboard/invoices', roles: ['Super Admin', 'Branch Admin', 'Accountant'] },
      { text: 'Fee Payments', icon: cashOutline, path: '/dashboard/feepayments', roles: ['Super Admin', 'Branch Admin', 'Accountant'] },
      { text: 'Attendance', icon: calendarOutline, path: '/dashboard/attendance', roles: ['Super Admin', 'Branch Admin', 'Teacher'] },
      { text: 'Attendance Reports', icon: barChartOutline, path: '/dashboard/attendance/reports', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Leave Requests', icon: calendarOutline, path: '/dashboard/leave-requests', roles: ['Super Admin', 'Branch Admin', 'Teacher'] },
      { text: 'Submit Leave Request', icon: calendarOutline, path: '/dashboard/leave-request/new', roles: ['Parent'] },
      { text: 'Results', icon: documentTextOutline, path: '/dashboard/results', roles: ['Super Admin', 'Branch Admin', 'Teacher', 'Student', 'Parent'] },
      { text: 'Announcements', icon: megaphoneOutline, path: '/dashboard/announcements', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Reports', icon: barChartOutline, path: '/dashboard/reports', roles: ['Super Admin', 'Branch Admin', 'Accountant'] },
    ];

    return allLinks
      .filter(link => link.roles.includes(user.role))
      .map((link, index) => (
        <IonMenuToggle key={index} autoHide={false}>
          <IonItem button routerLink={link.path} routerDirection="none">
            <IonIcon slot="start" icon={link.icon} />
            <IonLabel>{link.text}</IonLabel>
          </IonItem>
        </IonMenuToggle>
      ));
  };

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {user && (
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center' }}>
            <IonAvatar style={{ marginRight: '16px' }}>
              <img src={getImageUrl(user.profilePicture) || `https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}`} alt="profile" />
            </IonAvatar>
            <IonLabel>
              <h2>{user.name}</h2>
              <p>{user.role}</p>
            </IonLabel>
          </div>
        )}
        <IonList>
          {renderMenuItems()}
        </IonList>
      </IonContent>
      <IonButton expand="full" onClick={handleLogout}>
        <IonIcon slot="start" icon={logOutOutline} />
        Logout
      </IonButton>
    </IonMenu>
  );
};

export default SidebarMenu;
