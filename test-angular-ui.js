#!/usr/bin/env node

/**
 * MbiuFun Angular UI Testing Script
 * Tests the Angular application like a real user would
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

class MbiuFunTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = [];
        this.baseUrl = 'http://localhost:4200';
    }

    async init() {
        console.log('🚀 Initializing MbiuFun UI Tester...');
        
        try {
            this.browser = await puppeteer.launch({
                headless: false, // Set to true for headless mode
                slowMo: 100,     // Slow down actions to see what's happening
                defaultViewport: { width: 1200, height: 800 },
                args: ['--no-sandbox', '--disable-setuid-sandbox'] // Fix sandbox issues
            });
            
            this.page = await this.browser.newPage();
            
            // Enable console logging from the page
            this.page.on('console', msg => {
                console.log('🌐 PAGE LOG:', msg.text());
            });
            
            // Listen for network requests
            this.page.on('response', response => {
                if (response.status() >= 400) {
                    console.log('❌ HTTP ERROR:', response.status(), response.url());
                }
            });
            
            console.log('✅ Browser initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize browser:', error.message);
            return false;
        }
    }

    async testAppLoad() {
        console.log('\n📱 Testing App Load...');
        
        try {
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0', timeout: 10000 });
            
            // Wait for Angular to bootstrap
            await this.page.waitForSelector('app-root', { timeout: 5000 });
            
            // Check if the page title is correct
            const title = await this.page.title();
            console.log('📄 Page title:', title);
            
            // Take a screenshot
            await this.page.screenshot({ path: '/home/cyprian/Desktop/mbiufun/screenshots/app-load.png', fullPage: true });
            
            // Check for Angular content
            const hasAngularContent = await this.page.evaluate(() => {
                const appRoot = document.querySelector('app-root');
                return appRoot && appRoot.innerHTML.length > 100;
            });
            
            if (hasAngularContent) {
                this.logResult('App Load', 'SUCCESS', 'Angular app loaded with content');
                return true;
            } else {
                this.logResult('App Load', 'FAILED', 'Angular app loaded but no content found');
                return false;
            }
            
        } catch (error) {
            this.logResult('App Load', 'ERROR', `Failed to load app: ${error.message}`);
            return false;
        }
    }

    async testTabSwitching() {
        console.log('\n🔄 Testing Tab Switching...');
        
        try {
            // Look for Sign Up and Sign In tabs
            await this.page.waitForSelector('a[href*="register"], a[routerLink*="register"]', { timeout: 5000 });
            await this.page.waitForSelector('a[href*="login"], a[routerLink*="login"]', { timeout: 5000 });
            
            // Click on Register tab
            console.log('🔄 Clicking Register tab...');
            await this.page.click('a[href*="register"], a[routerLink*="register"]');
            await this.page.waitForTimeout(1000);
            
            // Check if URL changed
            const registerUrl = this.page.url();
            console.log('🌐 Current URL after Register click:', registerUrl);
            
            // Take screenshot of register form
            await this.page.screenshot({ path: '/home/cyprian/Desktop/mbiufun/screenshots/register-form.png', fullPage: true });
            
            // Check for register form fields
            const hasRegisterFields = await this.page.evaluate(() => {
                const firstName = document.querySelector('input[formControlName="firstName"], input[name="firstName"]');
                const lastName = document.querySelector('input[formControlName="lastName"], input[name="lastName"]');
                const email = document.querySelector('input[formControlName="email"], input[name="email"], input[type="email"]');
                return firstName && lastName && email;
            });
            
            if (hasRegisterFields) {
                this.logResult('Register Tab', 'SUCCESS', 'Register form loaded with required fields');
            } else {
                this.logResult('Register Tab', 'FAILED', 'Register form missing required fields');
            }
            
            // Click on Login tab
            console.log('🔄 Clicking Login tab...');
            await this.page.click('a[href*="login"], a[routerLink*="login"]');
            await this.page.waitForTimeout(1000);
            
            // Check if URL changed
            const loginUrl = this.page.url();
            console.log('🌐 Current URL after Login click:', loginUrl);
            
            // Take screenshot of login form
            await this.page.screenshot({ path: '/home/cyprian/Desktop/mbiufun/screenshots/login-form.png', fullPage: true });
            
            // Check for login form fields
            const hasLoginFields = await this.page.evaluate(() => {
                const email = document.querySelector('input[formControlName="email"], input[name="email"], input[type="email"]');
                const password = document.querySelector('input[formControlName="password"], input[name="password"], input[type="password"]');
                return email && password;
            });
            
            if (hasLoginFields) {
                this.logResult('Login Tab', 'SUCCESS', 'Login form loaded with required fields');
            } else {
                this.logResult('Login Tab', 'FAILED', 'Login form missing required fields');
            }
            
            // Check if URLs are different (tab switching working)
            if (registerUrl !== loginUrl) {
                this.logResult('Tab Switching', 'SUCCESS', 'URL changes correctly when switching tabs');
                return true;
            } else {
                this.logResult('Tab Switching', 'FAILED', 'URL does not change when switching tabs');
                return false;
            }
            
        } catch (error) {
            this.logResult('Tab Switching', 'ERROR', `Tab switching test failed: ${error.message}`);
            return false;
        }
    }

    async testRegisterForm() {
        console.log('\n📝 Testing Register Form...');
        
        try {
            // Navigate to register page
            await this.page.goto(`${this.baseUrl}/register`, { waitUntil: 'networkidle0' });
            
            // Wait for form to load
            await this.page.waitForSelector('form, input[formControlName="firstName"], input[name="firstName"]', { timeout: 5000 });
            
            // Fill out the form
            console.log('📝 Filling out registration form...');
            
            const formData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'testPassword123',
                confirmPassword: 'testPassword123'
            };
            
            // Fill form fields
            for (const [field, value] of Object.entries(formData)) {
                const selector = `input[formControlName="${field}"], input[name="${field}"]`;
                const element = await this.page.$(selector);
                if (element) {
                    await element.clear();
                    await element.type(value);
                    console.log(`✅ Filled ${field}: ${value}`);
                } else {
                    console.log(`⚠️  Could not find field: ${field}`);
                }
            }
            
            // Check for terms and conditions checkbox
            const termsCheckbox = await this.page.$('input[formControlName="agreeToTerms"], input[type="checkbox"]');
            if (termsCheckbox) {
                await termsCheckbox.click();
                console.log('✅ Checked terms and conditions');
            }
            
            // Take screenshot of filled form
            await this.page.screenshot({ path: '/home/cyprian/Desktop/mbiufun/screenshots/form-filled.png', fullPage: true });
            
            // Check if submit button is enabled
            const submitButton = await this.page.$('button[type="submit"], button:contains("Sign up")');
            if (submitButton) {
                const isEnabled = await this.page.evaluate(btn => !btn.disabled, submitButton);
                if (isEnabled) {
                    this.logResult('Register Form', 'SUCCESS', 'Form validation working - submit button enabled');
                } else {
                    this.logResult('Register Form', 'FAILED', 'Submit button still disabled after filling form');
                }
            }
            
            return true;
            
        } catch (error) {
            this.logResult('Register Form', 'ERROR', `Form test failed: ${error.message}`);
            return false;
        }
    }

    async testFormValidation() {
        console.log('\n✅ Testing Form Validation...');
        
        try {
            await this.page.goto(`${this.baseUrl}/register`, { waitUntil: 'networkidle0' });
            
            // Test empty form submission
            const submitButton = await this.page.$('button[type="submit"], button:contains("Sign up")');
            if (submitButton) {
                const isDisabled = await this.page.evaluate(btn => btn.disabled, submitButton);
                if (isDisabled) {
                    this.logResult('Form Validation', 'SUCCESS', 'Submit button correctly disabled for empty form');
                } else {
                    this.logResult('Form Validation', 'WARNING', 'Submit button not disabled for empty form');
                }
            }
            
            // Test invalid email
            const emailField = await this.page.$('input[formControlName="email"], input[type="email"]');
            if (emailField) {
                await emailField.clear();
                await emailField.type('invalid-email');
                await this.page.waitForTimeout(500);
                
                // Check for validation error
                const hasError = await this.page.$('.error, .invalid, [class*="error"]');
                if (hasError) {
                    this.logResult('Form Validation', 'SUCCESS', 'Email validation error shown for invalid email');
                }
            }
            
            return true;
            
        } catch (error) {
            this.logResult('Form Validation', 'ERROR', `Validation test failed: ${error.message}`);
            return false;
        }
    }

    logResult(test, status, message) {
        const timestamp = new Date().toLocaleTimeString();
        const result = { test, status, message, timestamp };
        this.results.push(result);
        
        const statusEmoji = {
            'SUCCESS': '✅',
            'FAILED': '❌', 
            'ERROR': '💥',
            'WARNING': '⚠️'
        };
        
        console.log(`${statusEmoji[status] || '📝'} [${timestamp}] ${test}: ${message}`);
    }

    async generateReport() {
        console.log('\n📊 Generating Test Report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.length,
                success: this.results.filter(r => r.status === 'SUCCESS').length,
                failed: this.results.filter(r => r.status === 'FAILED').length,
                errors: this.results.filter(r => r.status === 'ERROR').length,
                warnings: this.results.filter(r => r.status === 'WARNING').length
            },
            results: this.results
        };
        
        const reportPath = '/home/cyprian/Desktop/mbiufun/test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`📄 Test report saved to: ${reportPath}`);
        console.log(`📊 Summary: ${report.summary.success}/${report.summary.total} tests passed`);
        
        return report;
    }

    async runAllTests() {
        console.log('🎯 Starting Complete UI Test Suite...\n');
        
        // Create screenshots directory
        const screenshotDir = '/home/cyprian/Desktop/mbiufun/screenshots';
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const tests = [
            () => this.testAppLoad(),
            () => this.testTabSwitching(),
            () => this.testRegisterForm(),
            () => this.testFormValidation()
        ];
        
        for (const test of tests) {
            try {
                await test();
                await this.page.waitForTimeout(1000); // Brief pause between tests
            } catch (error) {
                console.error('Test execution error:', error.message);
            }
        }
        
        await this.generateReport();
        console.log('\n🎉 All tests completed!');
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed');
        }
    }
}

// Main execution
async function main() {
    const tester = new MbiuFunTester();
    
    try {
        const initialized = await tester.init();
        if (!initialized) {
            console.error('❌ Failed to initialize tester');
            process.exit(1);
        }
        
        await tester.runAllTests();
        
    } catch (error) {
        console.error('💥 Test suite error:', error.message);
    } finally {
        await tester.cleanup();
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Test interrupted by user');
    process.exit(0);
});

if (require.main === module) {
    main().catch(console.error);
}

module.exports = MbiuFunTester;
