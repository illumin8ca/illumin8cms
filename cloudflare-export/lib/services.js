/**
 * Services Manager
 * Handles configuration and setup of Cloudflare services
 */

import { CloudflareAPI } from './cloudflare-api.js';

export class ServicesManager {
  constructor(config, cloudflareAPI) {
    this.config = config;
    this.api = cloudflareAPI;
    this.verbose = config.deployment?.verbose || false;
  }

  /**
   * Log message if verbose mode is enabled
   */
  log(message) {
    if (this.verbose) {
      console.log(`[${new Date().toISOString()}] ${message}`);
    }
  }

  /**
   * Create required API token with proper permissions
   */
  async createDeploymentToken() {
    const permissions = [
      'Pages Write',
      'Pages Read',
      'Workers Scripts Write',
      'DNS Write',
      'Account Settings Read',
      'User Details Read',
      'Memberships Read'
    ];

    // Add additional permissions based on enabled services
    if (this.config.cloudflare.services.r2) {
      permissions.push('Workers R2 Storage Write', 'Workers R2 Storage Read');
    }

    if (this.config.cloudflare.services.d1) {
      permissions.push('Workers D1 Database Write');
    }

    if (this.config.cloudflare.services.access) {
      permissions.push('Access: Apps and Policies Write', 'Access: Apps and Policies Read');
    }

    this.log(`Creating API token with permissions: ${permissions.join(', ')}`);
    
    try {
      const tokenResult = await this.api.createScopedToken(permissions);
      this.log('API token created successfully');
      return tokenResult;
    } catch (error) {
      this.log(`Failed to create API token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup R2 storage bucket
   */
  async setupR2Storage(apiToken) {
    if (!this.config.cloudflare.services.r2) {
      return null;
    }

    const bucketName = this.config.cloudflare.r2.bucketName;
    this.log(`Setting up R2 storage bucket: ${bucketName}`);

    try {
      // Check if R2 is enabled
      const isEnabled = await this.api.isR2Enabled();
      if (!isEnabled) {
        throw new Error('R2 Storage is not enabled. Please enable it in your Cloudflare dashboard.');
      }

      // List existing buckets
      const buckets = await this.api.listR2Buckets(apiToken);
      const bucketExists = buckets.some(b => b.name === bucketName);

      if (!bucketExists) {
        this.log(`Creating R2 bucket: ${bucketName}`);
        await this.api.createR2Bucket(bucketName, apiToken);
        this.log(`R2 bucket created successfully: ${bucketName}`);
      } else {
        this.log(`R2 bucket already exists: ${bucketName}`);
      }

      return { bucketName, created: !bucketExists };
    } catch (error) {
      this.log(`R2 setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup custom domain and DNS
   */
  async setupCustomDomain(projectName, apiToken) {
    const domain = this.config.project.domain;
    if (!domain || !this.config.cloudflare.services.dns) {
      return null;
    }

    this.log(`Setting up custom domain: ${domain}`);

    try {
      // Add custom domain to Pages project
      await this.api.addCustomDomain(projectName, domain, apiToken);
      this.log(`Added custom domain to Pages project: ${domain}`);

      // Add www subdomain
      const wwwDomain = `www.${domain}`;
      await this.api.addCustomDomain(projectName, wwwDomain, apiToken);
      this.log(`Added www subdomain to Pages project: ${wwwDomain}`);

      // Create DNS records
      const target = `${projectName}.pages.dev`;
      await this.api.updateDNSRecord(domain, wwwDomain, target, apiToken);
      this.log(`Created DNS CNAME record: ${wwwDomain} -> ${target}`);

      return {
        domain,
        wwwDomain,
        target,
        message: 'Custom domain configured. Please manually configure the root domain if needed.'
      };
    } catch (error) {
      this.log(`Custom domain setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup Cloudflare Access protection
   */
  async setupCloudflareAccess(apiToken) {
    if (!this.config.cloudflare.services.access) {
      return null;
    }

    const domain = this.config.project.domain;
    const adminPath = this.config.cloudflare.access.adminPath;
    const adminEmails = this.config.cloudflare.access.adminEmails;

    if (!domain || !adminEmails.length) {
      this.log('Skipping Cloudflare Access setup - missing domain or admin emails');
      return null;
    }

    this.log(`Setting up Cloudflare Access for: ${domain}${adminPath}`);

    try {
      const app = await this.api.configureAccess(adminPath, adminEmails, domain, apiToken);
      this.log(`Cloudflare Access configured successfully for: ${domain}${adminPath}`);
      
      return {
        appId: app.id,
        domain: `${domain}${adminPath}`,
        adminEmails
      };
    } catch (error) {
      this.log(`Cloudflare Access setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get service status
   */
  async getServiceStatus(apiToken) {
    const status = {
      pages: false,
      d1: false,
      r2: false,
      access: false,
      dns: false
    };

    try {
      // Check R2 status
      if (this.config.cloudflare.services.r2) {
        status.r2 = await this.api.isR2Enabled();
      }

      // Other services are assumed to be available if we can create tokens
      status.pages = true;
      status.d1 = this.config.cloudflare.services.d1;
      status.access = this.config.cloudflare.services.access;
      status.dns = this.config.cloudflare.services.dns;

    } catch (error) {
      this.log(`Service status check failed: ${error.message}`);
    }

    return status;
  }

  /**
   * Validate service configuration
   */
  validateConfiguration() {
    const errors = [];

    // Validate project configuration
    if (!this.config.project.name) {
      errors.push('Project name is required');
    }

    if (!this.config.project.sourceDir) {
      errors.push('Source directory is required');
    }

    // Validate D1 configuration
    if (this.config.cloudflare.services.d1) {
      if (!this.config.cloudflare.d1.databaseName) {
        errors.push('D1 database name is required when D1 is enabled');
      }
    }

    // Validate R2 configuration
    if (this.config.cloudflare.services.r2) {
      if (!this.config.cloudflare.r2.bucketName) {
        errors.push('R2 bucket name is required when R2 is enabled');
      }
    }

    // Validate Access configuration
    if (this.config.cloudflare.services.access) {
      if (!this.config.project.domain) {
        errors.push('Domain is required for Cloudflare Access');
      }
      if (!this.config.cloudflare.access.adminEmails.length) {
        errors.push('Admin emails are required for Cloudflare Access');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\\n${errors.join('\\n')}`);
    }

    this.log('Configuration validation passed');
    return true;
  }

  /**
   * Cleanup resources (revoke tokens, etc.)
   */
  async cleanup(tokenId, apiToken) {
    if (this.config.deployment?.autoCleanup && tokenId && apiToken) {
      try {
        this.log(`Revoking API token: ${tokenId}`);
        await this.api.revokeToken(tokenId, apiToken);
        this.log('API token revoked successfully');
      } catch (error) {
        this.log(`Failed to revoke API token: ${error.message}`);
      }
    }
  }
}