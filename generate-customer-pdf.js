const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Read the HTML file
    const htmlPath = path.join(__dirname, '..', 'customer-account-setup-bg.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Set the content directly
    await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    const pdfPath = path.join(__dirname, '..', 'customer-account-setup-instructions-BG.pdf');
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
        }
    });
    
    await browser.close();
    console.log('PDF created successfully: customer-account-setup-instructions-BG.pdf');
    console.log('Location:', pdfPath);
}

generatePDF().catch(console.error);