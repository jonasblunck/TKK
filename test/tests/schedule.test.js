// ============================================
// SCHEDULE TESTS (Cancel/Restore, Clear)
// ============================================

function testCancelRestoreDay() {
    TestRunner.suite('Cancel/Restore Day');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.showToast = silentShowToast;
    
    TestRunner.test('cancelDay adds date to cancelledDays', () => {
        cancelDay('2025-01-06');
        TestRunner.assertTrue(state.cancelledDays['2025-01-06']);
    });
    
    TestRunner.test('restoreDay removes date from cancelledDays', () => {
        restoreDay('2025-01-06');
        TestRunner.assertEqual(state.cancelledDays['2025-01-06'], undefined);
    });
    
    TestRunner.test('multiple days can be cancelled', () => {
        cancelDay('2025-01-06');
        cancelDay('2025-01-09');
        cancelDay('2025-01-11');
        TestRunner.assertTrue(state.cancelledDays['2025-01-06']);
        TestRunner.assertTrue(state.cancelledDays['2025-01-09']);
        TestRunner.assertTrue(state.cancelledDays['2025-01-11']);
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.showToast = originalShowToast;
}

function testClearSchedule() {
    TestRunner.suite('Clear Schedule');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    // Setup: Add data to January 2025
    state.currentMonth = 0;
    state.currentYear = 2025;
    
    // Add some schedule data
    state.schedule['2025-01-06'] = {
        beginners: { instructorId: 'test-1', description: 'Test focus' },
        children: { instructorId: 'test-2', description: '' },
        adults: { instructorId: null, description: '' },
        merges: ['beg-chi']
    };
    state.schedule['2025-01-09'] = {
        beginners: { instructorId: 'test-3', description: '' },
        children: { instructorId: null, description: '' },
        adults: { instructorId: 'test-4', description: 'Sparring' },
        merges: []
    };
    
    // Cancel a day
    state.cancelledDays['2025-01-11'] = true;
    state.cancelledDays['2025-01-13'] = true;
    
    // Keep data in another month (should not be affected)
    state.schedule['2025-02-03'] = {
        beginners: { instructorId: 'other-month', description: 'February data' },
        children: { instructorId: null, description: '' },
        adults: { instructorId: null, description: '' }
    };
    state.cancelledDays['2025-02-05'] = true;
    
    TestRunner.test('clearSchedule removes schedule data for current month', () => {
        clearSchedule();
        TestRunner.assertEqual(state.schedule['2025-01-06'], undefined);
        TestRunner.assertEqual(state.schedule['2025-01-09'], undefined);
    });
    
    TestRunner.test('clearSchedule restores cancelled days for current month', () => {
        TestRunner.assertEqual(state.cancelledDays['2025-01-11'], undefined);
        TestRunner.assertEqual(state.cancelledDays['2025-01-13'], undefined);
    });
    
    TestRunner.test('clearSchedule preserves other month data', () => {
        TestRunner.assertNotNull(state.schedule['2025-02-03']);
        TestRunner.assertEqual(state.schedule['2025-02-03'].beginners.instructorId, 'other-month');
    });
    
    TestRunner.test('clearSchedule preserves other month cancelled days', () => {
        TestRunner.assertTrue(state.cancelledDays['2025-02-05']);
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
