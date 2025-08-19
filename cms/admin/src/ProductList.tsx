import React, { useEffect, useState } from 'react';
import { colors, fonts, borderRadius, shadows } from './brand';
import { Button, Card, Heading } from './components/UIComponents';
import { Icons } from './components/Icons';

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  stock: number;
  category: string;
}

const ProductList: React.FC<{ onEdit: (id: number) => void; onAdd: () => void }> = ({ onEdit, onAdd }) => {
  const [products, setProducts] = useState<Product[]>([
    // Mock data for now
    { id: 1, title: 'Sample Product 1', slug: 'sample-product-1', price: 29.99, stock: 50, category: 'Electronics' },
    { id: 2, title: 'Sample Product 2', slug: 'sample-product-2', price: 49.99, stock: 25, category: 'Accessories' },
    { id: 3, title: 'Sample Product 3', slug: 'sample-product-3', price: 19.99, stock: 100, category: 'Software' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch('/api/api/products')
    //   .then(res => res.json())
    //   .then(setProducts)
    //   .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  return (
    <div style={{ 
      minWidth: '1080px',
      maxWidth: '1400px',
      margin: '40px auto', 
      padding: '32px',
      fontFamily: fonts.main 
    }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Heading level={2} style={{ margin: 0 }}>
            Products
          </Heading>
          <Button onClick={onAdd} size="large">
            <Icons.Add size={18} />
            Add Product
          </Button>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: colors.black,
            fontFamily: fonts.main 
          }}>
            Loading...
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: colors.black,
            fontStyle: 'italic',
            fontFamily: fonts.main,
            fontSize: '16px'
          }}>
            <Icons.Products size={48} color={colors.orange} style={{ marginBottom: '16px' }} />
            <div>No products found. Create your first product!</div>
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
                  fontFamily: fonts.main,
                  backgroundColor: 'transparent'
                }}>Title</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left',
                  fontWeight: fonts.subheadingWeight,
                  color: colors.black,
                  fontFamily: fonts.main,
                  backgroundColor: 'transparent'
                }}>Price</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left',
                  fontWeight: fonts.subheadingWeight,
                  color: colors.black,
                  fontFamily: fonts.main,
                  backgroundColor: 'transparent'
                }}>Stock</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left',
                  fontWeight: fonts.subheadingWeight,
                  color: colors.black,
                  fontFamily: fonts.main,
                  backgroundColor: 'transparent'
                }}>Category</th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left',
                  fontWeight: fonts.subheadingWeight,
                  color: colors.black,
                  fontFamily: fonts.main,
                  backgroundColor: 'transparent'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: `1px solid ${colors.lightGray}` }}>
                  <td style={{ 
                    padding: '12px',
                    color: colors.black,
                    fontFamily: fonts.main,
                    fontWeight: fonts.subheadingWeight
                  }}>{product.title}</td>
                  <td style={{ 
                    padding: '12px',
                    color: colors.black,
                    fontFamily: fonts.main,
                    fontWeight: fonts.bodyWeight
                  }}>${product.price.toFixed(2)}</td>
                  <td style={{ 
                    padding: '12px',
                    color: colors.black,
                    fontFamily: fonts.main,
                    fontWeight: fonts.bodyWeight
                  }}>{product.stock}</td>
                  <td style={{ 
                    padding: '12px',
                    color: colors.black,
                    fontFamily: fonts.main,
                    fontWeight: fonts.bodyWeight
                  }}>{product.category}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button onClick={() => onEdit(product.id)} size="small">
                        <Icons.Edit size={14} />
                        Edit
                      </Button>
                      <Button onClick={() => handleDelete(product.id)} variant="danger" size="small">
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
      </Card>
    </div>
  );
};

export default ProductList; 