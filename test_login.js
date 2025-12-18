const puppeteer = require('puppeteer');

async function testLogin() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set up console logging to capture any errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    console.log('Navigating to login page...');
    await page.goto('http://localhost:4201', { waitUntil: 'networkidle2' });
    
    // Wait for the login form to load
    await page.waitForSelector('input[formControlName="username"]', { timeout: 10000 });
    await page.waitForSelector('input[formControlName="password"]', { timeout: 10000 });
    
    console.log('Login form found. Filling credentials...');
    
    // Fill in the login form
    await page.type('input[formControlName="username"]', 'cypriankibet46@gmail.com');
    await page.type('input[formControlName="password"]', 'Cyprian123');
    
    console.log('Credentials entered. Clicking login button...');
    
    // Click the login button
    await page.click('button[type="button"]');
    
    // Wait for either success or error
    try {
      // Wait for success message or navigation
      await page.waitForFunction(
        () => {
          return window.location.pathname.includes('/app') || 
                 document.body.innerText.includes('Login successful') ||
                 document.body.innerText.includes('successful');
        },
        { timeout: 15000 }
      );
      
      console.log('Login appears to be successful!');
      console.log('Current URL:', page.url());
      
      // Check if we were redirected to the app
      if (page.url().includes('/app')) {
        console.log('✅ SUCCESS: User was redirected to /app after login');
      } else {
        console.log('✅ SUCCESS: Login completed successfully');
      }
      
    } catch (e) {
      // Check for error messages
      const errorText = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('.error, [class*="error"]');
        return Array.from(errorElements).map(el => el.textContent).join(' ');
      });
      
      if (errorText) {
        console.log('❌ ERROR: Login failed with error:', errorText);
      } else {
        console.log('❌ ERROR: Login did not complete within timeout');
      }
    }
    
  } catch (error) {
    console.log('❌ ERROR during test:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin();
