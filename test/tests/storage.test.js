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
        const instructor = addInstructor('Storage Test', ['beginners'], []);
        state.schedule['2025-06-05'] = {
            beginners: { instructorId: instructor.id, description: 'Test' }
        };
        
        saveState();
        
        const saved = localStorage.getItem('tkkState');
        TestRunner.assertTrue(saved !== null);
        
        const parsed = JSON.parse(saved);
        TestRunner.assertEqual(parsed.instructors.length, state.instructors.length);
        TestRunner.assertTrue(parsed.schedule['2025-06-05'] !== undefined);
    });
    
    TestRunner.test('loadState restores data from localStorage', () => {
        const testData = {
            instructors: [{ id: 'test-1', name: 'Loaded Instructor', groups: ['beginners'], daysOff: [], feedbackPoints: 0, createdAt: Date.now() }],
            schedule: { '2025-06-10': { beginners: { instructorId: 'test-1', description: 'Loaded' } } },
            cancelledDays: { '2025-06-15': true },
            currentMonth: 5,
            currentYear: 2025,
            classDays: [1, 4, 6]
        };
        
        localStorage.setItem('tkkState', JSON.stringify(testData));
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
