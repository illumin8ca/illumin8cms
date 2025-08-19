# Cloudflare Website Transformer

An automated Node.js tool that transforms static websites (HTML/CSS/JS) into full-stack Cloudflare applications with admin panels, content management, and e-commerce capabilities.

## 🚀 What This Tool Does

This tool takes any static website and automatically:

1. **Scrapes WordPress sites** (optional) - Downloads all pages, images, and assets
2. **Analyzes content** - Detects images, text, headings, paragraphs, buttons, forms
3. **Generates admin panel** - Creates a backend admin interface for content editing
4. **Creates APIs** - Builds REST APIs for all detected content
5. **Deploys to Cloudflare** - Automatically sets up Pages, D1, R2, and DNS

## 📁 Project Structure

```
cloudflare-website-transformer/
├── source/                     # Your static website files (auto-generated or manual)
│   ├── index.html
│   ├── assets/
│   ├── uploads/
│   └── ...
├── functions/                  # Cloudflare Pages Functions (API endpoints)
│   ├── api/
│   │   ├── products.ts         # Product management
│   │   ├── contact.ts          # Contact form handling
│   │   ├── admin/              # Admin panel APIs
│   │   └── ...
│   └── types.ts
├── database/                   # Database schema and seed data
│   ├── schema.sql              # D1 database schema
│   └── seed.sql                # Initial data
├── templates/                  # Configuration templates
│   └── wrangler.toml.template  # Cloudflare configuration
├── lib/                        # Core automation modules
│   ├── cloudflare-api.js       # Cloudflare API wrapper
│   ├── deployment.js           # Deployment automation
│   └── services.js             # Service configuration
├── config.json                 # Main configuration
├── index.js                    # Main entry point
├── scraper.js                  # WordPress scraping tool
├── transformer.js              # Content transformation tool
├── setup.js                    # Setup wizard
└── README.md                   # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- Cloudflare account
- (Optional) WordPress site to scrape

### Quick Start

1. **Clone/Download this project**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Choose your source method:**

   **Option A: Scrape WordPress Site**
   ```bash
   npm run scrape
   # Follow prompts to enter WordPress URL and scrape settings
   ```

   **Option B: Use Existing Static Files**
   ```bash
   # Place your HTML/CSS/JS files in the source/ directory
   cp -r /path/to/your/website/* ./source/
   ```

4. **Transform the website:**
   ```bash
   npm run transform
   # Analyzes content and generates admin panel + APIs
   ```

5. **Deploy to Cloudflare:**
   ```bash
   npm start
   # Follow interactive setup wizard
   ```

## 🔧 Configuration

Edit `config.json` to customize the transformation:

### Project Settings
```json
{
  "project": {
    "name": "your-website",
    "domain": "yoursite.com",
    "description": "Your website description",
    "type": "ecommerce"  // or "portfolio", "blog", "business"
  }
}
```

### Scraping Settings
```json
{
  "scraping": {
    "enabled": true,
    "wordpressUrl": "https://yoursite.com",
    "targetPages": ["/", "/about", "/contact", "/products"],
    "downloadImages": true,
    "downloadAssets": true,
    "parseContent": true
  }
}
```

### Transformation Settings
```json
{
  "transformation": {
    "enabled": true,
    "detectImages": true,
    "detectText": true,
    "detectHeadings": true,
    "detectParagraphs": true,
    "detectButtons": true,
    "detectForms": true,
    "createAdminPanel": true,
    "generateAPI": true,
    "preserveLayout": true
  }
}
```

### Cloudflare Services
```json
{
  "cloudflare": {
    "services": {
      "pages": true,     // Static hosting
      "d1": true,        // Database
      "r2": true,        // File storage  
      "access": true,    // Admin protection
      "dns": true        // Domain management
    }
  }
}
```

## 📋 Detailed Usage

### Step 1: WordPress Scraping (Optional)

```bash
npm run scrape
```

**What it does:**
- Scrapes specified WordPress pages
- Downloads all images and assets
- Analyzes page structure and content
- Saves everything to `source/` directory
- Creates content mapping for transformation

**Interactive prompts:**
- WordPress site URL
- Pages to scrape
- Download preferences
- Authentication (if required)

### Step 2: Content Transformation

```bash
npm run transform
```

**What it does:**
- Analyzes HTML structure in `source/`
- Detects editable content (text, images, headings)
- Generates database schema for content
- Creates admin panel components
- Builds API endpoints for content management
- Preserves original layout and styling

**Content Detection:**
- **Images**: Converts to database-managed with upload capabilities
- **Text**: Creates editable text fields in admin
- **Headings**: Generates editable heading management
- **Paragraphs**: Enables rich text editing
- **Buttons**: Makes button text and links editable
- **Forms**: Adds form submission handling and storage

### Step 3: Deployment

```bash
npm start
```

**What it does:**
- Authenticates with Cloudflare
- Creates/configures D1 database
- Sets up R2 storage bucket
- Deploys Pages application
- Configures DNS (if enabled)
- Sets up Cloudflare Access for admin
- Provides deployment summary and URLs

## 🎯 Features

### Automatic Content Detection
- **Smart HTML Analysis**: Detects semantic content automatically
- **Image Management**: Converts images to database-managed with upload
- **Text Editing**: Makes all text content editable via admin panel
- **Form Processing**: Handles form submissions and stores data
- **SEO Optimization**: Generates meta tags and structured data

### Admin Panel Features
- **Content Management**: Edit all text, images, and content
- **File Upload**: Manage images and documents via R2 storage
- **Form Submissions**: View and manage form submissions
- **E-commerce**: Product management, orders, inventory (if enabled)
- **Analytics**: Basic site analytics and metrics
- **User Management**: Admin user management and permissions

### E-commerce Integration (Optional)
- **Product Management**: Add/edit products with images and descriptions
- **Shopping Cart**: Automatic cart functionality
- **Stripe Integration**: Payment processing
- **Inventory Tracking**: Stock management
- **Order Management**: Process and track orders
- **Customer Management**: Customer accounts and data

### Cloudflare Integration
- **Pages**: Static site hosting with edge caching
- **D1 Database**: Serverless SQLite for content and data
- **R2 Storage**: Object storage for images and files
- **Access**: Admin panel protection and authentication
- **DNS**: Automatic domain configuration
- **Workers**: API endpoints running on the edge

## 🔐 Security

- **Admin Authentication**: JWT-based authentication for admin panel
- **Cloudflare Access**: Additional layer of protection for admin areas
- **Input Validation**: All API endpoints validate input data
- **Content Security**: Secure file upload and content management
- **Environment Secrets**: Secure storage of API keys and secrets

## 📊 Performance

- **Edge Hosting**: Served from 200+ Cloudflare locations worldwide
- **Instant Loading**: Zero cold start with Pages Functions
- **Optimized Assets**: Automatic minification and compression
- **CDN Caching**: Global content delivery network
- **Database Performance**: D1 provides fast SQLite performance

## 🎨 Customization

### Modifying the Admin Panel
- Edit components in `functions/admin/`
- Customize styling in admin CSS files
- Add new features to the admin API endpoints

### Extending Content Detection
- Modify `transformer.js` to detect new content types
- Add new database tables in `database/schema.sql`
- Create corresponding API endpoints

### Adding New Features
- Create new API endpoints in `functions/api/`
- Add database tables for new features
- Extend admin panel with new management interfaces

## 🚨 Troubleshooting

### Common Issues
1. **Scraping fails**: Check WordPress URL and permissions
2. **Transformation errors**: Ensure source files are valid HTML
3. **Deployment issues**: Verify Cloudflare authentication
4. **Database errors**: Check D1 database configuration
5. **File upload issues**: Verify R2 bucket permissions

### Debug Mode
```bash
DEBUG=true npm start
```

### Logs
- Check `debug.log` for detailed operation logs
- Use `wrangler tail` for live function logs
- Monitor Cloudflare dashboard for service status

## 📈 Next Steps

After successful deployment, you can:

1. **Access your site**: `https://your-domain.com`
2. **Admin panel**: `https://your-domain.com/admin`
3. **API endpoints**: `https://your-domain.com/api/`
4. **Database**: Manage via Cloudflare dashboard or API
5. **File storage**: Upload and manage files via admin panel

## 🤝 Contributing

This tool is designed to be extended and customized. Feel free to:
- Add new content detection algorithms
- Improve the admin panel UI
- Add new Cloudflare service integrations
- Enhance e-commerce features
- Add new website type templates

## 📄 License

MIT License - Feel free to use and modify for your projects.

---

**Built with ❤️ by Illumin8 Digital Marketing**