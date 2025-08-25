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
      { text: 'Users', icon: peopleOutline, path: '/dashboard/users', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Class Levels', icon: schoolOutline, path: '/dashboard/classlevels', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Classes', icon: schoolOutline, path: '/dashboard/classes', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Subjects', icon: bookOutline, path: '/dashboard/subjects', roles: ['Super Admin', 'Branch Admin'] },
      { text: 'Fee Structures', icon: cashOutline, path: '/dashboard/feestructures', roles: ['Super Admin', 'Branch Admin', 'Accountant'] },
      { text: 'Invoices', icon: cashOutline, path: '/dashboard/invoices', roles: ['Super Admin', 'Branch Admin', 'Accountant'] },
      { text: 'Fee Payments', icon: cashOutline, path: '/dashboard/feepayments', roles: ['Super Admin', 'Branch Admin', 'Accountant'] },
      { text: 'Attendance', icon: calendarOutline, path: '/dashboard/attendance', roles: ['Super Admin', 'Branch Admin', 'Teacher'] },
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
