// ============================================
// STATISTICS TESTS
// ============================================

function testStatistics() {
    TestRunner.suite('Statistics Calculation');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    state.currentMonth = 0;
    state.currentYear = 2025;
    
    // Add instructors
    const inst1 = addInstructor('Instructor A', ['beginners', 'children', 'adults'], []);
    const inst2 = addInstructor('Instructor B', ['beginners', 'children'], []);
    
    // Add schedule data
    state.schedule['2025-01-06'] = {
        beginners: { instructorId: inst1.id, description: '' },
        children: { instructorId: inst2.id, description: '' },
        adults: { instructorId: inst1.id, description: '' }
    };
    state.schedule['2025-01-09'] = {
        beginners: { instructorId: inst2.id, description: '' },
        children: { instructorId: inst1.id, description: '' },
        adults: { instructorId: null, description: '' }
    };
    
    TestRunner.test('calculateStats counts assignments correctly', () => {
        const { stats, totalAssignments } = calculateStats();
        
        // Instructor A: 1 beginners, 1 children, 1 adults = 3 total
        TestRunner.assertEqual(stats[inst1.id].beginners, 1);
        TestRunner.assertEqual(stats[inst1.id].children, 1);
        TestRunner.assertEqual(stats[inst1.id].adults, 1);
        TestRunner.assertEqual(stats[inst1.id].total, 3);
        
        // Instructor B: 1 beginners, 1 children = 2 total
        TestRunner.assertEqual(stats[inst2.id].beginners, 1);
        TestRunner.assertEqual(stats[inst2.id].children, 1);
        TestRunner.assertEqual(stats[inst2.id].adults, 0);
        TestRunner.assertEqual(stats[inst2.id].total, 2);
        
        // Total assignments = 5
        TestRunner.assertEqual(totalAssignments, 5);
    });
    
    TestRunner.test('calculateStats counts unassigned slots', () => {
        const { unassignedSlots, daysInMonth } = calculateStats();
        // With classDays = [1, 4, 6] (Mon, Thu, Sat), January 2025 has 13 class days
        // Mondays: 6, 13, 20, 27 (4), Thursdays: 2, 9, 16, 23, 30 (5), Saturdays: 4, 11, 18, 25 (4)
        // Total possible slots = 13 days × 3 groups = 39
        // But only days with schedule entries are counted for assignments
        // Jan 6 (Mon) and Jan 9 (Thu) have assignments
        // So 13 - 2 = 11 days with no assignments × 3 groups = 33 unassigned
        // Plus 1 unassigned on Jan 9 (adults) = 34 unassigned
        const expectedUnassigned = (daysInMonth - 2) * GROUPS.length + 1;
        TestRunner.assertEqual(unassignedSlots, expectedUnassigned);
    });
    
    TestRunner.test('calculateStats handles merged groups', () => {
        // Add a merged day
        state.schedule['2025-01-11'] = {
            beginners: { instructorId: inst1.id, description: '' },
            children: { instructorId: null, description: '' },
            adults: { instructorId: inst2.id, description: '' },
            merges: ['beg-chi']
        };
        
        const { stats, mergedDays } = calculateStats();
        
        // Should count only beginners (not children due to merge)
        // inst1: +1 beginners from merged day
        TestRunner.assertEqual(stats[inst1.id].beginners, 2);
        TestRunner.assertEqual(mergedDays, 1);
    });
    
    TestRunner.test('calculateStats returns class days count as daysInMonth', () => {
        const { daysInMonth } = calculateStats();
        // With classDays = [1, 4, 6] (Mon, Thu, Sat), January 2025 has 13 class days
        TestRunner.assertEqual(daysInMonth, 13);
    });
    
    TestRunner.test('calculateStats only counts configured class days', () => {
        // Reset schedule for clean test
        state.schedule = {};
        state.cancelledDays = {};
        
        // Set class days to only Monday (1) and Wednesday (3)
        state.classDays = [1, 3];
        
        const { daysInMonth, unassignedSlots } = calculateStats();
        
        // January 2025: Mondays = 6, 13, 20, 27 (4 days), Wednesdays = 1, 8, 15, 22, 29 (5 days)
        // Total class days = 9
        TestRunner.assertEqual(daysInMonth, 9);
        
        // Unassigned slots = 9 days × 3 groups = 27
        TestRunner.assertEqual(unassignedSlots, 27);
    });
    
    TestRunner.test('calculateStats excludes cancelled days', () => {
        // Reset for clean test
        state.schedule = {};
        state.classDays = [1, 3]; // Monday and Wednesday
        
        // Cancel some days
        state.cancelledDays = {
            '2025-01-06': true,  // Monday
            '2025-01-08': true   // Wednesday
        };
        
        const { daysInMonth, unassignedSlots } = calculateStats();
        
        // 9 class days - 2 cancelled = 7 days
        TestRunner.assertEqual(daysInMonth, 7);
        
        // Unassigned slots = 7 days × 3 groups = 21
        TestRunner.assertEqual(unassignedSlots, 21);
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
