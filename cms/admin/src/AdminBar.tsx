import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors, fonts, borderRadius, shadows, brandStyles } from './brand';
import { Icons } from './components/Icons';

interface AdminBarProps {
  onLogout: () => void;
}

const AdminBar: React.FC<AdminBarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: 'dashboard', label: 'Dashboard', icon: <Icons.Dashboard size={18} /> },
    { path: 'pages', label: 'Pages', icon: <Icons.Pages size={18} /> },
    { path: 'media', label: 'Media', icon: <Icons.Media size={18} /> },
    { path: 'products', label: 'Products', icon: <Icons.Products size={18} /> },
    { path: 'users', label: 'Users', icon: <Icons.Users size={18} /> },
    { path: 'settings', label: 'Settings', icon: <Icons.Settings size={18} /> }
  ];

  const isActivePath = (path: string) => {
    const fullPath = `/admin/${path}`;
    return location.pathname === fullPath || location.pathname.startsWith(fullPath + '/');
  };

  const getNavButtonStyle = (isActive: boolean) => ({
    background: isActive ? colors.yellow : 'transparent',
    color: colors.black,
    border: isActive ? `4px solid ${colors.orange}` : '4px solid transparent',
    borderRadius: borderRadius.pill,
    fontWeight: isActive ? fonts.headingWeight : fonts.subheadingWeight,
    fontFamily: fonts.main,
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    boxShadow: isActive ? shadows.subtle : 'none'
  });

  const actionButtonStyle = {
    ...brandStyles.button,
    padding: '8px 16px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        background: colors.white,
        borderBottom: `4px solid ${colors.yellow}`,
        boxShadow: shadows.subtle,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 64,
        fontFamily: fonts.main,
      }}
    >
      {/* Logo */}
      <div 
        onClick={() => navigate('/dashboard')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          height: '100%', 
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'opacity 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        <img src="/images/illumin8-logo.png" alt="Illumin8 Logo" style={{ height: 48, marginRight: 16 }} />
        <span style={{ 
          color: colors.black, 
          fontWeight: fonts.headingWeight, 
          fontSize: 20, 
          letterSpacing: 1,
          fontFamily: fonts.main
        }}>
          Illumin8 CMS
        </span>
      </div>

      {/* Navigation Menu */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8,
        flex: 1,
        justifyContent: 'center'
      }}>
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={getNavButtonStyle(isActivePath(item.path))}
            onMouseEnter={(e) => {
              if (!isActivePath(item.path)) {
                e.currentTarget.style.backgroundColor = colors.lightGray;
                e.currentTarget.style.borderColor = '#ddd';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActivePath(item.path)) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* View Site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...actionButtonStyle,
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, brandStyles.buttonHover);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.orange;
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Icons.ViewSite size={18} />
          <span>View Site</span>
        </a>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            ...actionButtonStyle,
            backgroundColor: '#ffebee',
            borderColor: '#f8bbd9',
            color: '#c62828'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffcdd2';
            e.currentTarget.style.boxShadow = shadows.subtle;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffebee';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Icons.Logout size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminBar; 