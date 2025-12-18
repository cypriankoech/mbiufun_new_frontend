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

    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('login') || request.url().includes('api')) {
        console.log('API REQUEST:', request.method(), request.url());
      }
    });

    page.on('response', response => {
      if (response.url().includes('login') || response.url().includes('api')) {
        console.log('API RESPONSE:', response.status(), response.url());
      }
    });

    console.log('Navigating to login page on port 4200...');
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });

    // Wait for the login form to load
    await page.waitForSelector('input[formControlName="username"]', { timeout: 10000 });
    await page.waitForSelector('input[formControlName="password"]', { timeout: 10000 });

    console.log('Login form found. Filling credentials...');

    // Fill in the login form
    await page.type('input[formControlName="username"]', 'cypriankibet46@gmail.com');
    await page.type('input[formControlName="password"]', 'Cyprian123');

    console.log('Credentials entered. Checking form validity...');

    // Check if the login button is enabled
    const buttonInfo = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[type="button"]'));
      const loginButton = buttons.find(btn => btn.textContent.includes('Sign in') || btn.textContent.includes('Signing in'));
      return loginButton ? {
        disabled: loginButton.disabled,
        text: loginButton.textContent.trim(),
        found: true
      } : { found: false };
    });

    console.log('Login button found:', buttonInfo.found, 'Disabled:', buttonInfo.disabled, 'Text:', buttonInfo.text);

    if (!buttonInfo.found) {
      console.log('❌ ERROR: Login button not found');
      return;
    }

    if (buttonInfo.disabled) {
      console.log('❌ ERROR: Login button is disabled - form validation failed');
      return;
    }

    console.log('Form appears valid. Clicking login button...');

    // Click the login button using page.evaluate
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[type="button"]'));
      const loginButton = buttons.find(btn => btn.textContent.includes('Sign in') || btn.textContent.includes('Signing in'));
      if (loginButton) {
        loginButton.click();
      }
    });

    // Wait a bit for the click to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if any API calls were made and button state
    const afterClickState = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[type="button"]'));
      const loginButton = buttons.find(btn => btn.textContent.includes('Sign in') || btn.textContent.includes('Signing in'));
      return {
        hasLoadingText: document.body.innerText.includes('Signing in'),
        buttonText: loginButton ? loginButton.textContent.trim() : 'not found',
        bodyText: document.body.innerText.substring(0, 200)
      };
    });

    console.log('After click - Loading state:', afterClickState.hasLoadingText, 'Button text:', afterClickState.buttonText);

    // Wait for either success or error
    try {
      // Wait for success message or navigation
      await page.waitForFunction(
        () => {
          return window.location.pathname.includes('/app') ||
                 document.body.innerText.includes('Login successful') ||
                 document.body.innerText.includes('successful') ||
                 document.body.innerText.includes('Welcome');
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
      console.log('Checking for error messages...');

      // Check for error messages in various places
      const pageContent = await page.evaluate(() => {
        return {
          bodyText: document.body.innerText,
          errorElements: Array.from(document.querySelectorAll('.error, [class*="error"], .text-red-500, .text-red')).map(el => el.textContent),
          successElements: Array.from(document.querySelectorAll('[class*="success"], .text-green')).map(el => el.textContent),
          url: window.location.href,
          pathname: window.location.pathname
        };
      });

      console.log('Current URL:', pageContent.url);
      console.log('Page content includes:', pageContent.bodyText.substring(0, 500));

      if (pageContent.errorElements.length > 0) {
        console.log('❌ ERROR: Login failed with error:', pageContent.errorElements.join(' '));
      } else if (pageContent.successElements.length > 0) {
        console.log('✅ SUCCESS: Found success message:', pageContent.successElements.join(' '));
      } else if (pageContent.pathname.includes('/app')) {
        console.log('✅ SUCCESS: User was redirected to /app after login');
      } else {
        console.log('❌ ERROR: Login did not complete. Current page content:', pageContent.bodyText.substring(0, 200));
      }
    }

  } catch (error) {
    console.log('❌ ERROR during test:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin();





