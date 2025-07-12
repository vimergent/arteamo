// Script to fix the translations.js file structure
const fs = require('fs');

// Read the file
const content = fs.readFileSync('/root/Interiori/websites/translations.js', 'utf8');
const lines = content.split('\n');

// Find all language sections
const languageSections = [];
let currentSection = null;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for language section start
    const langMatch = line.match(/^    ([a-z]{2}): {$/);
    if (langMatch) {
        if (currentSection) {
            currentSection.endLine = i - 1;
            languageSections.push(currentSection);
        }
        currentSection = {
            lang: langMatch[1],
            startLine: i,
            endLine: null
        };
        braceCount = 1;
        continue;
    }
    
    // Count braces if we're in a section
    if (currentSection) {
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        braceCount += openBraces - closeBraces;
        
        // Check if section is complete
        if (braceCount === 0 && line.trim() === '},') {
            currentSection.endLine = i;
            languageSections.push(currentSection);
            currentSection = null;
        }
    }
}

// Check for duplicate languages
const seenLangs = new Set();
const duplicates = [];
const uniqueSections = [];

for (const section of languageSections) {
    if (seenLangs.has(section.lang)) {
        duplicates.push(section);
        console.log(`Found duplicate ${section.lang} section at line ${section.startLine + 1}`);
    } else {
        seenLangs.add(section.lang);
        uniqueSections.push(section);
    }
}

// If we have the second bg section (which should be deleted), let's check what's in it
if (duplicates.length > 0) {
    console.log('\nDuplicate BG section content (lines 1802-1938):');
    for (let i = 1802; i < 1939 && i < lines.length; i++) {
        if (lines[i-1].includes('projects:') || lines[i-1].includes('name:')) {
            console.log(`Line ${i}: ${lines[i-1].substring(0, 50)}...`);
        }
    }
}

console.log('\nLanguage sections found:');
uniqueSections.forEach(section => {
    console.log(`- ${section.lang}: lines ${section.startLine + 1} to ${section.endLine + 1}`);
});

console.log('\nThe file structure needs to be fixed by removing the duplicate bg section (lines 1802-1938).');