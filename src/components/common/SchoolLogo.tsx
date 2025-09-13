import React from 'react';
import { IonImg } from '@ionic/react';

interface SchoolLogoProps {
  logoUrl?: string;
  alt?: string;
  className?: string;
}

const SchoolLogo: React.FC<SchoolLogoProps> = ({ logoUrl, alt = 'School Logo', className }) => {
  const defaultLogo = '/public/favicon.png'; // Using the Ionic logo as a placeholder

  return (
    <IonImg
      src={logoUrl || defaultLogo}
      alt={alt}
      className={className}
    />
  );
};

export default SchoolLogo;
