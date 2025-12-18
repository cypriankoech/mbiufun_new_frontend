const puppeteer = require('puppeteer');

async function testEnhancedLogin() {
  const browser = await puppeteer.launch({
    headless: false, // Show browser for visual confirmation
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 100 // Add delay to see animations
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Set up console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    console.log('🚀 Testing Enhanced Mbiufun Login UI...');
    await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });

    // Wait for the enhanced auth layout to load
    await page.waitForSelector('.glass', { timeout: 10000 });
    console.log('✅ Enhanced auth layout loaded successfully');

    // Test the login tab
    await page.click('a[routerLink="/login"]');
    await page.waitForTimeout(1000);

    // Check if we can see the enhanced login form
    await page.waitForSelector('input[formControlName="username"]', { timeout: 5000 });
    await page.waitForSelector('input[formControlName="password"]', { timeout: 5000 });
    console.log('✅ Enhanced login form found');

    // Test the demo credentials button
    const demoButton = await page.$('button:has-text("Use demo credentials")');
    if (demoButton) {
      await demoButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Demo credentials button works');
    }

    // Fill in credentials manually if demo button didn't work
    await page.type('input[formControlName="username"]', 'cypriankibet46@gmail.com');
    await page.type('input[formControlName="password"]', 'Cyprian123');
    console.log('✅ Credentials entered');

    // Submit the form
    await page.click('button[type="submit"]');
    console.log('✅ Login form submitted');

    // Wait for result
    await page.waitForTimeout(5000);

    // Take a screenshot for verification
    await page.screenshot({ path: '/tmp/enhanced-login-test.png' });
    console.log('📸 Screenshot saved');

    console.log('🎉 Enhanced login UI test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testEnhancedLogin();





