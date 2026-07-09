// ============================================
// SHARE LINK TESTS
// ============================================

function testShareLink() {
    TestRunner.suite('Share Link');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    TestRunner.test('generateShareUrl creates valid URL with s2 param', () => {
        state.currentMonth = 5;
        state.currentYear = 2025;
        const inst = addInstructor('Share Test', ['beginners'], []);
        state.schedule['2025-06-05'] = {
            beginners: { instructorId: inst.id, description: 'Shared' }
        };
        
        const link = generateShareUrl();
        
        TestRunner.assertTrue(link.includes(window.location.origin));
        TestRunner.assertTrue(link.includes('?s2='));
    });
    
    TestRunner.test('generateShareUrl produces decodable compact data', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        
        const inst = addInstructor('Encoded', ['beginners'], ['2025-06-05']);
        state.schedule['2025-06-05'] = { beginners: { instructorId: inst.id } };
        
        const link = generateShareUrl();
        const encodedData = link.split('?s2=')[1];
        
        TestRunner.assertTrue(encodedData.length > 0);
        
        const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
        TestRunner.assertTrue(decoded !== null);
        
        const compact = JSON.parse(decoded);
        TestRunner.assertEqual(compact.v, 2);
        TestRunner.assertEqual(compact.i.length, 1);
        TestRunner.assertEqual(compact.i[0][1], 'Encoded');
    });
    
    TestRunner.test('compact encoding round-trip preserves schedule', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        
        const inst1 = addInstructor('Alice', ['beginners'], []);
        const inst2 = addInstructor('Bob', ['children'], []);
        state.schedule['2025-06-05'] = {
            beginners: { instructorId: inst1.id },
            children: { instructorId: inst2.id }
        };
        state.classDays = [1, 4, 6];
        
        const shareData = getShareableState();
        const compact = encodeCompactState(shareData);
        const restored = decodeCompactState(compact);
        
        TestRunner.assertEqual(restored.month, 5);
        TestRunner.assertEqual(restored.year, 2025);
        TestRunner.assertEqual(restored.instructors.length, 2);
        TestRunner.assertEqual(restored.schedule['2025-06-05'].beginners.instructorId, inst1.id);
        TestRunner.assertEqual(restored.schedule['2025-06-05'].children.instructorId, inst2.id);
        TestRunner.assertDeepEqual(restored.classDays, [1, 4, 6]);
    });
    
    TestRunner.test('compact encoding preserves descriptions', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        
        const inst = addInstructor('Desc Test', ['beginners'], []);
        state.schedule['2025-06-05'] = {
            beginners: { instructorId: inst.id, description: 'Special class' }
        };
        
        const shareData = getShareableState();
        const compact = encodeCompactState(shareData);
        const restored = decodeCompactState(compact);
        
        TestRunner.assertEqual(restored.schedule['2025-06-05'].beginners.description, 'Special class');
    });
    
    TestRunner.test('compact encoding preserves assistants', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        
        const inst1 = addInstructor('Main', ['beginners'], []);
        const inst2 = addInstructor('Helper', ['beginners'], []);
        state.schedule['2025-06-05'] = {
            beginners: { instructorId: inst1.id, assistants: [inst2.id] }
        };
        
        const shareData = getShareableState();
        const compact = encodeCompactState(shareData);
        const restored = decodeCompactState(compact);
        
        TestRunner.assertEqual(restored.schedule['2025-06-05'].beginners.instructorId, inst1.id);
        TestRunner.assertDeepEqual(restored.schedule['2025-06-05'].beginners.assistants, [inst2.id]);
    });
    
    TestRunner.test('compact encoding handles assistants without description', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        
        const inst1 = addInstructor('Main', ['beginners'], []);
        const inst2 = addInstructor('Asst', ['beginners'], []);
        state.schedule['2025-06-05'] = {
            beginners: { instructorId: inst1.id, assistants: [inst2.id] }
        };
        
        const shareData = getShareableState();
        const compact = encodeCompactState(shareData);
        
        // The compact value should use null placeholder for description
        const dayEntry = compact.s[0][1];
        TestRunner.assertTrue(Array.isArray(dayEntry.b));
        TestRunner.assertEqual(dayEntry.b[1], null);
        TestRunner.assertDeepEqual(dayEntry.b[2], [1]);
    });
    
    TestRunner.test('compact encoding handles instructor at index 0', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        
        const inst = addInstructor('First', ['beginners'], []);
        state.schedule['2025-06-05'] = {
            beginners: { instructorId: inst.id }
        };
        
        const shareData = getShareableState();
        const compact = encodeCompactState(shareData);
        const restored = decodeCompactState(compact);
        
        // Index 0 must not be treated as falsy
        TestRunner.assertEqual(restored.schedule['2025-06-05'].beginners.instructorId, inst.id);
    });
    
    TestRunner.test('compact encoding preserves cancelled days', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        
        const inst = addInstructor('Test', ['beginners'], []);
        state.schedule['2025-06-05'] = { beginners: { instructorId: inst.id } };
        state.cancelledDays['2025-06-09'] = true;
        state.cancelledDays['2025-06-15'] = true;
        
        const shareData = getShareableState();
        const compact = encodeCompactState(shareData);
        const restored = decodeCompactState(compact);
        
        TestRunner.assertTrue(restored.cancelledDays['2025-06-09']);
        TestRunner.assertTrue(restored.cancelledDays['2025-06-15']);
    });
    
    TestRunner.test('compact encoding handles empty schedule', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        state.classDays = [1, 4, 6];
        
        const shareData = getShareableState();
        const compact = encodeCompactState(shareData);
        const restored = decodeCompactState(compact);
        
        TestRunner.assertEqual(Object.keys(restored.schedule).length, 0);
        TestRunner.assertEqual(restored.instructors.length, 0);
        TestRunner.assertDeepEqual(restored.classDays, [1, 4, 6]);
    });
    
    TestRunner.test('compact URL is shorter than legacy format', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        state.classDays = [1, 4, 6];
        
        const inst1 = addInstructor('Alice', ['beginners'], []);
        const inst2 = addInstructor('Bob', ['children'], []);
        const inst3 = addInstructor('Charlie', ['adults'], []);
        state.schedule['2025-06-02'] = { beginners: { instructorId: inst1.id }, children: { instructorId: inst2.id }, adults: { instructorId: inst3.id } };
        state.schedule['2025-06-05'] = { beginners: { instructorId: inst2.id }, children: { instructorId: inst3.id }, adults: { instructorId: inst1.id } };
        state.schedule['2025-06-07'] = { beginners: { instructorId: inst3.id }, children: { instructorId: inst1.id }, adults: { instructorId: inst2.id } };
        
        const shareData = getShareableState();
        
        // Legacy format
        const legacyJson = JSON.stringify(shareData);
        const legacyCompressed = LZString.compressToEncodedURIComponent(legacyJson);
        
        // Compact format
        const compact = encodeCompactState(shareData);
        const compactJson = JSON.stringify(compact);
        const compactCompressed = LZString.compressToEncodedURIComponent(compactJson);
        
        TestRunner.assertTrue(compactCompressed.length < legacyCompressed.length,
            `Compact (${compactCompressed.length}) should be shorter than legacy (${legacyCompressed.length})`);
    });
    
    TestRunner.test('Share link works with summer month groups', () => {
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
        
        const link = generateShareUrl();
        const encodedData = link.split('?s2=')[1];
        const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
        const compact = JSON.parse(decoded);
        const restored = decodeCompactState(compact);
        
        TestRunner.assertEqual(restored.month, 6);
        TestRunner.assertEqual(restored.instructors.length, 2);
        TestRunner.assertEqual(restored.schedule['2025-07-07'].children.instructorId, inst1.id);
        TestRunner.assertEqual(restored.schedule['2025-07-07'].adults.instructorId, inst2.id);
        TestRunner.assertEqual(restored.schedule['2025-07-07'].children.description, 'Kids class');
    });
    
    TestRunner.test('Share link works with August 4-group structure', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 7; // August (new 4-group structure)
        state.currentYear = 2025;
        state.classDays = [1, 4, 6];
        
        const inst1 = addInstructor('Aug Inst 1', ['beginners'], ['2025-08-04']);
        const inst2 = addInstructor('Aug Inst 2', ['kids'], ['2025-08-04']);
        const inst3 = addInstructor('Aug Inst 3', ['redGreen'], ['2025-08-04']);
        const inst4 = addInstructor('Aug Inst 4', ['blueBlack'], ['2025-08-04']);
        state.schedule['2025-08-04'] = {
            beginners: { instructorId: inst1.id, description: 'Beginners class' },
            kids: { instructorId: inst2.id, description: 'Kids class' },
            redGreen: { instructorId: inst3.id, description: 'Red-Green class' },
            blueBlack: { instructorId: inst4.id, description: 'Blue-Black class' }
        };
        
        const link = generateShareUrl();
        const encodedData = link.split('?s2=')[1];
        const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
        const compact = JSON.parse(decoded);
        const restored = decodeCompactState(compact);
        
        TestRunner.assertEqual(restored.month, 7);
        TestRunner.assertEqual(restored.instructors.length, 4);
        TestRunner.assertEqual(restored.schedule['2025-08-04'].beginners.instructorId, inst1.id);
        TestRunner.assertEqual(restored.schedule['2025-08-04'].kids.instructorId, inst2.id);
        TestRunner.assertEqual(restored.schedule['2025-08-04'].redGreen.instructorId, inst3.id);
        TestRunner.assertEqual(restored.schedule['2025-08-04'].blueBlack.instructorId, inst4.id);
        TestRunner.assertEqual(restored.schedule['2025-08-04'].kids.description, 'Kids class');
    });
    
    TestRunner.test('loadFromShareLink still works with legacy s param', () => {
        // Verify legacy format can be decoded via LZString
        const testState = {
            instructors: [{ id: 'shared-1', name: 'From Link', groups: ['adults'], daysOff: [], feedbackPoints: 0 }],
            schedule: { '2025-07-01': { adults: { instructorId: 'shared-1', description: 'Restored' } } },
            cancelledDays: {},
            classDays: [1, 4, 6],
            currentMonth: 6,
            currentYear: 2025
        };
        
        const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(testState));
        const decoded = LZString.decompressFromEncodedURIComponent(compressed);
        const parsed = JSON.parse(decoded);
        
        TestRunner.assertEqual(parsed.instructors[0].name, 'From Link');
        TestRunner.assertEqual(parsed.currentMonth, 6);
    });
    
    // ---- shortenUrl tests (with fetch mocking) ----

    const originalFetch = window.fetch;
    const originalWarn = console.warn;

    TestRunner.test('shortenUrl returns short URL on success', async () => {
        window.fetch = async () => ({
            ok: true,
            text: async () => 'https://da.gd/abc123'
        });

        const result = await shortenUrl('https://example.com/very/long/url');
        TestRunner.assertTrue(result.success);
        TestRunner.assertEqual(result.shortUrl, 'https://da.gd/abc123');
    });

    TestRunner.test('shortenUrl trims whitespace from response', async () => {
        window.fetch = async () => ({
            ok: true,
            text: async () => '  https://da.gd/abc123\n'
        });

        const result = await shortenUrl('https://example.com');
        TestRunner.assertEqual(result.shortUrl, 'https://da.gd/abc123');
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
        console.warn = originalWarn;
    });

    TestRunner.test('shortenUrl calls da.gd API with encoded URL', async () => {
        let capturedUrl = '';
        window.fetch = async (url) => {
            capturedUrl = url;
            return { ok: true, text: async () => 'https://da.gd/xyz' };
        };

        await shortenUrl('https://example.com/path?q=hello world');
        TestRunner.assertTrue(capturedUrl.includes('da.gd/s?url='));
        TestRunner.assertTrue(capturedUrl.includes(encodeURIComponent('https://example.com/path?q=hello world')));
    });

    // Restore fetch
    window.fetch = originalFetch;

    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
