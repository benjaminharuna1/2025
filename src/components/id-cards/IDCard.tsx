import React from 'react';
import QRCode from 'qrcode.react';
import './IDCard.css';

interface IDCardProps {
  data: any;
}

const IDCard: React.FC<IDCardProps> = ({ data }) => {
  const { user, profile, branch } = data;

  const getImageUrl = (path?: string) => {
    if (!path) return 'https://ui-avatars.com/api/?name=' + user.name.replace(/\s/g, '+');
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL.replace('/api', '');
    return `${BACKEND_URL}/${path.replace('public/', '')}`;
  };

  const getIdCardType = () => {
    switch (user.role) {
      case 'Student':
        return 'Student ID Card';
      case 'Teacher':
      case 'Admin':
        return 'Staff ID Card';
      case 'Parent':
        return 'Parent ID Card';
      default:
        return 'ID Card';
    }
  };

  const getIdNumber = () => {
    switch (user.role) {
      case 'Student':
        return profile.admissionNumber;
      case 'Teacher':
      case 'Admin':
        return profile.staffId;
      case 'Parent':
        return profile.parentId;
      default:
        return 'N/A';
    }
  };

  const qrCodeValue = `
    Name: ${user.name}
    Role: ${user.role}
    ID: ${getIdNumber()}
    Branch: ${branch.name}
  `;

  return (
    <div className="page">
      <section className="card front" aria-label="ID card front">
        <div className="header">
          <div className="center-text">
            <div className="school-name">{branch.schoolName || 'School Name'}</div>
            <div className="branch-name">{branch.name}</div>
            <div className="address">{branch.address}</div>
            <div className="id-card-type">{getIdCardType()}</div>
          </div>
        </div>
        <div className="body">
          <div className="body-left">
            <div className="photo">
              <img src={getImageUrl(user.profilePicture)} alt="photo" />
            </div>
          </div>

          <div className="body-right">
            <div className="info">
              <label>Name</label><div className="value">{user.name}</div>
              <label>ID Number</label><div className="value">{getIdNumber()}</div>
              <label>Gender</label><div className="value">{user.gender || 'N/A'}</div>
              <label>Date of Birth</label><div className="value">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
              <label>Blood Group/Genotype</label><div className="value">{profile.bloodGroup || 'N/A'} / {profile.genotype || 'N/A'}</div>
              <label>Address</label><div className="value">{profile.address || 'N/A'}</div>
              <label>Contact</label><div className="value">{profile.phoneNumber || 'N/A'}</div>
            </div>
          </div>
        </div>
        <div className="footer-shape"></div>
      </section>

      <section className="card back" aria-label="ID card back">
        <div className="terms">
          <div className="term-title">Important notice</div>
          <div className="term-text small">
            This ID card must be carried at all times while on school premises.<br />
            The card remains the property of {branch.schoolName} and must be returned upon request.<br />
            If found, please return to:<br />
            {branch.schoolName} - {branch.name}<br />
            {branch.address}<br />
            Tel: {branch.contact}
          </div>
        </div>

        <div className="meta">
          <div className="left">
            <div className="small"><strong>Next of Kin:</strong> {profile.nextOfKinName || 'N/A'}</div>
            <div className="small"><strong>Contact:</strong> {profile.nextOfKinPhoneNumber || 'N/A'}</div>
          </div>

          <div className="right">
            <div className="qr">
              <QRCode value={qrCodeValue} size={80} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IDCard;
