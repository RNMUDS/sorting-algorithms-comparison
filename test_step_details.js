const puppeteer = require('puppeteer');

async function testStepDetails() {
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: false,
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

        // Wait for page to load
        await new Promise(r => setTimeout(r, 2000));

        // Check for 詳細ステップを表示 checkbox
        console.log('Looking for "詳細ステップを表示" checkbox...');
        const checkboxLabels = await page.$$('label');
        
        for (const label of checkboxLabels) {
            const text = await page.evaluate(el => el.textContent, label);
            if (text && text.includes('詳細ステップを表示')) {
                console.log('Found checkbox label, clicking it...');
                await label.click();
                break;
            }
        }

        // Click sort button
        console.log('Looking for "ソート実行" button...');
        const buttons = await page.$$('button, input[type="button"], input[type="submit"]');
        for (const button of buttons) {
            const text = await page.evaluate(el => el.textContent || el.value, button);
            if (text && text.includes('ソート実行')) {
                console.log('Found button, clicking...');
                await button.click();
                break;
            }
        }

        // Wait longer for detailed results
        console.log('Waiting for detailed results...');
        await new Promise(r => setTimeout(r, 8000));

        // Take screenshot
        await page.screenshot({
            path: 'detailed_results.png',
            fullPage: true
        });
        console.log('Detailed results screenshot saved');

        // Look for step details
        const stepDetails = await page.evaluate(() => {
            const elements = [];
            const allDivs = document.querySelectorAll('div');
            allDivs.forEach(div => {
                const text = div.innerText || '';
                if (text.includes('ステップ') || text.includes('Step')) {
                    elements.push({
                        text: text.substring(0, 200)
                    });
                }
            });
            return elements.slice(0, 5);
        });

        console.log('\nStep details found:');
        stepDetails.forEach(detail => {
            console.log(`- ${detail.text}`);
        });

        // Check for charts/graphs in the page
        const charts = await page.evaluate(() => {
            const plotlyDivs = document.querySelectorAll('.js-plotly-plot');
            const canvases = document.querySelectorAll('canvas');
            const svgs = document.querySelectorAll('svg');
            
            return {
                plotly: plotlyDivs.length,
                canvas: canvases.length,
                svg: svgs.length
            };
        });

        console.log('\nChart elements found:');
        console.log(`- Plotly divs: ${charts.plotly}`);
        console.log(`- Canvas elements: ${charts.canvas}`);
        console.log(`- SVG elements: ${charts.svg}`);

        // Try to capture plotly charts
        const plotlyDivs = await page.$$('.js-plotly-plot');
        for (let i = 0; i < plotlyDivs.length; i++) {
            const box = await plotlyDivs[i].boundingBox();
            if (box) {
                await page.screenshot({
                    path: `plotly_chart_${i + 1}.png`,
                    clip: {
                        x: box.x,
                        y: box.y,
                        width: box.width,
                        height: box.height
                    }
                });
                console.log(`Plotly chart ${i + 1} captured`);
            }
        }

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testStepDetails();