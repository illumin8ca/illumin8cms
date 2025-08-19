import React, { useState, useEffect } from 'react';
import { colors, fonts, borderRadius, shadows } from './brand';
import { Button, Card, Heading, Input, Textarea, FormGroup } from './components/UIComponents';
import { Icons } from './components/Icons';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

const PagesManager: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'draft' as 'draft' | 'published'
  });

  useEffect(() => {
    // Mock data for now
    setPages([
      {
        id: 1,
        title: 'Home Page',
        slug: 'home',
        content: 'Welcome to our website!',
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'About Us',
        slug: 'about',
        content: 'Learn more about our company...',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  }, []);

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      status: page.status
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editingPage) {
      // Update existing page
      setPages(pages.map(page => 
        page.id === editingPage.id 
          ? { ...page, ...formData, updated_at: new Date().toISOString() }
          : page
      ));
    } else {
      // Create new page
      const newPage: Page = {
        id: Date.now(),
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setPages([...pages, newPage]);
    }
    
    setIsEditing(false);
    setEditingPage(null);
    setFormData({ title: '', slug: '', content: '', status: 'draft' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingPage(null);
    setFormData({ title: '', slug: '', content: '', status: 'draft' });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this page?')) {
      setPages(pages.filter(page => page.id !== id));
    }
  };

  if (isEditing) {
    return (
      <div style={{
        minWidth: '1080px',
        maxWidth: '1400px',
        margin: '40px auto',
        padding: '32px',
        fontFamily: fonts.main,
      }}>
        <Card title={editingPage ? 'Edit Page' : 'Create New Page'}>
          <FormGroup label="Page Title" required>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter page title"
            />
          </FormGroup>

          <FormGroup label="URL Slug" required>
            <Input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="page-url-slug"
            />
          </FormGroup>

          <FormGroup label="Content" required>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter page content..."
              rows={8}
            />
          </FormGroup>

          <FormGroup label="Status">
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              style={{
                fontSize: '18px',
                lineHeight: '26px',
                color: colors.inputText,
                backgroundColor: colors.inputBg,
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: borderRadius.lg,
                padding: '10px 20px',
                width: '100%',
                boxSizing: 'border-box' as const,
                outline: 'none',
                fontFamily: fonts.main,
              }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </FormGroup>

          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <Button onClick={handleSave} size="large">
              <Icons.Save size={18} />
              {editingPage ? 'Update Page' : 'Create Page'}
            </Button>
            <Button onClick={handleCancel} variant="secondary" size="large">
              <Icons.Close size={18} />
              Cancel
            </Button>
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
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Heading level={2} style={{ margin: 0 }}>
            Pages Manager
          </Heading>
          <Button onClick={() => setIsEditing(true)} size="large">
            <Icons.Add size={18} />
            Create New Page
          </Button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          {pages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: colors.black,
              fontStyle: 'italic',
              fontFamily: fonts.main,
              fontSize: '16px'
            }}>
              <Icons.Pages size={48} color={colors.orange} style={{ marginBottom: '16px' }} />
              <div>No pages found. Create your first page!</div>
            </div>
          ) : (
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontFamily: fonts.main
            }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.lightGray}` }}>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    fontWeight: fonts.subheadingWeight,
                    color: colors.black,
                    fontFamily: fonts.main
                  }}>Title</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    fontWeight: fonts.subheadingWeight,
                    color: colors.black,
                    fontFamily: fonts.main
                  }}>Slug</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    fontWeight: fonts.subheadingWeight,
                    color: colors.black,
                    fontFamily: fonts.main
                  }}>Status</th>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    fontWeight: fonts.subheadingWeight,
                    color: colors.black,
                    fontFamily: fonts.main
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id} style={{ borderBottom: `1px solid ${colors.lightGray}` }}>
                    <td style={{ 
                      padding: '12px',
                      color: colors.black,
                      fontFamily: fonts.main,
                      fontWeight: fonts.subheadingWeight
                    }}>{page.title}</td>
                    <td style={{ 
                      padding: '12px', 
                      fontFamily: 'monospace', 
                      fontSize: '14px',
                      color: colors.black
                    }}>/{page.slug}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: fonts.subheadingWeight,
                        backgroundColor: page.status === 'published' ? '#e8f5e8' : '#fff3e0',
                        color: page.status === 'published' ? '#2e7d32' : '#f57c00'
                      }}>
                        {page.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button onClick={() => handleEdit(page)} size="small">
                          <Icons.Edit size={14} />
                          Edit
                        </Button>
                        <Button onClick={() => handleDelete(page.id)} variant="danger" size="small">
                          <Icons.Delete size={14} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PagesManager; 