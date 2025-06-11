const puppeteer = require('puppeteer');

async function takeScreenshot() {
  console.log('Starting puppeteer...');
  
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Browser launched');
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport size for desktop view
    await page.setViewport({
      width: 1920,
      height: 1080
    });
    
    console.log('Navigating to http://127.0.0.1:7860...');
    
    // Navigate to the URL
    await page.goto('http://127.0.0.1:7860', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('Page loaded, waiting for content...');
    
    // Wait a bit for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const screenshotPath = `screenshot-${timestamp}.png`;
    
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`Screenshot saved as: ${screenshotPath}`);
    
    // Also take a viewport screenshot
    const viewportScreenshotPath = `screenshot-viewport-${timestamp}.png`;
    await page.screenshot({
      path: viewportScreenshotPath,
      fullPage: false
    });
    
    console.log(`Viewport screenshot saved as: ${viewportScreenshotPath}`);
    
    // Get page title and check for encoding issues
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // Check for character encoding
    const encoding = await page.evaluate(() => {
      return document.characterSet;
    });
    console.log(`Page encoding: ${encoding}`);
    
    // Look for any text content that might have encoding issues
    const textContent = await page.evaluate(() => {
      const texts = [];
      const elements = document.querySelectorAll('*');
      for (let elem of elements) {
        if (elem.childNodes.length === 1 && elem.childNodes[0].nodeType === 3) {
          const text = elem.textContent.trim();
          if (text && /[^\x00-\x7F]/.test(text)) {
            texts.push({
              tag: elem.tagName,
              text: text.substring(0, 100)
            });
          }
        }
      }
      return texts.slice(0, 10); // Return first 10 non-ASCII text elements
    });
    
    if (textContent.length > 0) {
      console.log('\nNon-ASCII text content found:');
      textContent.forEach(item => {
        console.log(`  ${item.tag}: ${item.text}`);
      });
    }
    
    await browser.close();
    console.log('\nScreenshot complete!');
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
    process.exit(1);
  }
}

takeScreenshot();