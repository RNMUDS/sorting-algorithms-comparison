const puppeteer = require('puppeteer');

async function testSortingApp() {
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

        // Take initial screenshot
        await page.screenshot({
            path: 'initial_page.png',
            fullPage: true
        });
        console.log('Initial screenshot saved as initial_page.png');

        // Wait for the page to fully load
        await new Promise(r => setTimeout(r, 2000));

        // Look for the "ソート実行" button
        console.log('Looking for "ソート実行" button...');
        
        // Try multiple selectors for the button
        const buttonSelectors = [
            'button:has-text("ソート実行")',
            'button[value="ソート実行"]',
            'input[type="button"][value="ソート実行"]',
            'input[type="submit"][value="ソート実行"]',
            '//button[contains(text(), "ソート実行")]',
            '//*[contains(text(), "ソート実行")]'
        ];

        let buttonFound = false;
        for (const selector of buttonSelectors) {
            try {
                if (selector.startsWith('//')) {
                    // XPath selector
                    const elements = await page.$x(selector);
                    if (elements.length > 0) {
                        console.log(`Found button with XPath: ${selector}`);
                        await elements[0].click();
                        buttonFound = true;
                        break;
                    }
                } else {
                    // CSS selector
                    const element = await page.$(selector);
                    if (element) {
                        console.log(`Found button with selector: ${selector}`);
                        await element.click();
                        buttonFound = true;
                        break;
                    }
                }
            } catch (e) {
                // Continue to next selector
            }
        }

        if (!buttonFound) {
            // If not found, try to find any button containing the text
            const buttons = await page.$$('button, input[type="button"], input[type="submit"]');
            for (const button of buttons) {
                const text = await page.evaluate(el => el.textContent || el.value, button);
                if (text && text.includes('ソート実行')) {
                    console.log('Found button by text content');
                    await button.click();
                    buttonFound = true;
                    break;
                }
            }
        }

        if (!buttonFound) {
            console.log('Warning: Could not find "ソート実行" button. Taking screenshot of current page...');
            await page.screenshot({
                path: 'no_button_found.png',
                fullPage: true
            });
        } else {
            console.log('Button clicked! Waiting for results...');
            
            // Wait for the graph to appear
            await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds for processing
            
            // Take screenshot after clicking
            await page.screenshot({
                path: 'after_click.png',
                fullPage: true
            });
            console.log('Screenshot after clicking saved as after_click.png');

            // Look for graph elements
            const graphSelectors = [
                'canvas',
                'svg',
                '.chart',
                '.graph',
                '#chart',
                '#graph',
                '[class*="chart"]',
                '[class*="graph"]',
                '[id*="chart"]',
                '[id*="graph"]'
            ];

            let graphFound = false;
            for (const selector of graphSelectors) {
                const element = await page.$(selector);
                if (element) {
                    console.log(`Found graph element with selector: ${selector}`);
                    const box = await element.boundingBox();
                    if (box) {
                        await page.screenshot({
                            path: `graph_${selector.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
                            clip: {
                                x: box.x,
                                y: box.y,
                                width: box.width,
                                height: box.height
                            }
                        });
                        console.log(`Graph screenshot saved`);
                        graphFound = true;
                    }
                }
            }

            if (!graphFound) {
                console.log('No specific graph element found, taking full page screenshot');
            }

            // Check for Japanese text and potential mojibake
            console.log('\nChecking for Japanese text...');
            const pageText = await page.evaluate(() => document.body.innerText);
            
            // Look for common Japanese characters
            const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(pageText);
            const hasMojibake = /[ï¿½âœ"]/.test(pageText); // Common mojibake patterns
            
            console.log('Has Japanese text:', hasJapanese);
            console.log('Has potential mojibake:', hasMojibake);
            
            // Look for specific elements with Japanese text
            const japaneseElements = await page.evaluate(() => {
                const elements = [];
                const allElements = document.querySelectorAll('*');
                allElements.forEach(el => {
                    const text = el.innerText || el.textContent || '';
                    if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(text)) {
                        elements.push({
                            tag: el.tagName,
                            text: text.substring(0, 100),
                            className: el.className
                        });
                    }
                });
                return elements.slice(0, 10); // Return first 10 elements
            });
            
            console.log('\nJapanese text elements found:');
            japaneseElements.forEach(el => {
                console.log(`- ${el.tag}${el.className ? '.' + el.className : ''}: "${el.text}"`);
            });

            // Check for tables
            const tables = await page.$$('table');
            console.log(`\nFound ${tables.length} table(s)`);
            
            if (tables.length > 0) {
                for (let i = 0; i < tables.length; i++) {
                    const box = await tables[i].boundingBox();
                    if (box) {
                        await page.screenshot({
                            path: `table_${i + 1}.png`,
                            clip: {
                                x: box.x,
                                y: box.y,
                                width: box.width,
                                height: box.height
                            }
                        });
                        console.log(`Table ${i + 1} screenshot saved`);
                    }
                }
            }
        }

        // Final full page screenshot
        await page.screenshot({
            path: 'final_page.png',
            fullPage: true
        });
        console.log('\nFinal screenshot saved as final_page.png');

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testSortingApp();