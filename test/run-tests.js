#!/usr/bin/env node
/**
 * Headless test runner using Playwright
 * Run with: node test/run-tests.js
 */

const { chromium } = require('playwright');
const path = require('path');

async function runUnitTests(browser) {
    console.log('🧪 Running TKK Unit Tests...\n');
    
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
    await page.close();
    
    // Check if tests passed
    const summaryLine = logs.find(l => l.includes('Test Results:'));
    return summaryLine && summaryLine.includes('0 failed');
}

/**
 * Integration test: verify the URL shortener redirects directly to the
 * destination without interstitial/preview pages or forced delays.
 * 
 * This catches services that add ad pages, "Continue to destination" buttons,
 * or countdown timers before redirecting (e.g. TinyURL's preview page).
 */
async function testShortenerDirectRedirect(browser) {
    console.log('\n🔗 Integration: URL shortener redirect test...\n');

    const targetUrl = 'https://www.example.com';

    // Step 1: Shorten a known URL via the real API (from Node.js, not browser)
    let shortUrl;
    try {
        const resp = await fetch(`https://da.gd/s?url=${encodeURIComponent(targetUrl)}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text = (await resp.text()).trim();
        if (!text.startsWith('http')) throw new Error(`Invalid response: ${text}`);
        shortUrl = text;
    } catch (err) {
        console.log(`  ⚠️  Skipped (API unavailable: ${err.message})`);
        return true; // Don't fail the build if the API is down
    }

    console.log(`  Short URL: ${shortUrl}`);

    // Step 2: Navigate to the short URL in a real browser and verify direct redirect
    // Wait for navigation to settle — a direct 301/302 redirect completes immediately,
    // while an interstitial page stays on the shortener domain.
    const page = await browser.newPage();
    try {
        await page.goto(shortUrl, { waitUntil: 'networkidle', timeout: 15000 });
    } catch {
        // networkidle may time out on some pages; check where we ended up
    }

    // Give JS-based redirects a moment to fire
    await new Promise(resolve => setTimeout(resolve, 2000));
    const finalUrl = page.url();
    console.log(`  Final URL: ${finalUrl}`);

    // Verify we landed on the target, not stuck on the shortener's domain
    const shortenerDomain = new URL(shortUrl).hostname;
    const finalDomain = new URL(finalUrl).hostname;
    const redirectedAway = finalDomain !== shortenerDomain;

    // Also check the page doesn't contain interstitial indicators
    const hasInterstitial = await page.evaluate(() => {
        const text = document.body?.innerText?.toLowerCase() || '';
        return text.includes('continue to your destination')
            || text.includes('click here if not redirected')
            || text.includes('you will be redirected')
            || text.includes('activate account');
    });

    if (!redirectedAway) {
        console.error('  ❌ Short URL did not redirect away from shortener domain');
        console.error(`     Expected to leave ${shortenerDomain}, but final URL is ${finalUrl}`);
        await page.close();
        return false;
    }

    if (hasInterstitial) {
        console.error('  ❌ Interstitial/preview page detected');
        await page.close();
        return false;
    }

    console.log('  ✅ URL shortener redirects directly (no interstitial page)');
    await page.close();
    return true;
}

async function runTests() {
    const browser = await chromium.launch({ headless: true });
    let allPassed = true;

    allPassed = await runUnitTests(browser) && allPassed;
    allPassed = await testShortenerDirectRedirect(browser) && allPassed;

    await browser.close();
    process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
});
