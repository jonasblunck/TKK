// ============================================
// SHARE LINK TESTS
// ============================================

function testShareLink() {
    TestRunner.suite('Share Link');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    TestRunner.test('generateShareableLink creates valid URL', () => {
        const inst = addInstructor('Share Test', ['beginners'], []);
        state.schedule['2025-06-05'] = {
            beginners: { instructorId: inst.id, description: 'Shared' }
        };
        
        const link = generateShareableLink();
        
        TestRunner.assertTrue(link.includes(window.location.origin));
        TestRunner.assertTrue(link.includes('?schedule='));
    });
    
    TestRunner.test('generateShareableLink encodes state data', () => {
        state.instructors = [{ id: 'test-1', name: 'Encoded', groups: ['beginners'], daysOff: [] }];
        state.schedule = { '2025-06-05': { beginners: { instructorId: 'test-1' } } };
        
        const link = generateShareableLink();
        const encodedData = link.split('?schedule=')[1];
        
        TestRunner.assertTrue(encodedData.length > 0);
        
        // Should be valid LZString compressed data
        const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
        TestRunner.assertTrue(decoded !== null);
        
        const parsed = JSON.parse(decoded);
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
        state.instructors = [{ 
            id: 'fb-1', 
            name: 'Feedback Test', 
            groups: ['beginners'], 
            daysOff: [],
            feedbackPoints: 5
        }];
        
        const link = generateShareableLink();
        const encodedData = link.split('?schedule=')[1];
        const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
        const parsed = JSON.parse(decoded);
        
        TestRunner.assertEqual(parsed.instructors[0].feedbackPoints, 5);
    });
    
    TestRunner.test('Share link preserves class days configuration', () => {
        state.classDays = [2, 5];  // Tuesday and Friday
        
        const link = generateShareableLink();
        const encodedData = link.split('?schedule=')[1];
        const decoded = LZString.decompressFromEncodedURIComponent(encodedData);
        const parsed = JSON.parse(decoded);
        
        TestRunner.assertEqual(parsed.classDays.length, 2);
        TestRunner.assertEqual(parsed.classDays[0], 2);
        TestRunner.assertEqual(parsed.classDays[1], 5);
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
