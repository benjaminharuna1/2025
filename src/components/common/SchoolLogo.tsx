import React from 'react';
import { IonImg } from '@ionic/react';

interface SchoolLogoProps {
  logoUrl?: string;
  alt?: string;
  style?: React.CSSProperties;
}

const SchoolLogo: React.FC<SchoolLogoProps> = ({ logoUrl, alt = 'School Logo', style }) => {
  const defaultLogo = '/public/favicon.png'; // Using the Ionic logo as a placeholder

  return (
    <IonImg
      src={logoUrl || defaultLogo}
      alt={alt}
      style={{ width: '48px', height: '48px', ...style }}
    />
  );
};

export default SchoolLogo;
