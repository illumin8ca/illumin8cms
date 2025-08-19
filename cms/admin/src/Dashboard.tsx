import React from 'react';
import { colors, fonts, borderRadius, shadows, brandStyles } from './brand';
import { Button, Card, Heading } from './components/UIComponents';
import { Icons } from './components/Icons';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const features = [
    {
      title: 'Pages Manager',
      description: 'Create, edit, and manage website pages and content',
      icon: <Icons.Pages size={48} color={colors.orange} />,
      action: () => onNavigate('pages'),
      color: '#e3f2fd'
    },
    {
      title: 'Media Library',
      description: 'Upload and manage images, videos, and documents',
      icon: <Icons.Media size={48} color={colors.orange} />,
      action: () => onNavigate('media'),
      color: '#f3e5f5'
    },
    {
      title: 'Site Settings',
      description: 'Configure site name, logo, social links, and features',
      icon: <Icons.Settings size={48} color={colors.orange} />,
      action: () => onNavigate('settings'),
      color: '#e8f5e8'
    },
    {
      title: 'User Management',
      description: 'Add and manage CMS users, roles, and permissions',
      icon: <Icons.Users size={48} color={colors.orange} />,
      action: () => onNavigate('users'),
      color: '#fff3e0'
    },
    {
      title: 'Products (eCommerce)',
      description: 'Manage products, inventory, and Stripe payments',
      icon: <Icons.Products size={48} color={colors.orange} />,
      action: () => onNavigate('products'),
      color: '#fce4ec'
    }
  ];

  return (
    <div style={{
      minWidth: '1080px',
      maxWidth: '1400px',
      margin: '40px auto',
      padding: '32px',
      fontFamily: fonts.main,
    }}>
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <img src="/images/illumin8-logo.png" alt="Illumin8 Logo" style={{ height: '78px', marginBottom: '16px' }} />
        <Heading level={1} style={{ marginBottom: '8px' }}>
          Welcome to Illumin8 CMS
        </Heading>
        <p style={{ 
          fontSize: '18px', 
          color: colors.black, 
          maxWidth: '600px', 
          margin: '0 auto',
          lineHeight: '1.6',
          fontFamily: fonts.main,
          fontWeight: fonts.bodyWeight
        }}>
          Manage your website content, media, and settings from this powerful admin dashboard.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {features.map((feature, index) => (
          <Card
            key={index}
            hover={true}
            style={{
              backgroundColor: feature.color,
              border: `2px solid ${colors.lightGray}`,
              cursor: 'pointer',
              textAlign: 'center'
            }}
            onClick={feature.action}
          >
            <div style={{ 
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              {feature.icon}
            </div>
            <Heading level={3} style={{ marginBottom: '12px', color: colors.black }}>
              {feature.title}
            </Heading>
            <p style={{
              fontSize: '16px',
              color: colors.black,
              lineHeight: '1.5',
              margin: 0,
              fontFamily: fonts.main,
              fontWeight: fonts.bodyWeight
            }}>
              {feature.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Stats Overview */}
      <Card title="Content Overview" style={{ marginBottom: '40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: fonts.headingWeight, 
              color: colors.black,
              fontFamily: fonts.main
            }}>2</div>
            <div style={{ 
              color: colors.black,
              fontFamily: fonts.main,
              fontSize: '16px',
              fontWeight: fonts.bodyWeight
            }}>Pages Published</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: fonts.headingWeight, 
              color: colors.black,
              fontFamily: fonts.main
            }}>5</div>
            <div style={{ 
              color: colors.black,
              fontFamily: fonts.main,
              fontSize: '16px',
              fontWeight: fonts.bodyWeight
            }}>Media Files</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: fonts.headingWeight, 
              color: colors.black,
              fontFamily: fonts.main
            }}>2</div>
            <div style={{ 
              color: colors.black,
              fontFamily: fonts.main,
              fontSize: '16px',
              fontWeight: fonts.bodyWeight
            }}>Active Users</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: fonts.headingWeight, 
              color: colors.black,
              fontFamily: fonts.main
            }}>3</div>
            <div style={{ 
              color: colors.black,
              fontFamily: fonts.main,
              fontSize: '16px',
              fontWeight: fonts.bodyWeight
            }}>Products</div>
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <div style={{
        background: colors.lightGray,
        borderRadius: borderRadius.card,
        padding: '24px',
        textAlign: 'center'
      }}>
        <Heading level={3} style={{ marginBottom: '12px', color: colors.black }}>
          Need Help?
        </Heading>
        <p style={{ 
          fontSize: '16px', 
          color: colors.black, 
          marginBottom: '16px',
          fontFamily: fonts.main,
          fontWeight: fonts.bodyWeight
        }}>
          Check out our documentation or contact support for assistance.
        </p>
        <a 
          href="https://github.com/illumin8ca/illumin8cms" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Button>
            <Icons.Help size={18} />
            View Documentation
          </Button>
        </a>
      </div>
    </div>
  );
};

export default Dashboard; 