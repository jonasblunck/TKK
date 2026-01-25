#!/usr/bin/env node
/**
 * Headless test runner using Playwright
 * Run with: node test/run-tests.js
 */

const { chromium } = require('playwright');
const path = require('path');

async function runTests() {
    console.log('🧪 Running TKK Unit Tests...\n');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Collect console output
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(text);
        console.log(text);
    });
    
    // Load the test runner
    const testRunnerPath = path.join(__dirname, 'test-runner.html');
    await page.goto(`file://${testRunnerPath}`);
    
    // Wait for tests to complete (look for the summary line)
    await page.waitForFunction(() => {
        const output = document.getElementById('output');
        return output && output.innerHTML.includes('Test Results:');
    }, { timeout: 30000 });
    
    // Small delay to ensure all output is captured
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await browser.close();
    
    // Check if tests passed
    const summaryLine = logs.find(l => l.includes('Test Results:'));
    if (summaryLine && summaryLine.includes('0 failed')) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
});
