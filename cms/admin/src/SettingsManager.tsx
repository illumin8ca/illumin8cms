import React, { useState, useEffect } from 'react';
import { colors, fonts, borderRadius, shadows } from './brand';
import { Button, Card, Heading, Input, Textarea, FormGroup } from './components/UIComponents';
import { Icons } from './components/Icons';

interface Settings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  enableComments: boolean;
  enableRegistration: boolean;
  maintenanceMode: boolean;
  logo: string;
  favicon: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
}

interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  d1DatabaseId: string;
  r2BucketName: string;
  r2PublicDomain: string;
  pagesProjectName: string;
  turnstileSiteKey: string;
  turnstileSecretKey: string;
}

interface MediaFile {
  id: number;
  name: string;
  url: string;
  type: string;
}

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'Illumin8 CMS Site',
    siteDescription: 'A powerful content management system',
    siteUrl: 'https://yoursite.com',
    adminEmail: 'admin@illumin8.ca',
    enableComments: true,
    enableRegistration: false,
    maintenanceMode: false,
    logo: '/images/illumin8-logo.png',
    favicon: '/images/illumin8-icon.png',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  const [saved, setSaved] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentMediaField, setCurrentMediaField] = useState<'logo' | 'favicon' | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'cloudflare'>('general');
  
  const [cloudflareConfig, setCloudflareConfig] = useState<CloudflareConfig>({
    accountId: '',
    apiToken: '',
    d1DatabaseId: '',
    r2BucketName: 'illumin8cms-uploads',
    r2PublicDomain: '',
    pagesProjectName: 'illumin8cms',
    turnstileSiteKey: '1x00000000000000000000AA',
    turnstileSecretKey: '1x0000000000000000000000000000000AA'
  });

  // Load media files when modal opens
  const loadMediaFiles = async () => {
    try {
      setLoadingMedia(true);
      const response = await fetch('/admin/api/media/list');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMediaFiles(data.files || []);
        }
      }
    } catch (error) {
      console.error('Failed to load media files:', error);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving settings:', settings);
    console.log('Saving Cloudflare config:', cloudflareConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCloudflareConfigChange = (field: keyof CloudflareConfig, value: string) => {
    setCloudflareConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: keyof Settings['socialLinks'], value: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const openMediaBrowser = (field: 'logo' | 'favicon') => {
    setCurrentMediaField(field);
    setShowMediaModal(true);
    loadMediaFiles(); // Load files when opening modal
  };

  const selectMedia = (mediaFile: MediaFile) => {
    if (currentMediaField) {
      handleChange(currentMediaField, mediaFile.url);
    }
    setShowMediaModal(false);
    setCurrentMediaField(null);
  };

  const checkboxStyle = {
    width: '18px',
    height: '18px',
    marginRight: '12px',
    accentColor: colors.yellow,
    cursor: 'pointer'
  };

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '8px 0',
    color: colors.black,
    fontFamily: fonts.main,
    fontWeight: fonts.subheadingWeight,
    fontSize: '16px'
  };

  return (
    <>
    <div style={{
      minWidth: '1080px',
      maxWidth: '1400px',
      margin: '40px auto',
      padding: '32px',
      fontFamily: fonts.main,
    }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Heading level={2}>CMS Settings</Heading>
          <Button onClick={handleSave} size="large">
            <Icons.Save size={18} />
            {saved ? 'Settings Saved!' : 'Save Settings'}
          </Button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: `2px solid ${colors.lightGray}`,
          marginBottom: '32px'
        }}>
          <button
            onClick={() => setActiveTab('general')}
            style={{
              background: 'none',
              border: 'none',
              padding: '16px 24px',
              fontSize: '16px',
              fontFamily: fonts.main,
              fontWeight: fonts.subheadingWeight,
              color: activeTab === 'general' ? colors.orange : colors.black,
              borderBottom: activeTab === 'general' ? `3px solid ${colors.orange}` : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            <Icons.Settings size={18} style={{ marginRight: '8px' }} />
            General Settings
          </button>
          <button
            onClick={() => setActiveTab('cloudflare')}
            style={{
              background: 'none',
              border: 'none',
              padding: '16px 24px',
              fontSize: '16px',
              fontFamily: fonts.main,
              fontWeight: fonts.subheadingWeight,
              color: activeTab === 'cloudflare' ? colors.orange : colors.black,
              borderBottom: activeTab === 'cloudflare' ? `3px solid ${colors.orange}` : '3px solid transparent',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            <Icons.CloudUpload size={18} style={{ marginRight: '8px' }} />
            Cloudflare Config
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && (
          <div>
            <Heading level={3} style={{ marginBottom: '20px' }}>
              General Settings
            </Heading>

            <FormGroup label="Site Name">
            <Input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              placeholder="Your site name"
            />
          </FormGroup>

          <FormGroup label="Site Description">
            <Textarea
              value={settings.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              placeholder="Brief description of your site"
              rows={3}
            />
          </FormGroup>

          <FormGroup label="Site URL">
            <Input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => handleChange('siteUrl', e.target.value)}
              placeholder="https://yoursite.com"
            />
          </FormGroup>

          <FormGroup label="Admin Email">
            <Input
              type="email"
              value={settings.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              placeholder="admin@yoursite.com"
            />
          </FormGroup>

            {/* Features */}
            <div style={{ marginBottom: '32px' }}>
          <Heading level={3} style={{ marginBottom: '20px' }}>
            Features
          </Heading>

          <div style={{ marginBottom: '16px' }}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={settings.enableComments}
                onChange={(e) => handleChange('enableComments', e.target.checked)}
                style={checkboxStyle}
              />
              Enable Comments
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={settings.enableRegistration}
                onChange={(e) => handleChange('enableRegistration', e.target.checked)}
                style={checkboxStyle}
              />
              Enable User Registration
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              ...checkboxLabelStyle,
              color: settings.maintenanceMode ? '#c62828' : colors.black
            }}>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                style={checkboxStyle}
              />
              Maintenance Mode {settings.maintenanceMode && '(Site will be offline)'}
            </label>
          </div>
        </div>

        {/* Branding */}
        <div style={{ marginBottom: '32px' }}>
          <Heading level={3} style={{ marginBottom: '20px' }}>
            Branding
          </Heading>

          <FormGroup label="Logo">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  type="text"
                  value={settings.logo}
                  onChange={(e) => handleChange('logo', e.target.value)}
                  placeholder="/images/logo.png"
                />
              </div>
              <Button onClick={() => openMediaBrowser('logo')}>
                <Icons.Media size={18} />
                Browse Media
              </Button>
            </div>
            {settings.logo && (
              <div style={{ marginTop: '8px' }}>
                <img 
                  src={settings.logo} 
                  alt="Logo Preview" 
                  style={{ 
                    maxHeight: '60px', 
                    maxWidth: '200px',
                    border: `1px solid ${colors.lightGray}`,
                    borderRadius: '4px',
                    padding: '4px'
                  }} 
                />
              </div>
            )}
          </FormGroup>

          <FormGroup label="Favicon">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  type="text"
                  value={settings.favicon}
                  onChange={(e) => handleChange('favicon', e.target.value)}
                  placeholder="/images/favicon.ico"
                />
              </div>
              <Button onClick={() => openMediaBrowser('favicon')}>
                <Icons.Media size={18} />
                Browse Media
              </Button>
            </div>
            {settings.favicon && (
              <div style={{ marginTop: '8px' }}>
                <img 
                  src={settings.favicon} 
                  alt="Favicon Preview" 
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    border: `1px solid ${colors.lightGray}`,
                    borderRadius: '4px',
                    padding: '2px'
                  }} 
                />
              </div>
            )}
          </FormGroup>
        </div>

            {/* Social Media */}
            <div style={{ marginBottom: '32px' }}>
          <Heading level={3} style={{ marginBottom: '20px' }}>
            Social Media Links
          </Heading>

          <FormGroup label="Facebook">
            <Input
              type="url"
              value={settings.socialLinks.facebook}
              onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </FormGroup>

          <FormGroup label="Twitter">
            <Input
              type="url"
              value={settings.socialLinks.twitter}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              placeholder="https://twitter.com/youraccount"
            />
          </FormGroup>

          <FormGroup label="Instagram">
            <Input
              type="url"
              value={settings.socialLinks.instagram}
              onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
              placeholder="https://instagram.com/youraccount"
            />
          </FormGroup>

          <FormGroup label="LinkedIn">
            <Input
              type="url"
              value={settings.socialLinks.linkedin}
              onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </FormGroup>
            </div>
          </div>
        )}

        {/* Cloudflare Configuration */}
        {activeTab === 'cloudflare' && (
          <div>
            <Heading level={3} style={{ marginBottom: '20px' }}>
              Cloudflare Configuration
            </Heading>
            <p>Coming soon - Cloudflare configuration interface</p>
          </div>
        )}

        {/* Save Button */}
        <div style={{ textAlign: 'center', borderTop: `1px solid ${colors.lightGray}`, paddingTop: '24px' }}>
          <Button onClick={handleSave} size="large">
            <Icons.Save size={18} />
            {saved ? 'Settings Saved Successfully!' : 'Save All Settings'}
          </Button>
        </div>
      </Card>

      {/* Media Modal */}
      {showMediaModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: borderRadius.card,
            padding: '32px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80%',
            overflow: 'auto',
            boxShadow: shadows.lg
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <Heading level={3} style={{ margin: 0 }}>
                Select {currentMediaField === 'logo' ? 'Logo' : 'Favicon'}
              </Heading>
                                            <Button onClick={() => setShowMediaModal(false)} variant="secondary">
                 <Icons.Close size={18} />
                 Close
               </Button>
            </div>

                         {loadingMedia ? (
               <div style={{ textAlign: 'center', padding: '40px' }}>
                 <p style={{ color: colors.black, fontFamily: fonts.main }}>
                   Loading media files...
                 </p>
               </div>
             ) : mediaFiles.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '40px' }}>
                 <Icons.Media size={48} color={colors.orange} style={{ marginBottom: '16px' }} />
                 <p style={{ color: colors.black, fontFamily: fonts.main }}>
                   No media files found. Upload some files in the Media Manager first.
                 </p>
               </div>
             ) : (
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                 gap: '20px'
               }}>
                 {mediaFiles.filter(file => file.type.startsWith('image/')).map((file) => (
                <div key={file.id} style={{
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: borderRadius.card,
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: colors.white
                }}
                onClick={() => selectMedia(file)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = shadows.subtle;
                  e.currentTarget.style.borderColor = colors.orange;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = colors.lightGray;
                }}>
                  <img 
                    src={file.url} 
                    alt={file.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '120px',
                      objectFit: 'contain',
                      marginBottom: '12px'
                    }}
                  />
                  <div style={{
                    fontSize: '14px',
                    fontWeight: fonts.subheadingWeight,
                    color: colors.black,
                    marginBottom: '8px'
                  }}>
                    {file.name}
                  </div>
                  <Button size="small">
                    <Icons.Check size={14} />
                    Select
                  </Button>
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default SettingsManager; 