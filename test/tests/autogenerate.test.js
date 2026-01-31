// ============================================
// AUTOGENERATE TESTS
// ============================================

function testAutogenerate() {
    TestRunner.suite('Auto-Generate Schedule');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    state.currentMonth = 0;
    state.currentYear = 2025;
    state.classDays = [1, 4, 6];  // Mon, Thu, Sat
    
    // Generate all class day dates for January 2025
    function getJanuary2025ClassDays() {
        const dates = [];
        for (let day = 1; day <= 31; day++) {
            const date = new Date(2025, 0, day);
            if ([1, 4, 6].includes(date.getDay())) {
                dates.push(`2025-01-${String(day).padStart(2, '0')}`);
            }
        }
        return dates;
    }
    
    TestRunner.test('generateSchedule assigns instructors to their groups', () => {
        const allClassDays = getJanuary2025ClassDays();
        
        const inst1 = addInstructor('Auto Inst 1', ['beginners'], allClassDays);
        const inst2 = addInstructor('Auto Inst 2', ['children'], allClassDays);
        const inst3 = addInstructor('Auto Inst 3', ['adults'], allClassDays);
        
        autoGenerateSchedule();
        
        // Check that some assignments were made
        const dates = Object.keys(state.schedule);
        TestRunner.assertTrue(dates.length > 0);
        
        // Check that at least one date has an assignment
        let hasAnyAssignment = false;
        for (const dateStr of dates) {
            const schedule = state.schedule[dateStr];
            if (schedule.beginners?.instructorId || 
                schedule.children?.instructorId || 
                schedule.adults?.instructorId) {
                hasAnyAssignment = true;
                break;
            }
        }
        TestRunner.assertTrue(hasAnyAssignment);
    });
    
    TestRunner.test('generateSchedule respects availability', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        state.classDays = [1, 4, 6];
        
        // Add instructor available only on specific dates (Mondays)
        const mondaysOnly = ['2025-01-06', '2025-01-13', '2025-01-20', '2025-01-27'];
        const inst = addInstructor('Mondays Only', ['beginners'], mondaysOnly);
        
        autoGenerateSchedule();
        
        // Check that instructor is only assigned on their available dates
        Object.entries(state.schedule).forEach(([dateStr, schedule]) => {
            if (schedule.beginners?.instructorId === inst.id) {
                TestRunner.assertTrue(mondaysOnly.includes(dateStr));
            }
        });
        
        TestRunner.assertTrue(true);  // Passes if no errors
    });
    
    TestRunner.test('generateSchedule skips cancelled days', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        state.classDays = [1, 4, 6];
        
        const allClassDays = getJanuary2025ClassDays();
        addInstructor('Test Inst', ['beginners', 'children', 'adults'], allClassDays);
        
        // Cancel a specific day
        state.cancelledDays['2025-01-06'] = true;  // A Monday
        
        autoGenerateSchedule();
        
        // Cancelled day should not have new assignments
        // (The slot will exist but instructorId should be null)
        const cancelledSchedule = state.schedule['2025-01-06'];
        TestRunner.assertTrue(
            cancelledSchedule === undefined || 
            (cancelledSchedule.beginners?.instructorId === null &&
             cancelledSchedule.children?.instructorId === null &&
             cancelledSchedule.adults?.instructorId === null)
        );
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
