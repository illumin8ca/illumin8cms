/**
 * Cloudflare API Wrapper
 * Handles all Cloudflare API interactions with proper error handling
 */

import fetch from 'node-fetch';

export class CloudflareAPI {
  constructor(email, globalKey, accountId) {
    this.email = email;
    this.globalKey = globalKey;
    this.accountId = accountId;
    this.baseUrl = 'https://api.cloudflare.com/client/v4';
  }

  /**
   * Get headers for API requests
   */
  getHeaders(apiToken = null) {
    if (apiToken) {
      return {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'X-Auth-Email': this.email,
      'X-Auth-Key': this.globalKey,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make API request with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(options.apiToken);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`API Error: ${result.errors?.[0]?.message || 'Unknown error'}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Cloudflare API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  /**
   * Get all accounts for the authenticated user
   */
  async getAccounts() {
    let accounts = [];
    let page = 1;
    let totalPages = 1;
    
    do {
      const result = await this.request(`/accounts?per_page=50&page=${page}&order=name&direction=asc`);
      accounts = accounts.concat(result.result.map(acc => ({ id: acc.id, name: acc.name })));
      
      if (result.result_info && result.result_info.total_pages) {
        totalPages = result.result_info.total_pages;
      } else {
        break;
      }
      page++;
    } while (page <= totalPages);
    
    return accounts;
  }

  /**
   * Get zones (domains) for the account
   */
  async getZones() {
    let zones = [];
    let page = 1;
    let totalPages = 1;
    
    do {
      const result = await this.request(`/zones?account.id=${this.accountId}&per_page=50&page=${page}&order=name&direction=asc`);
      zones = zones.concat(result.result.map(zone => ({ id: zone.id, name: zone.name })));
      
      if (result.result_info && result.result_info.total_pages) {
        totalPages = result.result_info.total_pages;
      } else {
        break;
      }
      page++;
    } while (page <= totalPages);
    
    return zones;
  }

  /**
   * Get permission groups for token creation
   */
  async getPermissionGroups() {
    const result = await this.request('/user/tokens/permission_groups');
    return result.result;
  }

  /**
   * Create a scoped API token
   */
  async createScopedToken(permissions) {
    // Get user ID for user-scoped permissions
    const userResult = await this.request('/user');
    const userId = userResult.result.id;

    // Get permission groups
    const permissionGroups = await this.getPermissionGroups();
    
    // Build permission group IDs
    const accountPermissionGroups = [];
    const userPermissionGroups = [];
    
    for (const permission of permissions) {
      const group = permissionGroups.find(p => 
        p.name === permission && p.scopes.includes('com.cloudflare.api.account')
      );
      if (group) {
        accountPermissionGroups.push({ id: group.id });
      }
      
      const userGroup = permissionGroups.find(p => 
        p.name === permission && p.scopes.includes('com.cloudflare.api.user')
      );
      if (userGroup) {
        userPermissionGroups.push({ id: userGroup.id });
      }
    }

    const policies = [];
    
    if (accountPermissionGroups.length > 0) {
      policies.push({
        effect: 'allow',
        resources: {
          [`com.cloudflare.api.account.${this.accountId}`]: '*'
        },
        permission_groups: accountPermissionGroups
      });
    }
    
    if (userPermissionGroups.length > 0) {
      policies.push({
        effect: 'allow',
        resources: {
          [`com.cloudflare.api.user.${userId}`]: '*'
        },
        permission_groups: userPermissionGroups
      });
    }

    const tokenPayload = {
      name: `Cloudflare Launcher Token - ${new Date().toISOString().split('T')[0]}`,
      policies: policies
    };

    const result = await this.request('/user/tokens', {
      method: 'POST',
      body: JSON.stringify(tokenPayload)
    });

    return {
      token: result.result.value,
      tokenId: result.result.id
    };
  }

  /**
   * Revoke an API token
   */
  async revokeToken(tokenId, apiToken) {
    await this.request(`/user/tokens/${tokenId}`, {
      method: 'DELETE',
      apiToken: apiToken
    });
  }

  /**
   * Check if R2 is enabled
   */
  async isR2Enabled() {
    try {
      const result = await this.request(`/accounts/${this.accountId}/r2/buckets`);
      return result.success;
    } catch (error) {
      if (error.message.includes('enable R2')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Create R2 bucket
   */
  async createR2Bucket(bucketName, apiToken) {
    const result = await this.request(`/accounts/${this.accountId}/r2/buckets`, {
      method: 'POST',
      apiToken: apiToken,
      body: JSON.stringify({ name: bucketName })
    });
    return result.result;
  }

  /**
   * List R2 buckets
   */
  async listR2Buckets(apiToken) {
    const result = await this.request(`/accounts/${this.accountId}/r2/buckets`, {
      apiToken: apiToken
    });
    return result.result.buckets || [];
  }

  /**
   * Add custom domain to Pages project
   */
  async addCustomDomain(projectName, domain, apiToken) {
    const result = await this.request(`/accounts/${this.accountId}/pages/projects/${projectName}/domains`, {
      method: 'POST',
      apiToken: apiToken,
      body: JSON.stringify({ name: domain })
    });
    return result.result;
  }

  /**
   * Create or update DNS record
   */
  async updateDNSRecord(zoneName, recordName, target, apiToken) {
    // Find zone ID
    const zonesResult = await this.request(`/zones?name=${zoneName}`, { apiToken });
    if (!zonesResult.result.length) {
      throw new Error(`Zone ${zoneName} not found`);
    }
    const zoneId = zonesResult.result[0].id;

    // Check for existing record
    const listResult = await this.request(`/zones/${zoneId}/dns_records?name=${recordName}`, {
      apiToken: apiToken
    });

    const recordData = {
      type: 'CNAME',
      name: recordName,
      content: target,
      ttl: 3600,
      proxied: true
    };

    if (listResult.result.length > 0) {
      // Update existing record
      const existingRecord = listResult.result[0];
      const result = await this.request(`/zones/${zoneId}/dns_records/${existingRecord.id}`, {
        method: 'PUT',
        apiToken: apiToken,
        body: JSON.stringify(recordData)
      });
      return result.result;
    } else {
      // Create new record
      const result = await this.request(`/zones/${zoneId}/dns_records`, {
        method: 'POST',
        apiToken: apiToken,
        body: JSON.stringify(recordData)
      });
      return result.result;
    }
  }

  /**
   * Configure Cloudflare Access
   */
  async configureAccess(adminPath, adminEmails, domain, apiToken) {
    // Get existing apps
    const appsResult = await this.request(`/accounts/${this.accountId}/access/apps`, {
      apiToken: apiToken
    });

    let app = appsResult.result.find(a => a.domain === `${domain}${adminPath}`);

    if (!app) {
      // Create new app
      const createResult = await this.request(`/accounts/${this.accountId}/access/apps`, {
        method: 'POST',
        apiToken: apiToken,
        body: JSON.stringify({
          name: 'Admin Access',
          domain: `${domain}${adminPath}`,
          session_duration: '720h',
          type: 'self_hosted'
        })
      });
      app = createResult.result;
    }

    // Configure policy
    const policiesResult = await this.request(`/accounts/${this.accountId}/access/apps/${app.id}/policies`, {
      apiToken: apiToken
    });

    const ownersPolicy = policiesResult.result.find(p => p.name === 'Admin Policy');

    if (!ownersPolicy) {
      await this.request(`/accounts/${this.accountId}/access/apps/${app.id}/policies`, {
        method: 'POST',
        apiToken: apiToken,
        body: JSON.stringify({
          name: 'Admin Policy',
          decision: 'allow',
          include: [{ email: adminEmails }]
        })
      });
    } else {
      await this.request(`/accounts/${this.accountId}/access/apps/${app.id}/policies/${ownersPolicy.id}`, {
        method: 'PUT',
        apiToken: apiToken,
        body: JSON.stringify({
          ...ownersPolicy,
          include: [{ email: adminEmails }]
        })
      });
    }

    return app;
  }
}