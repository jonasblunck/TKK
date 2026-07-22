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

function testAutogenerateAugustGroups() {
    TestRunner.suite('Auto-Generate Schedule - August Groups');

    TestRunner.resetStateForTest();

    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;

    // Switch to August 2025 (month index 7) — uses kids, redGreen, blueBlack, beginners
    state.currentMonth = 7;
    state.currentYear = 2025;
    state.classDays = [1, 4]; // Mon, Thu

    function getAugust2025ClassDays() {
        const dates = [];
        for (let day = 1; day <= 31; day++) {
            const date = new Date(2025, 7, day);
            if ([1, 4].includes(date.getDay())) {
                dates.push(`2025-08-${String(day).padStart(2, '0')}`);
            }
        }
        return dates;
    }

    TestRunner.test('getGroupsForMonth returns August groups for month 7', () => {
        const groups = getGroupsForMonth(7);
        TestRunner.assertDeepEqual(groups, ['beginners', 'kids', 'redGreen', 'blueBlack']);
    });

    TestRunner.test('getGroupsForMonth returns pre-August groups for month 0', () => {
        const groups = getGroupsForMonth(0);
        TestRunner.assertDeepEqual(groups, ['beginners', 'children', 'adults']);
    });

    TestRunner.test('getGroupsForMonth returns summer groups for month 5 and 6', () => {
        TestRunner.assertDeepEqual(getGroupsForMonth(5), ['children', 'adults']);
        TestRunner.assertDeepEqual(getGroupsForMonth(6), ['children', 'adults']);
    });

    TestRunner.test('generateSchedule uses August groups (kids/redGreen/blueBlack) not children/adults', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 7;
        state.currentYear = 2025;
        state.classDays = [1, 4];

        const allClassDays = getAugust2025ClassDays();
        addInstructor('Aug Inst 1', ['beginners', 'kids'], allClassDays);
        addInstructor('Aug Inst 2', ['redGreen'], allClassDays);
        addInstructor('Aug Inst 3', ['blueBlack'], allClassDays);

        autoGenerateSchedule();

        // Schedule keys for August days should have August groups, not children/adults
        const augustDates = Object.keys(state.schedule).filter(d => d.startsWith('2025-08-'));
        TestRunner.assertTrue(augustDates.length > 0, 'Expected schedule entries for August');

        for (const dateStr of augustDates) {
            const slot = state.schedule[dateStr];
            // Should have August groups
            TestRunner.assertTrue('beginners' in slot, `${dateStr} missing beginners`);
            TestRunner.assertTrue('kids' in slot, `${dateStr} missing kids`);
            TestRunner.assertTrue('redGreen' in slot, `${dateStr} missing redGreen`);
            TestRunner.assertTrue('blueBlack' in slot, `${dateStr} missing blueBlack`);
            // Should NOT have old groups
            TestRunner.assertFalse('children' in slot, `${dateStr} should not have children`);
            TestRunner.assertFalse('adults' in slot, `${dateStr} should not have adults`);
        }
    });

    TestRunner.test('generateSchedule assigns August instructors only to their groups', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 7;
        state.currentYear = 2025;
        state.classDays = [1, 4];

        const allClassDays = getAugust2025ClassDays();
        const inst1 = addInstructor('Kids Only', ['kids'], allClassDays);
        const inst2 = addInstructor('RedGreen Only', ['redGreen'], allClassDays);

        autoGenerateSchedule();

        const augustDates = Object.keys(state.schedule).filter(d => d.startsWith('2025-08-'));
        for (const dateStr of augustDates) {
            const slot = state.schedule[dateStr];
            // inst1 should never be assigned to redGreen or blueBlack
            TestRunner.assertFalse(slot.redGreen?.instructorId === inst1.id,
                `${dateStr}: Kids-only instructor should not be in redGreen`);
            TestRunner.assertFalse(slot.blueBlack?.instructorId === inst1.id,
                `${dateStr}: Kids-only instructor should not be in blueBlack`);
            // inst2 should never be assigned to kids or blueBlack
            TestRunner.assertFalse(slot.kids?.instructorId === inst2.id,
                `${dateStr}: RedGreen-only instructor should not be in kids`);
            TestRunner.assertFalse(slot.blueBlack?.instructorId === inst2.id,
                `${dateStr}: RedGreen-only instructor should not be in blueBlack`);
        }
    });

    TestRunner.test('generateSchedule for January uses pre-August groups', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        state.classDays = [1];

        const mondays = ['2025-01-06', '2025-01-13', '2025-01-20', '2025-01-27'];
        addInstructor('Jan Inst', ['beginners', 'children', 'adults'], mondays);

        autoGenerateSchedule();

        const janDates = Object.keys(state.schedule).filter(d => d.startsWith('2025-01-'));
        TestRunner.assertTrue(janDates.length > 0, 'Expected January schedule entries');
        for (const dateStr of janDates) {
            const slot = state.schedule[dateStr];
            TestRunner.assertTrue('beginners' in slot, `${dateStr} missing beginners`);
            TestRunner.assertTrue('children' in slot, `${dateStr} missing children`);
            TestRunner.assertTrue('adults' in slot, `${dateStr} missing adults`);
            TestRunner.assertFalse('kids' in slot, `${dateStr} should not have kids`);
            TestRunner.assertFalse('redGreen' in slot, `${dateStr} should not have redGreen`);
            TestRunner.assertFalse('blueBlack' in slot, `${dateStr} should not have blueBlack`);
        }
    });

    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
