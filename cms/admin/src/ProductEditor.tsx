import React, { useState, useEffect } from 'react';
import { colors, fonts, borderRadius, shadows } from './brand';

interface Product {
  id?: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

const emptyProduct: Product = {
  title: '',
  slug: '',
  description: '',
  price: 0,
  image: '',
  stock: 0,
  category: '',
};

const ProductEditor: React.FC<{ productId?: number; onSave: () => void; onCancel: () => void }> = ({ productId, onSave, onCancel }) => {
  const [product, setProduct] = useState<Product>(emptyProduct);
  const [loading, setLoading] = useState(!!productId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      fetch(`/api/api/products/${productId}`)
        .then(res => res.json())
        .then(setProduct)
        .catch(() => setError('Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    const method = productId ? 'PUT' : 'POST';
    const url = productId ? `/api/api/products/${productId}` : '/api/api/products';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      setError('Failed to save product');
    } else {
      onSave();
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!productId) return;
    if (!window.confirm('Delete this product?')) return;
    setIsSaving(true);
    const res = await fetch(`/api/api/products/${productId}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Failed to delete product');
    } else {
      onSave();
    }
    setIsSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSave} style={{ maxWidth: 600, margin: '40px auto', background: colors.white, borderRadius: borderRadius.card, boxShadow: shadows.subtle, padding: 32, fontFamily: fonts.main }}>
      <h2 style={{ fontSize: 24, fontWeight: fonts.headingWeight, color: colors.black, marginBottom: 24 }}>{productId ? 'Edit Product' : 'Add Product'}</h2>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      <label style={{ fontWeight: fonts.subheadingWeight, display: 'block', marginBottom: 4 }}>Title</label>
      <input name="title" value={product.title} onChange={handleChange} required style={{ width: '100%', marginBottom: 16, ...inputStyle }} />
      <label style={{ fontWeight: fonts.subheadingWeight, display: 'block', marginBottom: 4 }}>Slug</label>
      <input name="slug" value={product.slug} onChange={handleChange} required style={{ width: '100%', marginBottom: 16, ...inputStyle }} />
      <label style={{ fontWeight: fonts.subheadingWeight, display: 'block', marginBottom: 4 }}>Description</label>
      <textarea name="description" value={product.description} onChange={handleChange} rows={4} style={{ width: '100%', marginBottom: 16, ...inputStyle }} />
      <label style={{ fontWeight: fonts.subheadingWeight, display: 'block', marginBottom: 4 }}>Price</label>
      <input name="price" type="number" value={product.price} onChange={handleChange} required min={0} step={0.01} style={{ width: '100%', marginBottom: 16, ...inputStyle }} />
      <label style={{ fontWeight: fonts.subheadingWeight, display: 'block', marginBottom: 4 }}>Image URL</label>
      <input name="image" value={product.image} onChange={handleChange} style={{ width: '100%', marginBottom: 16, ...inputStyle }} />
      <label style={{ fontWeight: fonts.subheadingWeight, display: 'block', marginBottom: 4 }}>Stock</label>
      <input name="stock" type="number" value={product.stock} onChange={handleChange} required min={0} style={{ width: '100%', marginBottom: 16, ...inputStyle }} />
      <label style={{ fontWeight: fonts.subheadingWeight, display: 'block', marginBottom: 4 }}>Category</label>
      <input name="category" value={product.category} onChange={handleChange} style={{ width: '100%', marginBottom: 24, ...inputStyle }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button type="submit" disabled={isSaving} style={{ background: colors.yellow, color: colors.black, border: `4px solid ${colors.orange}`, borderRadius: borderRadius.pill, fontWeight: 'bold', padding: '10px 32px', fontSize: 18, cursor: 'pointer' }}>{isSaving ? 'Saving...' : 'Save'}</button>
        {productId && <button type="button" onClick={handleDelete} disabled={isSaving} style={{ background: colors.orange, color: colors.white, border: 'none', borderRadius: borderRadius.pill, fontWeight: 'bold', padding: '10px 32px', fontSize: 18, cursor: 'pointer' }}>Delete</button>}
        <button type="button" onClick={onCancel} style={{ background: colors.lightGray, color: colors.black, border: 'none', borderRadius: borderRadius.pill, fontWeight: 'bold', padding: '10px 32px', fontSize: 18, cursor: 'pointer' }}>Cancel</button>
      </div>
    </form>
  );
};

const inputStyle = {
  fontSize: fonts.bodySize,
  lineHeight: fonts.bodyLineHeight,
  color: colors.inputText,
  background: colors.inputBg,
  border: `1px solid ${colors.inputBorder}`,
  borderRadius: borderRadius.pill,
  padding: '10px 20px',
  boxSizing: 'border-box' as const,
  outline: 'none',
  fontFamily: fonts.main,
};

export default ProductEditor; 