import React from 'react';
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

  return (
    <div className="page">
      <section className="card front" aria-label="ID card front">
        <div className="header">
          <div className="side-logo"></div>
          <div className="center-text">
            <div className="school-name">{branch.schoolName || 'School Name'}</div>
            <div className="slogan">{branch.slogan || 'School Slogan'}</div>
          </div>
          <div className="right-logo"></div>
        </div>
        <div className="body">
          <div className="body-left">
            <div className="photo">
              <img src={getImageUrl(user.profilePicture)} alt="photo" />
            </div>
            <div className="student-name">{user.name}</div>
            <div className="">
              <div className="student-name"><strong>Admission No:</strong> {profile.admissionNumber || profile.staffId || profile.parentId}</div>
            </div>
          </div>

          <div className="body-right">
            <div>
              <div className="info">
                <label>Father/Guardian</label><div className="value">{profile.nextOfKinName || 'N/A'}</div>
                <label>Gender</label><div className="value">{user.gender || 'N/A'}</div>
                <label>Admission</label><div className="value">{profile.admissionDate || 'N/A'}</div>
                <label>Date of Birth</label><div className="value">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            <div className="id-bottom">
              <div className="contact">
                {branch.address}<br />
                Telephone: {branch.contact}
              </div>

              <div className="sign">
                <img src={getImageUrl(branch.principalSignature)} alt="signature" style={{ width: '100px', height: '50px', objectFit: 'contain' }} />
                <div>Principal</div>
                <div style={{ fontWeight: 700 }}>{branch.principalName}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-shape"></div>
      </section>

      <section className="card back" aria-label="ID card back">
        <div className="terms">
          <div className="term-title">TERMS AND CONDITIONS</div>
          <div className="term-text small">
            This card is the property of the school and must be surrendered upon request.
            Students must carry this card at all times while on school premises.
            Replacement fee applies for lost cards.
          </div>
        </div>

        <div className="meta">
          <div className="left">
            <div className="small"><strong>Phone:</strong> {branch.contact}</div>
            <div className="small"><strong>Email:</strong> {branch.email || 'info@school.com'}</div>
            <div className="small" style={{ marginTop: '6px' }}><strong>Validity:</strong> 01-Jan-2025 to 31-Dec-2025</div>
          </div>

          <div className="right">
            <div className="qr">QR CODE</div>
            <div className="small" style={{ marginTop: '8px' }}>Website: {branch.website || 'www.school.com'}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IDCard;
