// ============================================
// INSTRUCTOR MANAGEMENT TESTS
// ============================================

function testInstructorManagement() {
    TestRunner.suite('Instructor Management');
    
    TestRunner.resetStateForTest();
    
    // Temporarily silence UI updates
    window.renderInstructorList = silentRender;
    window.renderCalendar = silentRender;
    window.showToast = silentShowToast;
    
    TestRunner.test('addInstructor creates new instructor', () => {
        const instructor = addInstructor('Test User', ['beginners', 'adults'], ['2025-01-06']);
        TestRunner.assertNotNull(instructor);
        TestRunner.assertEqual(instructor.name, 'Test User');
        TestRunner.assertDeepEqual(instructor.groups, ['beginners', 'adults']);
        TestRunner.assertDeepEqual(instructor.availableDates, ['2025-01-06']);
        TestRunner.assertEqual(state.instructors.length, 1);
    });
    
    TestRunner.test('getInstructorById finds instructor', () => {
        const found = getInstructorById(state.instructors[0].id);
        TestRunner.assertNotNull(found);
        TestRunner.assertEqual(found.name, 'Test User');
    });
    
    TestRunner.test('getInstructorById returns undefined for non-existent id', () => {
        const found = getInstructorById('non-existent-id');
        TestRunner.assertEqual(found, undefined);
    });
    
    TestRunner.test('updateInstructor modifies instructor data', () => {
        const id = state.instructors[0].id;
        updateInstructor(id, 'Updated Name', ['children'], ['2025-01-07']);
        const instructor = getInstructorById(id);
        TestRunner.assertEqual(instructor.name, 'Updated Name');
        TestRunner.assertDeepEqual(instructor.groups, ['children']);
        TestRunner.assertDeepEqual(instructor.availableDates, ['2025-01-07']);
    });
    
    TestRunner.test('deleteInstructor removes instructor', () => {
        const id = state.instructors[0].id;
        deleteInstructor(id);
        TestRunner.assertEqual(state.instructors.length, 0);
        TestRunner.assertEqual(getInstructorById(id), undefined);
    });
    
    TestRunner.test('deleteInstructor clears instructor from schedule', () => {
        // Add instructor and assign to schedule
        const instructor = addInstructor('To Delete', ['beginners'], ['2025-01-06']);
        state.schedule['2025-01-06'] = {
            beginners: { instructorId: instructor.id, description: '' },
            children: { instructorId: null, description: '' },
            adults: { instructorId: null, description: '' }
        };
        
        deleteInstructor(instructor.id);
        TestRunner.assertNull(state.schedule['2025-01-06'].beginners.instructorId);
    });
    
    TestRunner.test('deleteInstructor clears instructor from August 4-group schedule', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 7; // August
        state.currentYear = 2025;
        
        // Add instructor and assign to August groups
        const instructor = addInstructor('Aug Delete', ['kids', 'blueBlack'], ['2025-08-04']);
        state.schedule['2025-08-04'] = {
            beginners: { instructorId: null, description: '' },
            kids: { instructorId: instructor.id, description: '' },
            redGreen: { instructorId: null, description: '' },
            blueBlack: { instructorId: instructor.id, description: '', assistants: [instructor.id] }
        };
        
        deleteInstructor(instructor.id);
        
        // Should be cleared from both groups and from assistants
        TestRunner.assertNull(state.schedule['2025-08-04'].kids.instructorId);
        TestRunner.assertNull(state.schedule['2025-08-04'].blueBlack.instructorId);
        TestRunner.assertEqual(state.schedule['2025-08-04'].blueBlack.assistants.length, 0);
    });
    
    // Restore render functions
    window.renderInstructorList = originalRenderInstructorList;
    window.renderCalendar = originalRenderCalendar;
    window.showToast = originalShowToast;
}
