import React, { useState, useEffect, useRef } from 'react';
import { colors, fonts, borderRadius, shadows } from './brand';
import { Button, Card, Heading } from './components/UIComponents';
import { Icons } from './components/Icons';

interface MediaFile {
  id: number;
  name: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
}

const MediaManager: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files from API on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/admin/api/media/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files || []);
      } else {
        throw new Error(data.error || 'Failed to load files');
      }
      
    } catch (error) {
      console.error('Load files error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load files');
      setFiles([]); // Start with empty array on error
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Add files to form data
      Array.from(selectedFiles).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/admin/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh the file list
        await loadFiles();
        
        // Show success message
        alert(`Successfully uploaded ${data.files.length} file(s)!`);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (!uploading) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleChooseFiles = () => {
    if (fileInputRef.current && !uploading) {
      fileInputRef.current.click();
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/admin/api/media/delete?id=${file.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove file from local state
        setFiles(files.filter(f => f.id !== file.id));
        alert('File deleted successfully!');
      } else {
        throw new Error(data.error || 'Delete failed');
      }
      
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete file');
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('URL copied to clipboard!');
    } catch (error) {
      console.error('Copy error:', error);
      alert('Failed to copy URL');
    }
  };

  if (loading) {
    return (
      <div style={{
        minWidth: '1080px',
        maxWidth: '1400px',
        margin: '40px auto',
        padding: '32px',
        fontFamily: fonts.main,
        textAlign: 'center',
      }}>
        <Card>
          <div style={{ padding: '40px' }}>
            <Icons.CloudUpload size={48} color={colors.orange} />
            <Heading level={2} style={{ marginTop: '16px', marginBottom: '8px' }}>
              Loading Media Files...
            </Heading>
            <p style={{ color: colors.black, fontFamily: fonts.main }}>
              Please wait while we load your media library.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      minWidth: '1080px',
      maxWidth: '1400px',
      margin: '40px auto',
      padding: '32px',
      fontFamily: fonts.main,
    }}>
      <Card title="Media Manager">
        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #f8bbd9',
            borderRadius: borderRadius.card,
            padding: '16px',
            marginBottom: '24px',
            color: '#c62828',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Icons.Error size={20} />
            <div>
              <strong>Error:</strong> {error}
              <Button 
                onClick={loadFiles} 
                size="small" 
                style={{ marginLeft: '12px' }}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          style={{
            border: `2px dashed ${dragOver ? colors.orange : '#999'}`,
            borderRadius: borderRadius.card,
            padding: '40px',
            textAlign: 'center',
            marginBottom: '32px',
            backgroundColor: dragOver ? '#fff9e6' : colors.white,
            transition: 'all 0.3s ease',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.7 : 1,
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleChooseFiles}
        >
          <div style={{ marginBottom: '16px' }}>
            <Icons.CloudUpload size={48} color={uploading ? '#999' : colors.orange} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ 
              fontSize: '18px', 
              color: uploading ? '#999' : colors.black,
              fontFamily: fonts.main,
              fontWeight: fonts.headingWeight
            }}>
              {uploading ? 'Uploading files...' : 'Drop files here or click to upload'}
            </strong>
          </div>
          <p style={{ 
            color: uploading ? '#999' : colors.black, 
            marginBottom: '16px',
            fontSize: '16px',
            fontFamily: fonts.main,
            fontWeight: fonts.bodyWeight
          }}>
            Supported formats: JPG, PNG, GIF, PDF, MP4, etc. (Max 10MB per file)
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={(e) => handleFileUpload(e.target.files)}
            style={{ display: 'none' }}
          />
          
          <Button size="large" disabled={uploading}>
            <Icons.Upload size={18} style={{ marginRight: '8px' }} />
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>

        {/* Files Grid */}
        {files.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            {files.map((file) => (
              <div key={file.id} style={{
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: borderRadius.card,
                padding: '16px',
                backgroundColor: colors.white,
                boxShadow: shadows.subtle,
                transition: 'box-shadow 0.3s ease'
              }}>
                {/* File Preview */}
                <div style={{
                  height: '120px',
                  backgroundColor: colors.lightGray,
                  borderRadius: '8px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {file.type.startsWith('image/') ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'cover' 
                      }}
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div style="display: flex; flex-direction: column; align-items: center; color: ${colors.black}">
                            <svg width="48" height="48" fill="${colors.orange}" viewBox="0 0 16 16">
                              <path d="M9.5 3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM4 3a4 4 0 0 1 4-4 4 4 0 0 1 4 4v.879l-2.5 2.5-2.5-2.5V3z"/>
                            </svg>
                            <div style="font-size: 12px; text-align: center; padding: 8px;">
                              Image Error
                            </div>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: colors.black
                    }}>
                      <Icons.File size={48} color={colors.orange} />
                      <div style={{
                        fontSize: '12px',
                        color: colors.black,
                        textAlign: 'center',
                        padding: '8px',
                        fontFamily: fonts.main,
                        fontWeight: fonts.subheadingWeight
                      }}>
                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </div>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    fontWeight: fonts.subheadingWeight, 
                    fontSize: '14px', 
                    marginBottom: '4px',
                    wordBreak: 'break-word',
                    color: colors.black,
                    fontFamily: fonts.main
                  }}>
                    {file.name}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: colors.black,
                    fontFamily: fonts.main,
                    fontWeight: fonts.bodyWeight
                  }}>
                    {formatFileSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Button 
                    onClick={() => copyToClipboard(file.url)}
                    size="small"
                  >
                    <Icons.Copy size={14} />
                    Copy URL
                  </Button>
                  <Button 
                    onClick={() => handleDelete(file)}
                    variant="danger"
                    size="small"
                  >
                    <Icons.Delete size={14} />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: colors.black,
            fontFamily: fonts.main,
            fontSize: '16px'
          }}>
            <Icons.Media size={48} color={colors.orange} style={{ marginBottom: '16px' }} />
            <Heading level={3} style={{ marginBottom: '8px' }}>
              No Media Files
            </Heading>
            <p style={{ 
              fontStyle: 'italic',
              color: colors.black,
              fontFamily: fonts.main,
              fontWeight: fonts.bodyWeight,
              margin: 0
            }}>
              Upload your first file using the area above!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MediaManager; 