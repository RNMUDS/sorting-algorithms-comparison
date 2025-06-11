const puppeteer = require('puppeteer');

async function captureGraph() {
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: false, // Set to false to see the browser
            defaultViewport: {
                width: 1280,
                height: 800
            }
        });

        const page = await browser.newPage();
        
        console.log('Navigating to http://127.0.0.1:7860...');
        await page.goto('http://127.0.0.1:7860', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for the page to fully load
        await new Promise(r => setTimeout(r, 2000));

        // Look for the "ソート実行" button
        console.log('Looking for "ソート実行" button...');
        
        // Try to find the button by checking all buttons and inputs
        const sortButton = await page.evaluateHandle(() => {
            const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
            for (const button of buttons) {
                const text = button.textContent || button.value || '';
                if (text.includes('ソート実行')) {
                    return button;
                }
            }
            return null;
        });

        if (!sortButton || await sortButton.evaluate(el => !el)) {
            throw new Error('Could not find "ソート実行" button');
        }

        console.log('Found "ソート実行" button, clicking...');
        await sortButton.click();
        
        console.log('Button clicked! Waiting for graph to appear...');
        
        // Wait for graph elements to appear
        // Try multiple selectors that might contain the graph
        const graphSelectors = [
            'canvas',
            'svg',
            '.plotly',
            '.plot-container',
            '.js-plotly-plot',
            '[id*="plotly"]',
            '.chart',
            '.graph',
            '#chart',
            '#graph'
        ];

        let graphElement = null;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!graphElement && attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 1000)); // Wait 1 second between attempts
            
            for (const selector of graphSelectors) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        const isVisible = await element.evaluate(el => {
                            const rect = el.getBoundingClientRect();
                            return rect.width > 0 && rect.height > 0;
                        });
                        
                        if (isVisible) {
                            console.log(`Found visible graph element with selector: ${selector}`);
                            graphElement = element;
                            break;
                        }
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
            
            attempts++;
            if (!graphElement) {
                console.log(`Attempt ${attempts}/${maxAttempts}: Graph not found yet, waiting...`);
            }
        }

        // Take screenshot with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const screenshotPath = `graph_screenshot_${timestamp}.png`;
        
        if (graphElement) {
            // Take screenshot of the specific graph element
            const box = await graphElement.boundingBox();
            if (box) {
                await page.screenshot({
                    path: screenshotPath,
                    clip: {
                        x: box.x - 10, // Add some padding
                        y: box.y - 10,
                        width: box.width + 20,
                        height: box.height + 20
                    }
                });
                console.log(`\nGraph screenshot saved as: ${screenshotPath}`);
                console.log(`Graph dimensions: ${box.width}x${box.height}`);
            }
        } else {
            // If no specific graph element found, take full page screenshot
            console.log('No specific graph element found, taking full page screenshot...');
            await page.screenshot({
                path: screenshotPath,
                fullPage: true
            });
            console.log(`\nFull page screenshot saved as: ${screenshotPath}`);
        }

        // Also check for any results table
        const tables = await page.$$('table');
        if (tables.length > 0) {
            console.log(`\nFound ${tables.length} table(s) on the page`);
            const tableScreenshotPath = `table_results_${timestamp}.png`;
            const firstTable = tables[0];
            const tableBox = await firstTable.boundingBox();
            if (tableBox) {
                await page.screenshot({
                    path: tableScreenshotPath,
                    clip: {
                        x: tableBox.x - 10,
                        y: tableBox.y - 10,
                        width: tableBox.width + 20,
                        height: tableBox.height + 20
                    }
                });
                console.log(`Table screenshot saved as: ${tableScreenshotPath}`);
            }
        }

        // Return the screenshot path
        return screenshotPath;

    } catch (error) {
        console.error('Error occurred:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the capture
captureGraph()
    .then(path => {
        console.log(`\n✅ Successfully captured graph screenshot: ${path}`);
        console.log(`Full path: ${__dirname}/${path}`);
    })
    .catch(err => {
        console.error('\n❌ Failed to capture graph:', err.message);
    });