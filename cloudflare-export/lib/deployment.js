/**
 * Deployment Manager
 * Handles the deployment process with wrangler CLI
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export class DeploymentManager {
  constructor(config) {
    this.config = config;
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
   * Execute command with proper environment
   */
  execCommand(command, env = {}) {
    const mergedEnv = { ...process.env, ...env };
    this.log(`Executing: ${command}`);
    
    try {
      const result = execSync(command, { 
        env: mergedEnv, 
        encoding: 'utf8',
        stdio: this.verbose ? 'inherit' : 'pipe'
      });
      return result;
    } catch (error) {
      this.log(`Command failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if wrangler is installed
   */
  checkWrangler() {
    try {
      const version = execSync('wrangler --version', { encoding: 'utf8' });
      this.log(`Wrangler version: ${version.trim()}`);
      return true;
    } catch (error) {
      throw new Error('Wrangler CLI not found. Please install it with: npm install -g wrangler');
    }
  }

  /**
   * Create D1 database and import schema
   */
  async createD1Database(apiToken, accountId) {
    const dbName = this.config.cloudflare.d1.databaseName;
    const schemaFile = this.config.cloudflare.d1.schemaFile;
    const seedFile = this.config.cloudflare.d1.seedFile;

    const env = {
      CLOUDFLARE_API_TOKEN: apiToken,
      CLOUDFLARE_ACCOUNT_ID: accountId
    };

    this.log(`Checking D1 database: ${dbName}`);

    try {
      // Check if database exists
      const listOutput = this.execCommand('wrangler d1 list', env);
      const dbExists = listOutput.includes(dbName);

      if (!dbExists) {
        this.log(`Creating D1 database: ${dbName}`);
        const createOutput = this.execCommand(`wrangler d1 create ${dbName}`, env);
        
        // Extract database ID
        const dbIdMatch = createOutput.match(/database_id\\s*=\\s*"([^"]+)"/);
        if (dbIdMatch) {
          const dbId = dbIdMatch[1];
          this.log(`Created D1 database with ID: ${dbId}`);
          
          // Update wrangler.toml if it exists
          const wranglerPath = './wrangler.toml';
          if (fs.existsSync(wranglerPath)) {
            this.updateWranglerConfig(wranglerPath, dbId);
          }
          
          return dbId;
        }
      } else {
        this.log(`D1 database ${dbName} already exists`);
      }

      // Import schema if file exists
      if (schemaFile && fs.existsSync(schemaFile)) {
        this.log(`Importing schema from: ${schemaFile}`);
        this.execCommand(`wrangler d1 execute ${dbName} --file ${schemaFile}`, env);
      }

      // Import seed data if file exists
      if (seedFile && fs.existsSync(seedFile)) {
        this.log(`Importing seed data from: ${seedFile}`);
        this.execCommand(`wrangler d1 execute ${dbName} --file ${seedFile}`, env);
      }

    } catch (error) {
      this.log(`D1 database operation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update wrangler.toml with database ID
   */
  updateWranglerConfig(wranglerPath, dbId) {
    try {
      let config = fs.readFileSync(wranglerPath, 'utf-8');
      config = config.replace(/database_id\\s*=\\s*"[^"]*"/g, `database_id = "${dbId}"`);
      fs.writeFileSync(wranglerPath, config);
      this.log(`Updated wrangler.toml with database ID: ${dbId}`);
    } catch (error) {
      this.log(`Failed to update wrangler.toml: ${error.message}`);
    }
  }

  /**
   * Deploy to Cloudflare Pages
   */
  async deployToPages(apiToken, accountId) {
    const projectName = this.config.project.name;
    const sourceDir = this.config.project.outputDir;
    const productionBranch = this.config.project.productionBranch;

    const env = {
      CLOUDFLARE_API_TOKEN: apiToken,
      CLOUDFLARE_ACCOUNT_ID: accountId
    };

    this.log(`Deploying to Pages project: ${projectName}`);

    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Source directory not found: ${sourceDir}`);
    }

    // Check if project exists
    let isNewProject = false;
    try {
      const listOutput = this.execCommand('wrangler pages project list', env);
      const projectExists = listOutput.includes(projectName);
      isNewProject = !projectExists;
      this.log(`Project ${projectName} exists: ${projectExists}`);
    } catch (error) {
      this.log(`Could not list projects, assuming new deployment: ${error.message}`);
      isNewProject = true;
    }

    // Create project if it doesn't exist
    if (isNewProject) {
      this.log(`Creating new Pages project: ${projectName}`);
      try {
        this.execCommand(`wrangler pages project create ${projectName} --production-branch=${productionBranch}`, env);
      } catch (error) {
        this.log(`Project creation failed, may already exist: ${error.message}`);
      }
    }

    // Deploy the project
    this.log(`Deploying files from: ${sourceDir}`);
    const deployCommand = `wrangler pages deploy ${sourceDir} --project-name ${projectName} --branch=${productionBranch} --commit-dirty=true --commit-message="Automated deploy"`;
    this.execCommand(deployCommand, env);

    return {
      projectName,
      isNewProject,
      url: `https://${projectName}.pages.dev`
    };
  }

  /**
   * Create wrangler.toml file for the project
   */
  createWranglerConfig() {
    const wranglerConfig = {
      name: this.config.project.name,
      compatibility_date: new Date().toISOString().split('T')[0],
      pages_build_output_dir: this.config.project.outputDir
    };

    // Add D1 database configuration
    if (this.config.cloudflare.services.d1) {
      wranglerConfig.d1_databases = [{
        binding: 'DB',
        database_name: this.config.cloudflare.d1.databaseName,
        database_id: 'PLACEHOLDER_DATABASE_ID'
      }];
    }

    // Add R2 bucket configuration
    if (this.config.cloudflare.services.r2) {
      wranglerConfig.r2_buckets = [{
        binding: 'R2',
        bucket_name: this.config.cloudflare.r2.bucketName,
        preview_bucket_name: this.config.cloudflare.r2.bucketName
      }];
    }

    // Add environment variables
    wranglerConfig.vars = {
      NODE_ENV: 'production'
    };

    // Generate TOML content
    const tomlContent = this.generateTomlContent(wranglerConfig);
    fs.writeFileSync('./wrangler.toml', tomlContent);
    this.log('Created wrangler.toml configuration file');
  }

  /**
   * Generate TOML content from config object
   */
  generateTomlContent(config) {
    let toml = `name = "${config.name}"\\n`;
    toml += `compatibility_date = "${config.compatibility_date}"\\n`;
    toml += `pages_build_output_dir = "${config.pages_build_output_dir}"\\n\\n`;

    if (config.d1_databases) {
      toml += '[[d1_databases]]\\n';
      toml += `binding = "${config.d1_databases[0].binding}"\\n`;
      toml += `database_name = "${config.d1_databases[0].database_name}"\\n`;
      toml += `database_id = "${config.d1_databases[0].database_id}"\\n\\n`;
    }

    if (config.r2_buckets) {
      toml += '[[r2_buckets]]\\n';
      toml += `binding = "${config.r2_buckets[0].binding}"\\n`;
      toml += `bucket_name = "${config.r2_buckets[0].bucket_name}"\\n`;
      toml += `preview_bucket_name = "${config.r2_buckets[0].preview_bucket_name}"\\n\\n`;
    }

    if (config.vars) {
      toml += '[vars]\\n';
      for (const [key, value] of Object.entries(config.vars)) {
        toml += `${key} = "${value}"\\n`;
      }
    }

    return toml;
  }

  /**
   * Validate source directory
   */
  validateSourceDirectory() {
    const sourceDir = this.config.project.sourceDir;
    
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Source directory not found: ${sourceDir}`);
    }

    // Check for index.html
    const indexPath = path.join(sourceDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error(`index.html not found in source directory: ${sourceDir}`);
    }

    this.log(`Source directory validated: ${sourceDir}`);
    return true;
  }

  /**
   * Copy source files to output directory if different
   */
  prepareOutputDirectory() {
    const sourceDir = this.config.project.sourceDir;
    const outputDir = this.config.project.outputDir;

    if (sourceDir !== outputDir) {
      this.log(`Copying files from ${sourceDir} to ${outputDir}`);
      // Simple copy implementation - in production, use a proper copy library
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true });
      }
      fs.mkdirSync(outputDir, { recursive: true });
      this.copyDirectory(sourceDir, outputDir);
    }
  }

  /**
   * Simple recursive directory copy
   */
  copyDirectory(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}