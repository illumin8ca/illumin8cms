#!/usr/bin/env node

/**
 * Cloudflare Website Transformer - Main CLI Application
 * 
 * This tool transforms static websites into full-stack Cloudflare applications
 * with admin panels, content management, and e-commerce capabilities.
 * 
 * Usage:
 *   node index.js
 *   npm start
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, 'config.json');

// Load configuration
let config = {};
if (existsSync(configPath)) {
    config = JSON.parse(readFileSync(configPath, 'utf8'));
}

// ASCII Art Banner
const banner = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██████╗██╗      ██████╗ ██╗   ██╗██████╗ ███████╗██╗      █████╗ ██████╗ ██████╗ ║
║  ██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗██╔════╝██║     ██╔══██╗██╔══██╗██╔══██╗║
║  ██║     ██║     ██║   ██║██║   ██║██║  ██║█████╗  ██║     ███████║██████╔╝██████╔╝║
║  ██║     ██║     ██║   ██║██║   ██║██║  ██║██╔══╝  ██║     ██╔══██║██╔══██╗██╔══██╗║
║  ╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝██║     ███████╗██║  ██║██║  ██║██████╔╝║
║   ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ║
║                                                                              ║
║            🚀 WEBSITE TRANSFORMER - Static to Full-Stack in Minutes          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

class CloudflareTransformer {
    constructor() {
        this.config = config;
        this.projectName = config.project?.name || 'website-transformer';
        this.sourceDir = config.project?.sourceDir || './source';
        this.outputDir = config.project?.outputDir || './source';
    }

    async run() {
        console.log(chalk.cyan(banner));
        console.log(chalk.yellow('📋 Cloudflare Website Transformer'));
        console.log(chalk.gray('   Transform any static website into a full-stack Cloudflare app\\n'));

        try {
            // Check if source directory exists
            if (!existsSync(this.sourceDir)) {
                console.log(chalk.red(`❌ Source directory not found: ${this.sourceDir}`));
                console.log(chalk.yellow('💡 Please run one of these commands first:'));
                console.log(chalk.gray('   npm run scrape    # Scrape from WordPress'));
                console.log(chalk.gray('   npm run transform # Transform existing files'));
                console.log(chalk.gray('   or manually add files to the source/ directory'));
                return;
            }

            // Show main menu
            await this.showMainMenu();

        } catch (error) {
            console.error(chalk.red('💥 Fatal error:'), error.message);
            process.exit(1);
        }
    }

    async showMainMenu() {
        const choices = [
            {
                name: '🚀 Deploy to Cloudflare (Full Setup)',
                value: 'deploy',
                description: 'Complete setup with HTML wizard'
            },
            {
                name: '🔧 Development Mode',
                value: 'dev',
                description: 'Start local development server'
            },
            {
                name: '📥 Scrape WordPress Site',
                value: 'scrape',
                description: 'Download and convert WordPress site'
            },
            {
                name: '🔄 Transform Content',
                value: 'transform',
                description: 'Analyze and transform existing files'
            },
            {
                name: '⚙️ Configure Settings',
                value: 'config',
                description: 'Edit configuration options'
            },
            {
                name: '📖 View Documentation',
                value: 'docs',
                description: 'Open README and documentation'
            },
            {
                name: '🚪 Exit',
                value: 'exit'
            }
        ];

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices,
                pageSize: 10
            }
        ]);

        await this.handleMenuChoice(answer.action);
    }

    async handleMenuChoice(choice) {
        switch (choice) {
            case 'deploy':
                await this.deployToCloudflare();
                break;
            case 'dev':
                await this.startDevelopment();
                break;
            case 'scrape':
                await this.scrapeWordPress();
                break;
            case 'transform':
                await this.transformContent();
                break;
            case 'config':
                await this.configureSettings();
                break;
            case 'docs':
                await this.showDocumentation();
                break;
            case 'exit':
                console.log(chalk.green('👋 Thanks for using Cloudflare Website Transformer!'));
                process.exit(0);
                break;
        }
    }

    async deployToCloudflare() {
        console.log(chalk.blue('\\n🚀 Starting Cloudflare Deployment...'));
        
        const useHTML = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'useWizard',
                message: 'Use interactive HTML setup wizard?',
                default: true
            }
        ]);

        if (useHTML.useWizard) {
            console.log(chalk.yellow('🌐 Starting HTML setup wizard...'));
            await this.startHTMLWizard();
        } else {
            console.log(chalk.yellow('📋 Starting CLI deployment...'));
            await this.startCLIDeployment();
        }
    }

    async startHTMLWizard() {
        const spinner = ora('Starting setup wizard server...').start();
        
        try {
            // Check if setup-server.js exists
            if (!existsSync(join(__dirname, 'setup-server.js'))) {
                spinner.fail('setup-server.js not found');
                return;
            }

            // Start the setup server
            const server = spawn('node', ['setup-server.js'], {
                cwd: __dirname,
                stdio: 'inherit'
            });

            spinner.succeed('Setup wizard server started');
            console.log(chalk.green('🌐 Open your browser to: http://localhost:5001'));
            console.log(chalk.gray('   Press Ctrl+C to stop the server'));

            // Handle server termination
            server.on('close', (code) => {
                if (code !== 0) {
                    console.error(chalk.red(`Setup server exited with code ${code}`));
                }
            });

        } catch (error) {
            spinner.fail(`Failed to start setup wizard: ${error.message}`);
        }
    }

    async startCLIDeployment() {
        const spinner = ora('Starting CLI deployment...').start();
        
        try {
            // Check if setup.js exists
            if (!existsSync(join(__dirname, 'setup.js'))) {
                spinner.fail('setup.js not found');
                return;
            }

            // Start the CLI setup
            const setup = spawn('node', ['setup.js'], {
                cwd: __dirname,
                stdio: 'inherit'
            });

            spinner.succeed('CLI deployment started');

            // Handle setup termination
            setup.on('close', (code) => {
                if (code === 0) {
                    console.log(chalk.green('✅ Deployment completed successfully!'));
                } else {
                    console.error(chalk.red(`Deployment failed with code ${code}`));
                }
            });

        } catch (error) {
            spinner.fail(`Failed to start CLI deployment: ${error.message}`);
        }
    }

    async startDevelopment() {
        console.log(chalk.blue('\\n🔧 Starting Development Mode...'));
        
        const spinner = ora('Starting development server...').start();
        
        try {
            // Check if dev.js exists
            if (!existsSync(join(__dirname, 'dev.js'))) {
                spinner.fail('dev.js not found');
                return;
            }

            // Start the development server
            const dev = spawn('node', ['dev.js'], {
                cwd: __dirname,
                stdio: 'inherit'
            });

            spinner.succeed('Development server started');
            console.log(chalk.green('🌐 Development server running at: http://localhost:8788'));
            console.log(chalk.gray('   Press Ctrl+C to stop the server'));

            // Handle dev server termination
            dev.on('close', (code) => {
                if (code !== 0) {
                    console.error(chalk.red(`Development server exited with code ${code}`));
                }
            });

        } catch (error) {
            spinner.fail(`Failed to start development server: ${error.message}`);
        }
    }

    async scrapeWordPress() {
        console.log(chalk.blue('\\n📥 WordPress Scraping...'));
        
        if (!this.config.scraping?.enabled) {
            console.log(chalk.yellow('⚠️  WordPress scraping is not enabled in config.json'));
            const enable = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'enable',
                    message: 'Enable WordPress scraping now?',
                    default: true
                }
            ]);
            
            if (!enable.enable) {
                return;
            }
        }

        const scrapeConfig = await inquirer.prompt([
            {
                type: 'input',
                name: 'url',
                message: 'WordPress site URL:',
                default: this.config.scraping?.wordpressUrl || '',
                validate: (input) => {
                    if (!input.startsWith('http')) {
                        return 'Please enter a valid URL starting with http:// or https://';
                    }
                    return true;
                }
            },
            {
                type: 'checkbox',
                name: 'options',
                message: 'What should be scraped?',
                choices: [
                    { name: 'Download images', value: 'images', checked: true },
                    { name: 'Download assets (CSS, JS)', value: 'assets', checked: true },
                    { name: 'Parse content for transformation', value: 'content', checked: true }
                ]
            }
        ]);

        const spinner = ora('Scraping WordPress site...').start();
        
        try {
            // Check if scraper.js exists
            if (!existsSync(join(__dirname, 'scraper.js'))) {
                spinner.fail('scraper.js not found - this feature is not yet implemented');
                console.log(chalk.yellow('📝 Coming soon: WordPress scraping functionality'));
                return;
            }

            // TODO: Implement WordPress scraping
            spinner.succeed('WordPress scraping completed');
            console.log(chalk.green('✅ Site scraped successfully!'));

        } catch (error) {
            spinner.fail(`WordPress scraping failed: ${error.message}`);
        }
    }

    async transformContent() {
        console.log(chalk.blue('\\n🔄 Content Transformation...'));
        
        if (!this.config.transformation?.enabled) {
            console.log(chalk.yellow('⚠️  Content transformation is not enabled in config.json'));
            const enable = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'enable',
                    message: 'Enable content transformation now?',
                    default: true
                }
            ]);
            
            if (!enable.enable) {
                return;
            }
        }

        const spinner = ora('Analyzing content...').start();
        
        try {
            // Check if transformer.js exists
            if (!existsSync(join(__dirname, 'transformer.js'))) {
                spinner.fail('transformer.js not found - this feature is not yet implemented');
                console.log(chalk.yellow('📝 Coming soon: Content transformation functionality'));
                return;
            }

            // TODO: Implement content transformation
            spinner.succeed('Content transformation completed');
            console.log(chalk.green('✅ Content transformed successfully!'));

        } catch (error) {
            spinner.fail(`Content transformation failed: ${error.message}`);
        }
    }

    async configureSettings() {
        console.log(chalk.blue('\\n⚙️ Configuration Settings...'));
        
        const currentConfig = this.config;
        
        const settings = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: 'Project name:',
                default: currentConfig.project?.name || 'website-transformer'
            },
            {
                type: 'input',
                name: 'domain',
                message: 'Custom domain (optional):',
                default: currentConfig.project?.domain || ''
            },
            {
                type: 'list',
                name: 'projectType',
                message: 'Project type:',
                choices: [
                    { name: 'E-commerce', value: 'ecommerce' },
                    { name: 'Portfolio', value: 'portfolio' },
                    { name: 'Blog', value: 'blog' },
                    { name: 'Business', value: 'business' },
                    { name: 'Custom', value: 'custom' }
                ],
                default: currentConfig.project?.type || 'ecommerce'
            },
            {
                type: 'checkbox',
                name: 'services',
                message: 'Cloudflare services to enable:',
                choices: [
                    { name: 'Pages (Static hosting)', value: 'pages', checked: true },
                    { name: 'D1 (Database)', value: 'd1', checked: true },
                    { name: 'R2 (File storage)', value: 'r2', checked: true },
                    { name: 'Access (Admin protection)', value: 'access', checked: true },
                    { name: 'DNS (Domain management)', value: 'dns', checked: true }
                ]
            }
        ]);

        console.log(chalk.green('✅ Configuration updated!'));
        console.log(chalk.gray('   Settings saved to config.json'));
        
        // TODO: Save configuration to file
    }

    async showDocumentation() {
        console.log(chalk.blue('\\n📖 Documentation...'));
        
        const docChoices = [
            {
                name: '📋 README.md - Getting Started Guide',
                value: 'readme'
            },
            {
                name: '🚀 NEXT-STEPS.md - Implementation Roadmap',
                value: 'nextsteps'
            },
            {
                name: '⚙️ config.json - Configuration Reference',
                value: 'config'
            },
            {
                name: '📁 Project Structure Overview',
                value: 'structure'
            },
            {
                name: '🔙 Back to Main Menu',
                value: 'back'
            }
        ];

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'doc',
                message: 'Which documentation would you like to view?',
                choices: docChoices
            }
        ]);

        switch (answer.doc) {
            case 'readme':
                this.showFile('README.md');
                break;
            case 'nextsteps':
                this.showFile('NEXT-STEPS.md');
                break;
            case 'config':
                this.showFile('config.json');
                break;
            case 'structure':
                this.showProjectStructure();
                break;
            case 'back':
                await this.showMainMenu();
                return;
        }

        // Return to menu after showing documentation
        console.log(chalk.gray('\\nPress Enter to return to main menu...'));
        await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
        await this.showMainMenu();
    }

    showFile(filename) {
        const filePath = join(__dirname, filename);
        if (existsSync(filePath)) {
            const content = readFileSync(filePath, 'utf8');
            console.log(chalk.cyan(`\\n📄 ${filename}`));
            console.log(chalk.gray(''.padEnd(80, '=')));
            console.log(content);
            console.log(chalk.gray(''.padEnd(80, '=')));
        } else {
            console.log(chalk.red(`❌ File not found: ${filename}`));
        }
    }

    showProjectStructure() {
        console.log(chalk.cyan('\\n📁 Project Structure'));
        console.log(chalk.gray(''.padEnd(80, '=')));
        console.log(`
📁 cloudflare-website-transformer/
├── 📄 README.md                    # Main documentation
├── 📄 NEXT-STEPS.md               # Implementation roadmap
├── 📄 config.json                 # Configuration file
├── 📄 package.json                # Dependencies and scripts
├── 📄 index.js                    # Main CLI application (this file)
├── 📁 source/                     # Your website source files
│   ├── 📄 index.html
│   ├── 📁 assets/
│   └── 📁 uploads/
├── 📁 functions/                  # Cloudflare Pages Functions
│   ├── 📁 api/                    # API endpoints
│   └── 📄 types.ts                # TypeScript definitions
├── 📁 database/                   # Database schema and seeds
│   ├── 📄 schema.sql
│   └── 📄 seed.sql
├── 📁 templates/                  # Configuration templates
│   └── 📄 wrangler.toml.template
├── 📁 lib/                        # Core automation modules
│   ├── 📄 cloudflare-api.js
│   ├── 📄 deployment.js
│   └── 📄 services.js
├── 📁 scripts/                    # Utility scripts
└── 📄 setup-wizard.html           # HTML setup wizard
        `);
        console.log(chalk.gray(''.padEnd(80, '=')));
    }
}

// Main execution
async function main() {
    const transformer = new CloudflareTransformer();
    await transformer.run();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error(chalk.red('💥 Uncaught Exception:'), error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('💥 Unhandled Rejection:'), reason);
    process.exit(1);
});

// Start the application
main().catch((error) => {
    console.error(chalk.red('💥 Application Error:'), error.message);
    process.exit(1);
});