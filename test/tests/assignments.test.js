// ============================================
// ASSIGNMENT LOGIC TESTS
// ============================================

function testAssignmentLogic() {
    TestRunner.suite('Assignment Logic');
    
    TestRunner.resetStateForTest();
    
    // Silence UI updates
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    TestRunner.test('assignInstructor creates schedule entry', () => {
        assignInstructor('2025-01-06', 'beginners', 'test-id-1');
        TestRunner.assertNotNull(state.schedule['2025-01-06']);
        TestRunner.assertEqual(state.schedule['2025-01-06'].beginners.instructorId, 'test-id-1');
    });
    
    TestRunner.test('assignInstructor preserves other slots', () => {
        assignInstructor('2025-01-06', 'adults', 'test-id-2');
        TestRunner.assertEqual(state.schedule['2025-01-06'].beginners.instructorId, 'test-id-1');
        TestRunner.assertEqual(state.schedule['2025-01-06'].adults.instructorId, 'test-id-2');
    });
    
    TestRunner.test('assignInstructorWithoutRender works silently', () => {
        assignInstructorWithoutRender('2025-01-07', 'children', 'test-id-3');
        TestRunner.assertEqual(state.schedule['2025-01-07'].children.instructorId, 'test-id-3');
    });
    
    TestRunner.test('unassignSlot clears instructor', () => {
        unassignSlot('2025-01-06', 'beginners');
        TestRunner.assertNull(state.schedule['2025-01-06'].beginners.instructorId);
    });
    
    TestRunner.test('unassignSlotWithoutRender works silently', () => {
        unassignSlotWithoutRender('2025-01-06', 'adults');
        TestRunner.assertNull(state.schedule['2025-01-06'].adults.instructorId);
    });
    
    TestRunner.test('getSlotData returns correct data', () => {
        state.schedule['2025-01-08'] = {
            beginners: { instructorId: 'abc', description: 'Test desc' },
            children: { instructorId: null, description: '' },
            adults: { instructorId: null, description: '' }
        };
        
        const data = getSlotData('2025-01-08', 'beginners');
        TestRunner.assertEqual(data.instructorId, 'abc');
        TestRunner.assertEqual(data.description, 'Test desc');
    });
    
    TestRunner.test('getSlotData returns default for missing date', () => {
        const data = getSlotData('2099-01-01', 'beginners');
        TestRunner.assertNull(data.instructorId);
        TestRunner.assertEqual(data.description, '');
    });
    
    TestRunner.test('setClassDescription sets description', () => {
        setClassDescription('2025-01-09', 'adults', 'Sparring session');
        TestRunner.assertEqual(state.schedule['2025-01-09'].adults.description, 'Sparring session');
    });
    
    // Restore
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
