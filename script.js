require('dotenv').config(); // Load environment variables
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true if running on a server
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 50, // Slows down actions to mimic human behavior
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  try {
    console.log('🔄 Navigating to Naukri login...');
    await page.goto('https://www.naukri.com/mnjuser/homepage', { waitUntil: 'networkidle2' });

    // Wait for and click on the login button
    await page.waitForSelector('a[href*="login"], .nI-gNb-lg-rg__login', { timeout: 20000 });
    await page.evaluate(() => {
      const loginBtn = document.querySelector('a[href*="login"], .nI-gNb-lg-rg__login');
      if (loginBtn) loginBtn.click();
    });

    await page.waitForSelector('#usernameField', { timeout: 15000 });

    // Fill in credentials and login
    await page.type('#usernameField', process.env.NAUKRI_EMAIL, { delay: 50 });
    await page.type('#passwordField', process.env.NAUKRI_PASSWORD, { delay: 50 });
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ Logged into Naukri');

    // Navigate to Edit Profile section
    console.log('🔍 Opening Edit Profile...');
    await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'networkidle2' });

    // Wait for the key skills section to appear
    await page.waitForSelector('.widgetHead.typ-16Bold', { timeout: 15000 });

    // Check if "Key skills" section exists
    const keySkillsExists = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('.widgetHead.typ-16Bold'));
      return sections.some(section => section.innerText.includes('Key skills'));
    });

    if (!keySkillsExists) {
      console.log('⚠️ "Key skills" section not found. Exiting script.');
      await browser.close();
      return;
    }

    console.log('✅ "Key skills" section found.');

    // Click edit button for Key skills
    await page.waitForSelector('.widgetHead.typ-16Bold .edit.icon', { timeout: 15000 });
    await page.click('.widgetHead.typ-16Bold .edit.icon'); // Click edit button
    console.log('📝 Opened skill editor.');

    // Wait for skill chips to load
    await page.waitForSelector('.chip', { timeout: 10000 });

    await page.keyboard.press('Enter');

    // Save changes
    await page.keyboard.press('Enter');

    console.log('💾 Changes saved successfully!');

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await browser.close();
    console.log('🔒 Browser closed');
  }
})();