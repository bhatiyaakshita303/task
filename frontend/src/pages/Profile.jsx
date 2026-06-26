import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import { LogOut, Info, Settings, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="profile-card">
          {/* Avatar with initial letter */}
          <div className="profile-avatar">
            {getInitials(user?.name)}
          </div>
          
          <h2 className="profile-name">{user?.name || 'User Name'}</h2>
          <p className="profile-email">{user?.email || 'user@example.com'}</p>

          <div className="profile-details">
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} />
              <span>Workspace & Application Info</span>
            </h3>

            <div className="profile-detail-row">
              <span style={{ color: 'var(--text-muted)' }}>Role</span>
              <span style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={14} style={{ color: 'var(--priority-low)' }} />
                Workspace Admin
              </span>
            </div>

            <div className="profile-detail-row">
              <span style={{ color: 'var(--text-muted)' }}>App Version</span>
              <span>1.0.0 (Production Release)</span>
            </div>

            <div className="profile-detail-row">
              <span style={{ color: 'var(--text-muted)' }}>Technology Stack</span>
              <span style={{ textAlign: 'right', fontSize: '0.8rem' }}>React.js + Node.js + MongoDB</span>
            </div>
            
            <div className="profile-detail-row">
              <span style={{ color: 'var(--text-muted)' }}>License</span>
              <span>MIT License</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ width: '100%', marginTop: '2rem', padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
