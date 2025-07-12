const puppeteer = require('puppeteer');
const fs = require('fs');

// Performance analysis team simulation
class PerformanceAnalysisTeam {
    constructor() {
        this.results = {
            performanceExpert: {},
            networkExpert: {},
            criticalPathExpert: {},
            imageOptimizationExpert: {},
            cachingExpert: {},
            summary: {}
        };
    }

    async analyze(url) {
        console.log(`\n🔍 Performance Analysis Team - Analyzing ${url}\n`);
        
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            
            // Enable performance tracking
            await page.setCacheEnabled(false);
            await page.setViewport({ width: 1920, height: 1080 });

            // Performance Expert Analysis
            console.log('1️⃣ Performance Expert: Measuring Core Web Vitals...');
            await this.performanceExpertAnalysis(page, url);

            // Network Expert Analysis
            console.log('\n2️⃣ Network Expert: Analyzing network requests...');
            await this.networkExpertAnalysis(page, url);

            // Critical Path Expert Analysis
            console.log('\n3️⃣ Critical Path Expert: Examining render-blocking resources...');
            await this.criticalPathExpertAnalysis(page, url);

            // Image Optimization Expert Analysis
            console.log('\n4️⃣ Image Optimization Expert: Reviewing image assets...');
            await this.imageOptimizationExpertAnalysis(page, url);

            // Caching Expert Analysis
            console.log('\n5️⃣ Caching Expert: Checking cache strategies...');
            await this.cachingExpertAnalysis(page, url);

            // Generate summary
            this.generateSummary();

        } finally {
            await browser.close();
        }

        return this.results;
    }

    async performanceExpertAnalysis(page, url) {
        const client = await page.target().createCDPSession();
        await client.send('Performance.enable');

        const startTime = Date.now();
        
        // Start tracing for detailed metrics
        await page.tracing.start({ categories: ['devtools.timeline'] });

        // Navigate and wait for load
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        const loadTime = Date.now() - startTime;

        // Get performance metrics
        const metrics = await page.metrics();
        const performanceTiming = await page.evaluate(() => {
            const timing = performance.timing;
            const paintMetrics = performance.getEntriesByType('paint');
            return {
                TTFB: timing.responseStart - timing.navigationStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                FCP: paintMetrics.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                FP: paintMetrics.find(p => p.name === 'first-paint')?.startTime || 0
            };
        });

        // Get LCP
        const lcp = await page.evaluate(() => {
            return new Promise((resolve) => {
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                }).observe({ entryTypes: ['largest-contentful-paint'] });
                
                setTimeout(() => resolve(0), 5000);
            });
        });

        // Get CLS
        const cls = await page.evaluate(() => {
            return new Promise((resolve) => {
                let clsValue = 0;
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                }).observe({ entryTypes: ['layout-shift'] });
                
                setTimeout(() => resolve(clsValue), 5000);
            });
        });

        // Stop tracing
        const tracing = await page.tracing.stop();

        this.results.performanceExpert = {
            metrics: {
                TTFB: `${performanceTiming.TTFB}ms`,
                FCP: `${Math.round(performanceTiming.FCP)}ms`,
                LCP: `${Math.round(lcp)}ms`,
                CLS: cls.toFixed(3),
                totalLoadTime: `${loadTime}ms`,
                domContentLoaded: `${performanceTiming.domContentLoaded}ms`,
                loadComplete: `${performanceTiming.loadComplete}ms`
            },
            memory: {
                JSHeapUsedSize: `${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`,
                JSHeapTotalSize: `${(metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)}MB`
            }
        };

        console.log('✅ Core Web Vitals measured');
    }

    async networkExpertAnalysis(page, url) {
        const requests = [];
        const resourceTimings = {};

        // Track all network requests
        page.on('request', request => {
            requests.push({
                url: request.url(),
                method: request.method(),
                resourceType: request.resourceType(),
                timestamp: Date.now()
            });
        });

        page.on('response', response => {
            const request = response.request();
            const url = request.url();
            resourceTimings[url] = {
                status: response.status(),
                size: response.headers()['content-length'] || 0,
                type: response.headers()['content-type'],
                cacheControl: response.headers()['cache-control'],
                timing: response.timing()
            };
        });

        await page.goto(url, { waitUntil: 'networkidle0' });

        // Analyze requests
        const requestsByType = {};
        let totalSize = 0;
        let totalRequests = requests.length;

        requests.forEach(req => {
            if (!requestsByType[req.resourceType]) {
                requestsByType[req.resourceType] = { count: 0, urls: [] };
            }
            requestsByType[req.resourceType].count++;
            requestsByType[req.resourceType].urls.push(req.url);
        });

        // Calculate total page weight
        const resourceSizes = await page.evaluate(() => {
            return performance.getEntriesByType('resource').map(entry => ({
                name: entry.name,
                transferSize: entry.transferSize,
                encodedBodySize: entry.encodedBodySize,
                decodedBodySize: entry.decodedBodySize,
                initiatorType: entry.initiatorType
            }));
        });

        totalSize = resourceSizes.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);

        this.results.networkExpert = {
            totalRequests,
            totalSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
            requestsByType,
            largestResources: resourceSizes
                .sort((a, b) => b.transferSize - a.transferSize)
                .slice(0, 5)
                .map(r => ({
                    url: r.name.split('/').pop(),
                    size: `${(r.transferSize / 1024).toFixed(2)}KB`,
                    type: r.initiatorType
                })),
            compressionOpportunities: resourceSizes
                .filter(r => r.decodedBodySize > r.encodedBodySize * 1.5)
                .map(r => ({
                    url: r.name.split('/').pop(),
                    potential: `${((1 - r.encodedBodySize / r.decodedBodySize) * 100).toFixed(1)}%`
                }))
        };

        console.log('✅ Network analysis complete');
    }

    async criticalPathExpertAnalysis(page, url) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const criticalPath = await page.evaluate(() => {
            const results = {
                renderBlockingCSS: [],
                renderBlockingJS: [],
                asyncScripts: [],
                deferredScripts: [],
                inlineStyles: [],
                inlineScripts: []
            };

            // Check CSS
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                if (!link.media || link.media === 'all' || link.media === 'screen') {
                    results.renderBlockingCSS.push({
                        href: link.href,
                        media: link.media || 'all'
                    });
                }
            });

            // Check inline styles
            document.querySelectorAll('style').forEach(style => {
                results.inlineStyles.push({
                    size: style.innerHTML.length,
                    content: style.innerHTML.substring(0, 100) + '...'
                });
            });

            // Check scripts
            document.querySelectorAll('script').forEach(script => {
                if (script.src) {
                    if (script.async) {
                        results.asyncScripts.push(script.src);
                    } else if (script.defer) {
                        results.deferredScripts.push(script.src);
                    } else {
                        results.renderBlockingJS.push(script.src);
                    }
                } else if (script.innerHTML) {
                    results.inlineScripts.push({
                        size: script.innerHTML.length,
                        content: script.innerHTML.substring(0, 100) + '...'
                    });
                }
            });

            return results;
        });

        // Check for resource hints
        const resourceHints = await page.evaluate(() => {
            const hints = {
                preload: [],
                prefetch: [],
                preconnect: [],
                dnsPrefetch: []
            };

            document.querySelectorAll('link[rel="preload"]').forEach(link => {
                hints.preload.push({ href: link.href, as: link.as });
            });

            document.querySelectorAll('link[rel="prefetch"]').forEach(link => {
                hints.prefetch.push(link.href);
            });

            document.querySelectorAll('link[rel="preconnect"]').forEach(link => {
                hints.preconnect.push(link.href);
            });

            document.querySelectorAll('link[rel="dns-prefetch"]').forEach(link => {
                hints.dnsPrefetch.push(link.href);
            });

            return hints;
        });

        this.results.criticalPathExpert = {
            renderBlocking: {
                css: criticalPath.renderBlockingCSS.length,
                js: criticalPath.renderBlockingJS.length,
                details: criticalPath
            },
            resourceHints,
            recommendations: this.generateCriticalPathRecommendations(criticalPath, resourceHints)
        };

        console.log('✅ Critical path analysis complete');
    }

    async imageOptimizationExpertAnalysis(page, url) {
        await page.goto(url, { waitUntil: 'networkidle0' });

        const imageAnalysis = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            const backgroundImages = Array.from(document.querySelectorAll('*')).filter(el => {
                const bg = window.getComputedStyle(el).backgroundImage;
                return bg && bg !== 'none';
            });

            return {
                images: images.map(img => ({
                    src: img.src,
                    alt: img.alt,
                    loading: img.loading,
                    decoding: img.decoding,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    displayWidth: img.offsetWidth,
                    displayHeight: img.offsetHeight,
                    isLazyLoaded: img.loading === 'lazy',
                    hasAlt: !!img.alt,
                    srcset: img.srcset,
                    sizes: img.sizes
                })),
                backgroundImages: backgroundImages.map(el => ({
                    url: window.getComputedStyle(el).backgroundImage.match(/url\("?(.+?)"?\)/)?.[1],
                    element: el.tagName,
                    className: el.className
                }))
            };
        });

        // Analyze image optimization opportunities
        const opportunities = {
            missingLazyLoad: [],
            oversizedImages: [],
            missingAlt: [],
            missingModernFormats: [],
            missingSrcset: []
        };

        imageAnalysis.images.forEach(img => {
            // Check lazy loading
            if (!img.isLazyLoaded && img.displayHeight > 0) {
                // Assume viewport height of 800px for lazy loading check
                const viewportHeight = 800;
                if (img.displayHeight > viewportHeight) {
                    opportunities.missingLazyLoad.push(img.src);
                }
            }

            // Check oversized images
            if (img.naturalWidth > img.displayWidth * 2) {
                opportunities.oversizedImages.push({
                    src: img.src,
                    natural: `${img.naturalWidth}x${img.naturalHeight}`,
                    display: `${img.displayWidth}x${img.displayHeight}`,
                    reduction: `${Math.round((1 - (img.displayWidth / img.naturalWidth)) * 100)}%`
                });
            }

            // Check alt text
            if (!img.hasAlt) {
                opportunities.missingAlt.push(img.src);
            }

            // Check modern formats
            if (img.src && !img.src.includes('.webp') && !img.src.includes('.avif')) {
                opportunities.missingModernFormats.push(img.src);
            }

            // Check srcset
            if (!img.srcset && img.displayWidth > 0) {
                opportunities.missingSrcset.push(img.src);
            }
        });

        this.results.imageOptimizationExpert = {
            totalImages: imageAnalysis.images.length,
            lazyLoadedImages: imageAnalysis.images.filter(img => img.isLazyLoaded).length,
            backgroundImages: imageAnalysis.backgroundImages.length,
            opportunities
        };

        console.log('✅ Image optimization analysis complete');
    }

    async cachingExpertAnalysis(page, url) {
        const cacheAnalysis = {
            headers: {},
            recommendations: []
        };

        // Intercept responses to check cache headers
        const responses = [];
        page.on('response', response => {
            responses.push({
                url: response.url(),
                status: response.status(),
                headers: response.headers(),
                fromCache: response.fromCache()
            });
        });

        // Load page twice to check caching
        await page.goto(url, { waitUntil: 'networkidle0' });
        const firstLoadResponses = [...responses];
        
        responses.length = 0;
        await page.reload({ waitUntil: 'networkidle0' });
        const secondLoadResponses = [...responses];

        // Analyze cache headers
        firstLoadResponses.forEach(response => {
            const cacheControl = response.headers['cache-control'];
            const etag = response.headers['etag'];
            const lastModified = response.headers['last-modified'];
            const expires = response.headers['expires'];

            const resourceType = response.url.split('.').pop().split('?')[0];
            
            if (!cacheAnalysis.headers[resourceType]) {
                cacheAnalysis.headers[resourceType] = [];
            }

            cacheAnalysis.headers[resourceType].push({
                url: response.url.split('/').pop(),
                cacheControl,
                etag: !!etag,
                lastModified: !!lastModified,
                expires
            });
        });

        // Check cache hit rate
        const cacheHits = secondLoadResponses.filter(r => r.fromCache).length;
        const cacheHitRate = (cacheHits / secondLoadResponses.length * 100).toFixed(1);

        // Check for service worker
        const hasServiceWorker = await page.evaluate(() => {
            return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
        });

        // Generate recommendations
        if (cacheHitRate < 80) {
            cacheAnalysis.recommendations.push('Improve cache hit rate by setting appropriate cache headers');
        }

        if (!hasServiceWorker) {
            cacheAnalysis.recommendations.push('Consider implementing a service worker for offline functionality');
        }

        // Check for missing cache headers
        Object.entries(cacheAnalysis.headers).forEach(([type, resources]) => {
            const missingCacheControl = resources.filter(r => !r.cacheControl).length;
            if (missingCacheControl > 0) {
                cacheAnalysis.recommendations.push(`Add cache-control headers for ${type} files`);
            }
        });

        this.results.cachingExpert = {
            cacheHitRate: `${cacheHitRate}%`,
            hasServiceWorker,
            headers: cacheAnalysis.headers,
            recommendations: cacheAnalysis.recommendations,
            cachedResources: cacheHits,
            totalResources: secondLoadResponses.length
        };

        console.log('✅ Caching analysis complete');
    }

    generateCriticalPathRecommendations(criticalPath, resourceHints) {
        const recommendations = [];

        if (criticalPath.renderBlockingCSS.length > 0) {
            recommendations.push('Consider inlining critical CSS and deferring non-critical styles');
        }

        if (criticalPath.renderBlockingJS.length > 0) {
            recommendations.push('Move scripts to the bottom of the page or use async/defer attributes');
        }

        if (criticalPath.inlineStyles.some(s => s.size > 50000)) {
            recommendations.push('Large inline styles detected - consider extracting to external files');
        }

        if (resourceHints.preload.length === 0) {
            recommendations.push('Use <link rel="preload"> for critical resources');
        }

        if (resourceHints.preconnect.length === 0) {
            recommendations.push('Use <link rel="preconnect"> for third-party origins');
        }

        return recommendations;
    }

    generateSummary() {
        const perf = this.results.performanceExpert.metrics;
        const network = this.results.networkExpert;
        const images = this.results.imageOptimizationExpert;

        this.results.summary = {
            grade: this.calculateGrade(),
            keyMetrics: {
                'Load Time': perf.totalLoadTime,
                'Page Size': network.totalSize,
                'Requests': network.totalRequests,
                'LCP': perf.LCP,
                'CLS': perf.CLS
            },
            topIssues: this.identifyTopIssues(),
            quickWins: this.identifyQuickWins()
        };
    }

    calculateGrade() {
        const lcp = parseFloat(this.results.performanceExpert.metrics.LCP);
        const cls = parseFloat(this.results.performanceExpert.metrics.CLS);
        const fcp = parseFloat(this.results.performanceExpert.metrics.FCP);

        let score = 100;

        // LCP scoring (2.5s = good, 4s = needs improvement)
        if (lcp > 4000) score -= 30;
        else if (lcp > 2500) score -= 15;

        // CLS scoring (0.1 = good, 0.25 = needs improvement)
        if (cls > 0.25) score -= 20;
        else if (cls > 0.1) score -= 10;

        // FCP scoring (1.8s = good, 3s = needs improvement)
        if (fcp > 3000) score -= 20;
        else if (fcp > 1800) score -= 10;

        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    identifyTopIssues() {
        const issues = [];

        // Check Core Web Vitals
        const lcp = parseFloat(this.results.performanceExpert.metrics.LCP);
        if (lcp > 2500) {
            issues.push(`LCP is ${lcp}ms (target: <2500ms)`);
        }

        // Check image optimization
        const imageOps = this.results.imageOptimizationExpert.opportunities;
        if (imageOps.oversizedImages.length > 0) {
            issues.push(`${imageOps.oversizedImages.length} oversized images found`);
        }

        // Check render-blocking resources
        const blocking = this.results.criticalPathExpert.renderBlocking;
        if (blocking.css + blocking.js > 3) {
            issues.push(`${blocking.css + blocking.js} render-blocking resources`);
        }

        return issues.slice(0, 5);
    }

    identifyQuickWins() {
        const wins = [];

        // Image optimization
        const imageOps = this.results.imageOptimizationExpert.opportunities;
        if (imageOps.missingLazyLoad.length > 0) {
            wins.push(`Enable lazy loading for ${imageOps.missingLazyLoad.length} images`);
        }

        // Caching
        const cacheHitRate = parseFloat(this.results.cachingExpert.cacheHitRate);
        if (cacheHitRate < 80) {
            wins.push('Improve caching headers to reduce server requests');
        }

        // Compression
        const compressionOps = this.results.networkExpert.compressionOpportunities;
        if (compressionOps.length > 0) {
            wins.push(`Enable compression for ${compressionOps.length} resources`);
        }

        return wins.slice(0, 5);
    }

    printReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 PERFORMANCE ANALYSIS REPORT - Studio Arteamo');
        console.log('='.repeat(80));

        // Summary
        console.log('\n📈 SUMMARY');
        console.log(`Grade: ${this.results.summary.grade}`);
        console.log('\nKey Metrics:');
        Object.entries(this.results.summary.keyMetrics).forEach(([key, value]) => {
            console.log(`  • ${key}: ${value}`);
        });

        // Top Issues
        console.log('\n⚠️  TOP ISSUES:');
        this.results.summary.topIssues.forEach((issue, i) => {
            console.log(`  ${i + 1}. ${issue}`);
        });

        // Quick Wins
        console.log('\n✨ QUICK WINS:');
        this.results.summary.quickWins.forEach((win, i) => {
            console.log(`  ${i + 1}. ${win}`);
        });

        // Detailed Results by Expert
        console.log('\n' + '-'.repeat(80));
        console.log('DETAILED ANALYSIS BY EXPERT');
        console.log('-'.repeat(80));

        // 1. Performance Expert
        console.log('\n1️⃣ PERFORMANCE EXPERT FINDINGS:');
        console.log('Core Web Vitals:');
        Object.entries(this.results.performanceExpert.metrics).forEach(([key, value]) => {
            console.log(`  • ${key}: ${value}`);
        });

        // 2. Network Expert
        console.log('\n2️⃣ NETWORK EXPERT FINDINGS:');
        console.log(`  • Total Requests: ${this.results.networkExpert.totalRequests}`);
        console.log(`  • Total Size: ${this.results.networkExpert.totalSize}`);
        console.log('  • Requests by Type:');
        Object.entries(this.results.networkExpert.requestsByType).forEach(([type, data]) => {
            console.log(`    - ${type}: ${data.count}`);
        });

        // 3. Critical Path Expert
        console.log('\n3️⃣ CRITICAL PATH EXPERT FINDINGS:');
        console.log(`  • Render-blocking CSS: ${this.results.criticalPathExpert.renderBlocking.css}`);
        console.log(`  • Render-blocking JS: ${this.results.criticalPathExpert.renderBlocking.js}`);
        console.log('  • Recommendations:');
        this.results.criticalPathExpert.recommendations.forEach(rec => {
            console.log(`    - ${rec}`);
        });

        // 4. Image Optimization Expert
        console.log('\n4️⃣ IMAGE OPTIMIZATION EXPERT FINDINGS:');
        console.log(`  • Total Images: ${this.results.imageOptimizationExpert.totalImages}`);
        console.log(`  • Lazy Loaded: ${this.results.imageOptimizationExpert.lazyLoadedImages}`);
        const imageOps = this.results.imageOptimizationExpert.opportunities;
        console.log('  • Optimization Opportunities:');
        console.log(`    - Missing lazy load: ${imageOps.missingLazyLoad.length}`);
        console.log(`    - Oversized images: ${imageOps.oversizedImages.length}`);
        console.log(`    - Missing alt text: ${imageOps.missingAlt.length}`);

        // 5. Caching Expert
        console.log('\n5️⃣ CACHING EXPERT FINDINGS:');
        console.log(`  • Cache Hit Rate: ${this.results.cachingExpert.cacheHitRate}`);
        console.log(`  • Service Worker: ${this.results.cachingExpert.hasServiceWorker ? 'Yes' : 'No'}`);
        console.log('  • Recommendations:');
        this.results.cachingExpert.recommendations.forEach(rec => {
            console.log(`    - ${rec}`);
        });

        console.log('\n' + '='.repeat(80));
    }
}

// Run the analysis
async function main() {
    const team = new PerformanceAnalysisTeam();
    const url = 'https://arteamo.net';
    
    try {
        await team.analyze(url);
        team.printReport();
        
        // Save detailed results
        fs.writeFileSync(
            'performance-analysis-results.json',
            JSON.stringify(team.results, null, 2)
        );
        console.log('\n📁 Detailed results saved to performance-analysis-results.json');
        
    } catch (error) {
        console.error('Error during analysis:', error);
    }
}

main();