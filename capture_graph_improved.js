const puppeteer = require('puppeteer');

async function captureGraphImproved() {
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

        // Wait for the page to fully load
        await new Promise(r => setTimeout(r, 3000));

        // Look for the "ソート実行" button
        console.log('Looking for "ソート実行" button...');
        
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
        
        console.log('Button clicked! Waiting for processing to complete...');
        
        // Wait longer for the graph to be fully rendered
        await new Promise(r => setTimeout(r, 8000)); // Wait 8 seconds
        
        // Take a full page screenshot first
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const fullPagePath = `full_page_${timestamp}.png`;
        await page.screenshot({
            path: fullPagePath,
            fullPage: true
        });
        console.log(`Full page screenshot saved as: ${fullPagePath}`);
        
        // Look for Plotly graphs specifically
        console.log('\nSearching for Plotly graphs...');
        const plotlyGraphs = await page.evaluate(() => {
            const graphs = [];
            
            // Check for Plotly divs
            const plotlyDivs = document.querySelectorAll('.plotly, .js-plotly-plot, [id*="plotly"]');
            plotlyDivs.forEach(div => {
                const rect = div.getBoundingClientRect();
                if (rect.width > 50 && rect.height > 50) { // Only include reasonably sized elements
                    graphs.push({
                        selector: div.className || div.id,
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left
                    });
                }
            });
            
            // Also check for canvas elements within the Plotly divs
            const canvases = document.querySelectorAll('canvas');
            canvases.forEach(canvas => {
                const rect = canvas.getBoundingClientRect();
                if (rect.width > 50 && rect.height > 50) {
                    graphs.push({
                        selector: 'canvas',
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left
                    });
                }
            });
            
            return graphs;
        });
        
        console.log(`Found ${plotlyGraphs.length} potential graph elements:`);
        plotlyGraphs.forEach((graph, index) => {
            console.log(`  ${index + 1}. ${graph.selector} - ${graph.width}x${graph.height} at (${graph.left}, ${graph.top})`);
        });
        
        // Try to find the main graph container
        let mainGraphPath = null;
        const mainGraph = await page.evaluate(() => {
            // Look for elements that contain both width and height style attributes
            const allElements = document.querySelectorAll('*');
            let largestGraph = null;
            let largestArea = 0;
            
            for (const el of allElements) {
                const rect = el.getBoundingClientRect();
                const area = rect.width * rect.height;
                
                // Check if this element or its children contain a canvas or svg
                const hasGraphContent = el.querySelector('canvas, svg') !== null || 
                                      el.tagName === 'CANVAS' || 
                                      el.tagName === 'SVG';
                
                if (hasGraphContent && area > largestArea && rect.width > 200 && rect.height > 200) {
                    largestGraph = {
                        width: rect.width,
                        height: rect.height,
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX
                    };
                    largestArea = area;
                }
            }
            
            return largestGraph;
        });
        
        if (mainGraph) {
            console.log(`\nFound main graph: ${mainGraph.width}x${mainGraph.height}`);
            mainGraphPath = `main_graph_${timestamp}.png`;
            await page.screenshot({
                path: mainGraphPath,
                clip: {
                    x: mainGraph.left,
                    y: mainGraph.top,
                    width: mainGraph.width,
                    height: mainGraph.height
                }
            });
            console.log(`Main graph screenshot saved as: ${mainGraphPath}`);
        }
        
        // Also capture the results section which should include the graph
        const resultsSection = await page.evaluate(() => {
            // Look for elements that might contain results
            const possibleContainers = document.querySelectorAll('[class*="result"], [id*="result"], [class*="output"], [id*="output"]');
            for (const container of possibleContainers) {
                const rect = container.getBoundingClientRect();
                if (rect.width > 300 && rect.height > 300) {
                    return {
                        width: rect.width,
                        height: rect.height,
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX
                    };
                }
            }
            return null;
        });
        
        if (resultsSection) {
            const resultsPath = `results_section_${timestamp}.png`;
            await page.screenshot({
                path: resultsPath,
                clip: {
                    x: resultsSection.left,
                    y: resultsSection.top,
                    width: resultsSection.width,
                    height: resultsSection.height
                }
            });
            console.log(`Results section screenshot saved as: ${resultsPath}`);
        }
        
        return {
            fullPage: fullPagePath,
            mainGraph: mainGraphPath,
            absolutePath: `${__dirname}/${fullPagePath}`
        };

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
captureGraphImproved()
    .then(result => {
        console.log('\n✅ Successfully captured screenshots:');
        console.log(`Full page: ${result.absolutePath}`);
        if (result.mainGraph) {
            console.log(`Main graph: ${__dirname}/${result.mainGraph}`);
        }
    })
    .catch(err => {
        console.error('\n❌ Failed to capture graph:', err.message);
    });