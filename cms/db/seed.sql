-- Scenic Valley Quilts - Initial Seed Data
-- Run after schema.sql with: wrangler d1 execute scenic-valley-quilts --file ./db/seed.sql

-- Admin User (password: admin123 - change this in production!)
INSERT OR IGNORE INTO users (username, email, password_hash, role, first_name, last_name, is_active)
VALUES ('admin', 'admin@scenicvalleyquilts.com', '$2a$10$JwrFcGWGG1bYOHt9B6Jnr.vxGMQVLJK.qTnRbvEiAjL1MzPQR5Lx2', 'admin', 'Rejeanne', 'Quilter', 1);

-- Site Settings
INSERT OR IGNORE INTO site_settings (key, value, type, group_name, description)
VALUES 
('site_name', 'Scenic Valley Quilts', 'text', 'general', 'Website name'),
('site_description', 'Handcrafted quilts made with love in the scenic valley', 'textarea', 'general', 'Website description'),
('contact_email', 'info@scenicvalleyquilts.com', 'email', 'contact', 'Primary contact email'),
('phone_number', '(555) 123-4567', 'text', 'contact', 'Business phone number'),
('address', '123 Quilting Lane, Scenic Valley, CA 12345', 'textarea', 'contact', 'Business address'),
('facebook_url', 'https://facebook.com/scenicvalleyquilts', 'url', 'social', 'Facebook page URL'),
('instagram_url', 'https://instagram.com/scenicvalleyquilts', 'url', 'social', 'Instagram profile URL'),
('shipping_domestic_rate', '15.00', 'number', 'shipping', 'Standard domestic shipping rate'),
('shipping_international_rate', '35.00', 'number', 'shipping', 'Standard international shipping rate'),
('tax_rate', '7.25', 'number', 'tax', 'Sales tax percentage');

-- Product Categories
INSERT OR IGNORE INTO product_categories (name, slug, description, featured_image, is_active)
VALUES 
('Quilts', 'quilts', 'Beautiful handcrafted quilts for your home', '/uploads/products/quilts-category.jpg', 1),
('Throws', 'throws', 'Cozy throws for your living space', '/uploads/products/throws-category.jpg', 1),
('Baby Quilts', 'baby-quilts', 'Soft and adorable quilts for babies', '/uploads/products/baby-quilts-category.jpg', 1);

-- Products
INSERT OR IGNORE INTO products (
  title, 
  slug, 
  description, 
  short_description, 
  price, 
  sale_price, 
  sku, 
  stock_quantity, 
  featured_image, 
  category_id, 
  is_featured, 
  is_active
)
VALUES 
(
  'Midnight Stars Quilt', 
  'midnight-stars-quilt', 
  'This beautiful queen-sized quilt features a stunning midnight blue background with intricate star patterns that seem to twinkle in the light. Each star is carefully pieced using traditional techniques, creating a timeless design that will become a family heirloom.\n\nHandcrafted with 100% cotton fabric and batting, this quilt offers both warmth and beauty. The detailed quilting enhances the star pattern while providing durability that will last for generations.',
  'A stunning queen-sized quilt with intricate star patterns on a midnight blue background.',
  299.99,
  NULL,
  'MSQ-001',
  5,
  '/uploads/products/midnight-stars-quilt.png',
  1,
  1,
  1
),
(
  'Prairie Sunset Quilt',
  'prairie-sunset-quilt',
  'The Prairie Sunset Quilt captures the warm golden hues of a countryside sunset. This king-sized masterpiece features a gradual color transition from deep amber to soft yellow, reminiscent of the sun setting over prairie fields.\n\nEach block is carefully arranged to create a stunning visual effect that brings warmth to any bedroom. Made with premium cotton fabrics and filled with high-quality batting, this quilt provides perfect weight and warmth year-round.',
  'A king-sized quilt with warm sunset colors perfect for your master bedroom.',
  399.99,
  349.99,
  'PSQ-002',
  3,
  '/uploads/products/prairie-sunset-quilt.png',
  1,
  1,
  1
),
(
  'Country Garden Throw',
  'country-garden-throw',
  'Bring the beauty of a country garden into your home with this charming throw. Featuring appliquéd flowers and vines on a soft cream background, this throw adds a touch of rustic elegance to any room.\n\nPerfect for draping over a sofa or chair, this medium-weight throw provides just the right amount of warmth for cool evenings. The detailed floral quilting adds texture and visual interest.',
  'A charming throw with appliquéd flowers and vines on a cream background.',
  149.99,
  NULL,
  'CGT-003',
  8,
  '/uploads/products/country-garden-throw.png',
  2,
  0,
  1
),
(
  'Rustic Valley King Quilt',
  'rustic-valley-king',
  'The Rustic Valley King Quilt brings the serene beauty of mountain landscapes into your bedroom. This oversized king quilt features a stunning landscape design with mountains, valleys, and forests in rich earth tones.\n\nCrafted using a combination of piecing and appliqué techniques, this quilt showcases exceptional artistry and attention to detail. The generous size provides ample coverage for king-sized beds with enough overhang for a perfect drape.',
  'An oversized king quilt featuring a stunning landscape design in earth tones.',
  499.99,
  449.99,
  'RVK-004',
  2,
  '/uploads/products/rustic-valley-king.png',
  1,
  1,
  1
);

-- Pages
INSERT OR IGNORE INTO pages (title, slug, content, status, meta_title, meta_description)
VALUES 
('Home', 'home', '{"hero":{"title":"Handcrafted Quilts","subtitle":"Made with love in the scenic valley","cta":"Shop Now"},"featured":{"title":"Featured Quilts","description":"Each quilt tells a story through fabric and thread"}}', 'published', 'Scenic Valley Quilts - Handcrafted Quilts and Throws', 'Discover beautiful handcrafted quilts made with love in the scenic valley. Each piece tells a story through fabric and thread.'),
('About', 'about', '{"title":"About Rejeanne","content":"Rejeanne has been quilting for over 30 years, creating beautiful handcrafted pieces that combine traditional techniques with modern designs.","image":"/uploads/about/rejeanne-with-baby.png"}', 'published', 'About Rejeanne - Scenic Valley Quilts', 'Learn about Rejeanne, the artisan behind Scenic Valley Quilts with over 30 years of quilting experience.'),
('Contact', 'contact', '{"title":"Get in Touch","content":"Have questions about a specific quilt or interested in a custom piece? Fill out the form below and I''ll get back to you as soon as possible."}', 'published', 'Contact Us - Scenic Valley Quilts', 'Get in touch with Scenic Valley Quilts for questions about our products or to request custom quilts.'); 