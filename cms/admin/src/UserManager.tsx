import React, { useState, useEffect } from 'react';
import { colors, fonts, borderRadius, shadows } from './brand';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'author';
  status: 'active' | 'inactive';
  last_login: string | null;
  created_at: string;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'author' as 'admin' | 'editor' | 'author',
    status: 'active' as 'active' | 'inactive'
  });

  const buttonStyle = {
    backgroundColor: colors.yellow,
    color: colors.black,
    border: `4px solid ${colors.orange}`,
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: fonts.main,
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block',
    margin: '4px'
  };

  const inputStyle = {
    fontSize: '18px',
    lineHeight: '26px',
    color: '#333',
    backgroundColor: '#f9f9f9',
    border: '1px solid #ccc',
    borderRadius: '25px',
    padding: '10px 20px',
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
    fontFamily: fonts.main,
    marginBottom: '16px'
  };

  useEffect(() => {
    // Mock data for now
    setUsers([
      {
        id: 1,
        username: 'admin@illumin8.ca',
        email: 'admin@illumin8.ca',
        role: 'admin',
        status: 'active',
        last_login: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: 'editor1',
        email: 'editor@example.com',
        role: 'editor',
        status: 'active',
        last_login: null,
        created_at: new Date().toISOString()
      }
    ]);
  }, []);

  const handleCreate = () => {
    const newUser: User = {
      id: Date.now(),
      username: formData.username,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      last_login: null,
      created_at: new Date().toISOString()
    };
    setUsers([...users, newUser]);
    setIsCreating(false);
    setFormData({ username: '', email: '', password: '', role: 'author', status: 'active' });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
  };

  const handleUpdate = () => {
    if (!editingUser) return;
    
    setUsers(users.map(user => 
      user.id === editingUser.id 
        ? { ...user, username: formData.username, email: formData.email, role: formData.role, status: formData.status }
        : user
    ));
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'author', status: 'active' });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', role: 'author', status: 'active' });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return { bg: '#e3f2fd', color: '#1565c0' };
      case 'editor': return { bg: '#f3e5f5', color: '#7b1fa2' };
      case 'author': return { bg: '#e8f5e8', color: '#2e7d32' };
      default: return { bg: '#f5f5f5', color: '#666' };
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? { bg: '#e8f5e8', color: '#2e7d32' }
      : { bg: '#ffebee', color: '#c62828' };
  };

  if (isCreating || editingUser) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '40px auto',
        background: colors.white,
        borderRadius: borderRadius.card,
        boxShadow: shadows.subtle,
        padding: '32px',
        fontFamily: fonts.main,
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: fonts.headingWeight, color: colors.black, marginBottom: '24px' }}>
          {editingUser ? 'Edit User' : 'Create New User'}
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: fonts.subheadingWeight }}>
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            style={inputStyle}
            placeholder="Enter username"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: fonts.subheadingWeight }}>
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={inputStyle}
            placeholder="user@example.com"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: fonts.subheadingWeight }}>
            {editingUser ? 'New Password (leave empty to keep current)' : 'Password'}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={inputStyle}
            placeholder={editingUser ? 'Leave empty to keep current password' : 'Enter password'}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: fonts.subheadingWeight }}>
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'editor' | 'author' })}
            style={inputStyle}
          >
            <option value="author">Author - Can create and edit own content</option>
            <option value="editor">Editor - Can edit all content</option>
            <option value="admin">Admin - Full system access</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: fonts.subheadingWeight }}>
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            style={inputStyle}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={editingUser ? handleUpdate : handleCreate} 
            style={buttonStyle}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </button>
          <button onClick={handleCancel} style={{
            ...buttonStyle,
            backgroundColor: '#f0f0f0',
            color: '#666',
            borderColor: '#ccc'
          }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '40px auto',
      background: colors.white,
      borderRadius: borderRadius.card,
      boxShadow: shadows.subtle,
      padding: '32px',
      fontFamily: fonts.main,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: fonts.headingWeight, color: colors.black, margin: 0 }}>
          User Management
        </h2>
        <button onClick={() => setIsCreating(true)} style={buttonStyle}>
          + Add New User
        </button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        {users.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No users found. Create your first user!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: fonts.subheadingWeight }}>User</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: fonts.subheadingWeight }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: fonts.subheadingWeight }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: fonts.subheadingWeight }}>Last Login</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: fonts.subheadingWeight }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roleBadge = getRoleBadgeColor(user.role);
                const statusBadge = getStatusBadgeColor(user.status);
                
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontWeight: fonts.subheadingWeight }}>{user.username}</div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: roleBadge.bg,
                        color: roleBadge.color,
                        textTransform: 'capitalize'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.color,
                        textTransform: 'capitalize'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => handleEdit(user)} style={{
                        ...buttonStyle,
                        padding: '4px 12px',
                        fontSize: '14px',
                        margin: '2px'
                      }}>
                        Edit
                      </button>
                      {user.role !== 'admin' && (
                        <button onClick={() => handleDelete(user.id)} style={{
                          ...buttonStyle,
                          padding: '4px 12px',
                          fontSize: '14px',
                          margin: '2px',
                          backgroundColor: '#ffebee',
                          color: '#c62828',
                          borderColor: '#f8bbd9'
                        }}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManager; 