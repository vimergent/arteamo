const puppeteer = require('puppeteer');
const fs = require('fs');

async function performanceAudit() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable performance tracking
    await page.evaluateOnNewDocument(() => {
        window.performanceMetrics = {};
        window.performanceMetrics.resources = [];
        
        // Track resource loading
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                window.performanceMetrics.resources.push({
                    name: entry.name,
                    type: entry.initiatorType,
                    duration: entry.duration,
                    size: entry.transferSize,
                    startTime: entry.startTime
                });
            }
        });
        observer.observe({ entryTypes: ['resource'] });
    });
    
    // Navigate to the page
    console.log('Loading page...');
    const startTime = Date.now();
    
    await page.goto('file:///root/Interiori/websites/website1-minimalist/index.html', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });
    
    const loadTime = Date.now() - startTime;
    
    // Get performance metrics
    const metrics = await page.metrics();
    const performanceTiming = await page.evaluate(() => {
        const timing = performance.timing;
        return {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
            resources: window.performanceMetrics.resources
        };
    });
    
    // Get resource details
    const resourceDetails = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources.map(r => ({
            name: r.name,
            type: r.initiatorType,
            duration: Math.round(r.duration),
            size: r.transferSize || 0,
            protocol: r.nextHopProtocol
        }));
    });
    
    // Get render-blocking resources
    const renderBlockingResources = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        const scripts = Array.from(document.querySelectorAll('script:not([async]):not([defer])'));
        
        return {
            stylesheets: links.map(l => l.href),
            scripts: scripts.filter(s => s.src).map(s => s.src)
        };
    });
    
    // Check for optimization opportunities
    const optimizationChecks = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const scripts = Array.from(document.querySelectorAll('script'));
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        
        return {
            totalImages: images.length,
            lazyLoadedImages: images.filter(img => img.loading === 'lazy').length,
            totalScripts: scripts.length,
            asyncScripts: scripts.filter(s => s.async).length,
            deferScripts: scripts.filter(s => s.defer).length,
            totalStylesheets: styles.length,
            minifiedFiles: {
                css: styles.filter(s => s.href.includes('.min.css')).length,
                js: scripts.filter(s => s.src && s.src.includes('.min.js')).length
            }
        };
    });
    
    // Generate report
    const report = {
        timestamp: new Date().toISOString(),
        loadingMetrics: {
            totalLoadTime: `${loadTime}ms`,
            domContentLoaded: `${performanceTiming.domContentLoaded}ms`,
            pageLoadComplete: `${performanceTiming.loadComplete}ms`,
            firstPaint: `${Math.round(performanceTiming.firstPaint)}ms`,
            firstContentfulPaint: `${Math.round(performanceTiming.firstContentfulPaint)}ms`
        },
        browserMetrics: {
            jsHeapUsedSize: `${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`,
            jsHeapTotalSize: `${(metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)}MB`,
            documents: metrics.Documents,
            frames: metrics.Frames,
            layoutDuration: `${Math.round(metrics.LayoutDuration * 1000)}ms`,
            scriptDuration: `${Math.round(metrics.ScriptDuration * 1000)}ms`
        },
        resources: {
            total: resourceDetails.length,
            byType: resourceDetails.reduce((acc, r) => {
                acc[r.type] = (acc[r.type] || 0) + 1;
                return acc;
            }, {}),
            largest: resourceDetails
                .filter(r => r.size > 0)
                .sort((a, b) => b.size - a.size)
                .slice(0, 10)
                .map(r => ({
                    name: r.name.split('/').pop(),
                    size: `${(r.size / 1024).toFixed(2)}KB`,
                    type: r.type,
                    duration: `${r.duration}ms`
                }))
        },
        renderBlockingResources,
        optimizationStatus: {
            imageOptimization: {
                total: optimizationChecks.totalImages,
                lazyLoaded: optimizationChecks.lazyLoadedImages,
                percentage: `${((optimizationChecks.lazyLoadedImages / optimizationChecks.totalImages) * 100).toFixed(1)}%`
            },
            scriptOptimization: {
                total: optimizationChecks.totalScripts,
                async: optimizationChecks.asyncScripts,
                defer: optimizationChecks.deferScripts,
                optimized: optimizationChecks.asyncScripts + optimizationChecks.deferScripts
            },
            minification: {
                cssMinified: optimizationChecks.minifiedFiles.css,
                jsMinified: optimizationChecks.minifiedFiles.js
            }
        }
    };
    
    await browser.close();
    return report;
}

// Run the audit
performanceAudit()
    .then(report => {
        console.log('\n=== PERFORMANCE AUDIT REPORT ===\n');
        console.log(JSON.stringify(report, null, 2));
        
        // Save report to file
        fs.writeFileSync(
            '/root/Interiori/websites/website1-minimalist/performance-audit-report.json',
            JSON.stringify(report, null, 2)
        );
        console.log('\nReport saved to performance-audit-report.json');
    })
    .catch(err => {
        console.error('Audit failed:', err);
        process.exit(1);
    });