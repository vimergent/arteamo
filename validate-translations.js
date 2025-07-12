// Simple script to validate translations.js structure
const fs = require('fs');

const content = fs.readFileSync('/root/Interiori/websites/translations.js', 'utf8');

// Count opening and closing braces
const openBraces = (content.match(/{/g) || []).length;
const closeBraces = (content.match(/}/g) || []).length;

console.log(`Opening braces: ${openBraces}`);
console.log(`Closing braces: ${closeBraces}`);
console.log(`Difference: ${openBraces - closeBraces}`);

// Try to load it as a module
try {
    // Create a fake window object
    const window = {};
    eval(content);
    console.log('\nFile evaluated successfully!');
    console.log('Available languages:', Object.keys(window.translations));
} catch (error) {
    console.error('\nError evaluating file:', error.message);
    
    // Find the line with the error
    const lines = content.split('\n');
    const errorLine = parseInt(error.stack.match(/:(\d+):/)?.[1] || 0);
    if (errorLine > 0) {
        console.log(`\nError around line ${errorLine}:`);
        for (let i = Math.max(0, errorLine - 5); i < Math.min(lines.length, errorLine + 5); i++) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
    }
}