const { chromium } = require('playwright');

function timestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 800 });
  const page = await browser.newPage();
  const ts = timestamp();

  try {
    await page.goto('https://test.netlify.app/');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully');

    // Name
    await page.waitForSelector('#name', { state: 'visible' });
    await page.fill('#name', 'Nir Kaplan');
    const nameValue = await page.inputValue('#name');
    console.log(`✅ Name field filled: "${nameValue}"`);

    // Email
    await page.waitForSelector('#email', { state: 'visible' });
    await page.fill('#email', 'kaplanir24@gmail.com');
    const emailValue = await page.inputValue('#email');
    console.log(`✅ Email field filled: "${emailValue}"`);

    // Phone
    await page.waitForSelector('#phone', { state: 'visible' });
    await page.fill('#phone', '+972501234567');
    const phoneValue = await page.inputValue('#phone');
    console.log(`✅ Phone field filled: "${phoneValue}"`);

    // Company
    await page.waitForSelector('#company', { state: 'visible' });
    await page.fill('#company', 'Jones Test Co.');
    const companyValue = await page.inputValue('#company');
    console.log(`✅ Company field filled: "${companyValue}"`);

    // Website
    await page.waitForSelector('#website', { state: 'visible' });
    await page.fill('#website', 'https://www.jones-test.com');
    const websiteValue = await page.inputValue('#website');
    console.log(`✅ Website field filled: "${websiteValue}"`);

    // Bonus: Change Number of Employees from 1-10 to 51-500
    await page.waitForSelector('#employees', { state: 'visible' });
    await page.selectOption('#employees', '51-500');
    const employeesValue = await page.inputValue('#employees');
    console.log(`✅ BONUS: Number of Employees changed to "${employeesValue}"`);

    // Screenshot before submit
    const beforePath = `screenshot_before_submit_${ts}.png`;
    await page.screenshot({ path: beforePath, fullPage: true });
    console.log(`📸 Screenshot saved: ${beforePath}`);

    // Click submit button
    await page.waitForSelector('button:has-text("Request")', { state: 'visible' });
    await page.click('button:has-text("Request")');
    console.log('✅ Clicked "Request a call back" button');

    // Wait for Thank You page
    await page.waitForLoadState('networkidle');

    const pageContent = await page.textContent('body');
    if (/thank you/i.test(pageContent)) {
      console.log('🎉 SUCCESS: Reached the Thank You page!');
    } else {
      console.log('⚠️  Page after submit does not appear to be a Thank You page. Current URL:', page.url());
    }

  } catch (error) {
    console.error('❌ Automation error:', error.message);
    await page.screenshot({ path: `screenshot_error_${ts}.png`, fullPage: true });
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
})();
