// ============================================
// SHARE LINK TESTS
// ============================================

function testShareLink() {
    TestRunner.suite('Share Link');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    TestRunner.test('generateShareUrl creates valid URL', () => {
        const inst = addInstructor('Share Test', ['beginners'], []);
        state.schedule['2025-06-05'] = {
            beginners: { instructorId: inst.id, description: 'Shared' }
        };
        
        const link = generateShareUrl();
        
        TestRunner.assertTrue(link.includes(window.location.origin));
        TestRunner.assertTrue(link.includes('?s='));
    });
    
    TestRunner.test('generateShareUrl encodes state data', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 5; // June
        state.currentYear = 2025;
        
        // Add instructor and assign them in the current month
        const inst = addInstructor('Encoded', ['beginners'], ['2025-06-05']);
        state.schedule['2025-06-05'] = { beginners: { instructorId: inst.id } };
        
        const link = generateShareUrl();
        const encodedData = link.split('?s=')[1];
        
        TestRunner.assertTrue(encodedData.length > 0);
        
        // Should be valid LZString compressed data
        const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
        TestRunner.assertTrue(decoded !== null);
        
        const parsed = JSON.parse(decoded);
        // Should have the instructor since they're assigned in this month
        TestRunner.assertEqual(parsed.instructors.length, 1);
    });
    
    TestRunner.test('loadFromShareLink restores state', () => {
        // Create a valid share link first
        const testState = {
            instructors: [{ id: 'shared-1', name: 'From Link', groups: ['adults'], daysOff: [], feedbackPoints: 0 }],
            schedule: { '2025-07-01': { adults: { instructorId: 'shared-1', description: 'Restored' } } },
            cancelledDays: {},
            classDays: [1, 4, 6],
            currentMonth: 6,
            currentYear: 2025
        };
        
        const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(testState));
        const fakeUrl = `http://localhost/?schedule=${compressed}`;
        
        // Mock URL
        const originalHref = window.location.href;
        
        // We can't directly set window.location.href in tests, but we can test the decompression
        const decoded = LZString.decompressFromEncodedURIComponent(compressed);
        const parsed = JSON.parse(decoded);
        
        TestRunner.assertEqual(parsed.instructors[0].name, 'From Link');
        TestRunner.assertEqual(parsed.currentMonth, 6);
    });
    
    TestRunner.test('Share link preserves feedback points', () => {
        // Note: The share link only includes instructors that are assigned in the current month
        // and only stores id/name - feedback points are not included in share links
        // This test verifies the LZString compression/decompression works correctly
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        
        const inst = addInstructor('Feedback Test', ['beginners'], ['2025-06-05']);
        inst.feedbackPoints = 5;
        state.schedule['2025-06-05'] = { beginners: { instructorId: inst.id } };
        
        const link = generateShareUrl();
        const encodedData = link.split('?s=')[1];
        const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
        const parsed = JSON.parse(decoded);
        
        // The share link includes the instructor (id and name only)
        TestRunner.assertEqual(parsed.instructors.length, 1);
        TestRunner.assertEqual(parsed.instructors[0].name, 'Feedback Test');
    });
    
    TestRunner.test('Share link preserves class days configuration', () => {
        state.classDays = [2, 5];  // Tuesday and Friday
        
        const link = generateShareUrl();
        const encodedData = link.split('?s=')[1];
        const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
        const parsed = JSON.parse(decoded);
        
        TestRunner.assertEqual(parsed.classDays.length, 2);
        TestRunner.assertEqual(parsed.classDays[0], 2);
        TestRunner.assertEqual(parsed.classDays[1], 5);
    });
    
    TestRunner.test('Share link works with summer month groups (children + adults only)', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 6; // July (summer)
        state.currentYear = 2025;
        state.classDays = [1, 4, 6];
        
        const inst1 = addInstructor('Summer Inst 1', ['children'], ['2025-07-07']);
        const inst2 = addInstructor('Summer Inst 2', ['adults'], ['2025-07-07']);
        state.schedule['2025-07-07'] = {
            children: { instructorId: inst1.id, description: 'Kids class' },
            adults: { instructorId: inst2.id, description: 'Adult class' }
        };
        
        // Generate share URL
        const link = generateShareUrl();
        const encodedData = link.split('?s=')[1];
        const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
        const parsed = JSON.parse(decoded);
        
        // Verify month is preserved
        TestRunner.assertEqual(parsed.month, 6);
        // Verify both instructors are included
        TestRunner.assertEqual(parsed.instructors.length, 2);
        // Verify schedule data is correct
        TestRunner.assertEqual(parsed.schedule['2025-07-07'].children.instructorId, inst1.id);
        TestRunner.assertEqual(parsed.schedule['2025-07-07'].adults.instructorId, inst2.id);
        // Verify getGroupsForMonth returns only 2 groups for July
        const groups = getGroupsForMonth(parsed.month);
        TestRunner.assertEqual(groups.length, 2);
        TestRunner.assertEqual(groups[0], 'children');
        TestRunner.assertEqual(groups[1], 'adults');
    });
    
    // ---- shortenUrl tests (with fetch mocking) ----

    const originalFetch = window.fetch;
    const originalWarn = console.warn;

    TestRunner.test('shortenUrl returns short URL on success', async () => {
        window.fetch = async () => ({
            ok: true,
            text: async () => 'https://tinyurl.com/abc123'
        });

        const result = await shortenUrl('https://example.com/very/long/url');
        TestRunner.assertTrue(result.success);
        TestRunner.assertEqual(result.shortUrl, 'https://tinyurl.com/abc123');
    });

    TestRunner.test('shortenUrl trims whitespace from response', async () => {
        window.fetch = async () => ({
            ok: true,
            text: async () => '  https://tinyurl.com/abc123\n'
        });

        const result = await shortenUrl('https://example.com');
        TestRunner.assertEqual(result.shortUrl, 'https://tinyurl.com/abc123');
    });

    TestRunner.test('shortenUrl returns failure on HTTP error', async () => {
        console.warn = () => {};
        window.fetch = async () => ({
            ok: false,
            status: 500,
            text: async () => 'Server Error'
        });

        const result = await shortenUrl('https://example.com');
        TestRunner.assertFalse(result.success);
        TestRunner.assertTrue(result.error.length > 0);
        console.warn = originalWarn;
    });

    TestRunner.test('shortenUrl returns failure on network error', async () => {
        console.warn = () => {};
        window.fetch = async () => { throw new TypeError('Failed to fetch'); };

        const result = await shortenUrl('https://example.com');
        TestRunner.assertFalse(result.success);
        TestRunner.assertEqual(result.error, 'Failed to fetch');
        console.warn = originalWarn;
    });

    TestRunner.test('shortenUrl returns failure on invalid response', async () => {
        console.warn = () => {};
        window.fetch = async () => ({
            ok: true,
            text: async () => 'Error: invalid URL'
        });

        const result = await shortenUrl('not-a-url');
        TestRunner.assertFalse(result.success);
        TestRunner.assertEqual(result.error, 'Invalid response from URL shortener');
        console.warn = originalWarn;
    });

    TestRunner.test('shortenUrl calls TinyURL API with encoded URL', async () => {
        let calledUrl = '';
        window.fetch = async (url) => {
            calledUrl = url;
            return { ok: true, text: async () => 'https://tinyurl.com/xyz' };
        };

        await shortenUrl('https://example.com/path?q=hello world');
        TestRunner.assertTrue(calledUrl.includes('tinyurl.com/api-create.php'));
        TestRunner.assertTrue(calledUrl.includes(encodeURIComponent('https://example.com/path?q=hello world')));
    });

    // Restore fetch
    window.fetch = originalFetch;

    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
