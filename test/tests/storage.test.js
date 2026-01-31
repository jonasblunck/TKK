// ============================================
// STORAGE TESTS
// ============================================

function testStorage() {
    TestRunner.suite('Storage Persistence');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    state.currentMonth = 5;
    state.currentYear = 2025;
    
    TestRunner.test('saveState stores data in localStorage', () => {
        // Clear localStorage first to ensure clean test
        localStorage.removeItem(STORAGE_KEY);
        TestRunner.resetStateForTest();
        state.currentMonth = 5;
        state.currentYear = 2025;
        
        const instructor = addInstructor('Storage Test', ['beginners'], ['2025-06-05']);
        state.schedule['2025-06-05'] = {
            beginners: { instructorId: instructor.id, description: 'Test' }
        };
        
        saveState();
        
        const saved = localStorage.getItem(STORAGE_KEY);
        TestRunner.assertTrue(saved !== null);
        
        const parsed = JSON.parse(saved);
        // Check that our instructor was saved
        const foundInstructor = parsed.instructors.find(i => i.name === 'Storage Test');
        TestRunner.assertTrue(foundInstructor !== undefined);
        TestRunner.assertTrue(parsed.schedule['2025-06-05'] !== undefined);
    });
    
    TestRunner.test('loadState restores data from localStorage', () => {
        // Clear state first
        TestRunner.resetStateForTest();
        state.deletedDefaultIds = [];
        
        // Mark all defaults as deleted so we only get our test instructor
        const testData = {
            instructors: [{ id: 'test-1', name: 'Loaded Instructor', groups: ['beginners'], availableDates: [], feedbackPoints: 0 }],
            schedule: { '2025-06-10': { beginners: { instructorId: 'test-1', description: 'Loaded' } } },
            cancelledDays: { '2025-06-15': true },
            currentMonth: 5,
            currentYear: 2025,
            classDays: [1, 4, 6],
            deletedDefaultIds: DEFAULT_INSTRUCTORS.map(i => i.id) // Mark all defaults as deleted
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(testData));
        loadState();
        
        TestRunner.assertEqual(state.instructors.length, 1);
        TestRunner.assertEqual(state.instructors[0].name, 'Loaded Instructor');
        TestRunner.assertTrue(state.schedule['2025-06-10'] !== undefined);
        TestRunner.assertTrue(state.cancelledDays['2025-06-15'] === true);
    });
    
    TestRunner.test('loadState handles empty localStorage', () => {
        localStorage.removeItem('tkkState');
        
        // Should not throw
        let errorThrown = false;
        try {
            loadState();
        } catch (e) {
            errorThrown = true;
        }
        
        TestRunner.assertTrue(!errorThrown);
    });
    
    TestRunner.test('loadState handles corrupted data', () => {
        localStorage.setItem('tkkState', 'not-valid-json{');
        
        let errorThrown = false;
        try {
            loadState();
        } catch (e) {
            errorThrown = true;
        }
        
        // Should not throw - should handle gracefully
        TestRunner.assertTrue(!errorThrown);
    });
    
    TestRunner.test('loadState handles partial data', () => {
        localStorage.setItem('tkkState', JSON.stringify({ instructors: [] }));
        
        loadState();
        
        // Should have defaults for missing properties
        TestRunner.assertTrue(state.schedule !== undefined);
        TestRunner.assertTrue(state.cancelledDays !== undefined);
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
