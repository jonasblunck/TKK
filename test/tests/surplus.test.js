// ============================================
// SURPLUS INSTRUCTOR CALCULATION TESTS
// ============================================

function testSurplusInstructors() {
    TestRunner.suite('Surplus Instructor Calculation');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    state.currentMonth = 0;
    state.currentYear = 2025;
    state.classDays = [1, 4, 6]; // Mon, Thu, Sat
    
    TestRunner.test('getSurplusInstructorCount returns 0 when all instructors assigned', () => {
        const targetDate = '2025-01-06'; // Monday
        const inst1 = addInstructor('Surplus1', ['beginners'], [targetDate]);
        const inst2 = addInstructor('Surplus2', ['children'], [targetDate]);
        const inst3 = addInstructor('Surplus3', ['adults'], [targetDate]);
        
        // Assign all instructors on a Monday (day 1)
        assignInstructor(targetDate, 'beginners', inst1.id);
        assignInstructor(targetDate, 'children', inst2.id);
        assignInstructor(targetDate, 'adults', inst3.id);
        
        const surplus = getSurplusInstructorCount(targetDate);
        TestRunner.assertEqual(surplus, 0);
    });
    
    TestRunner.test('getSurplusInstructorCount counts available instructors', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        state.classDays = [1, 4, 6];
        
        const targetDate = '2025-01-06'; // Monday
        
        // Add 3 instructors all available for beginners on the target date
        const inst1 = addInstructor('Avail1', ['beginners'], [targetDate]);
        const inst2 = addInstructor('Avail2', ['beginners'], [targetDate]);
        const inst3 = addInstructor('Avail3', ['beginners'], [targetDate]);
        
        // Assign only one instructor
        assignInstructor(targetDate, 'beginners', inst1.id);
        
        const surplus = getSurplusInstructorCount(targetDate);
        // 3 instructors total, 1 assigned = 2 surplus
        TestRunner.assertEqual(surplus, 2);
    });
    
    TestRunner.test('getAvailableSurplusInstructors returns correct instructors', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        state.classDays = [1, 4, 6];
        
        const targetDate = '2025-01-06';
        
        const inst1 = addInstructor('Main', ['beginners', 'children', 'adults'], [targetDate]);
        const inst2 = addInstructor('Surplus', ['beginners', 'children', 'adults'], [targetDate]);
        
        // Assign only inst1
        assignInstructor(targetDate, 'beginners', inst1.id);
        assignInstructor(targetDate, 'children', inst1.id);
        assignInstructor(targetDate, 'adults', inst1.id);
        
        const available = getAvailableSurplusInstructors(targetDate);
        
        // inst2 should be in the surplus list
        TestRunner.assertTrue(available.some(i => i.id === inst2.id));
        TestRunner.assertTrue(!available.some(i => i.id === inst1.id));
    });
    
    TestRunner.test('getSurplusInstructorCount respects availability dates', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        state.classDays = [1, 4, 6];
        
        const targetDate = '2025-01-06';
        const otherDate = '2025-01-07';
        
        // inst1 available on target date, inst2 not available on target date
        const inst1 = addInstructor('WorksMonday', ['beginners'], [targetDate]);
        const inst2 = addInstructor('NotMonday', ['beginners'], [otherDate]); // Available on different date
        
        const surplus = getSurplusInstructorCount(targetDate);
        
        // Only inst1 is available on target date, so surplus = 1
        TestRunner.assertEqual(surplus, 1);
    });
    
    TestRunner.test('getAvailableSurplusInstructors excludes assistants', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        state.classDays = [1, 4, 6];
        
        const targetDate = '2025-01-06';
        
        const main = addInstructor('MainInst', ['beginners'], [targetDate]);
        const assistant = addInstructor('AssistInst', ['beginners'], [targetDate]);
        const surplus = addInstructor('SurplusInst', ['beginners'], [targetDate]);
        
        assignInstructor(targetDate, 'beginners', main.id);
        addAssistant(targetDate, 'beginners', assistant.id);
        
        const available = getAvailableSurplusInstructors(targetDate);
        
        // Only surplus instructor should be available
        TestRunner.assertTrue(available.some(i => i.id === surplus.id));
        TestRunner.assertTrue(!available.some(i => i.id === main.id));
        TestRunner.assertTrue(!available.some(i => i.id === assistant.id));
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
