// ============================================
// ASSISTANT INSTRUCTORS TESTS
// ============================================

function testAssistantInstructors() {
    TestRunner.suite('Assistant Instructors');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    state.currentMonth = 0;
    state.currentYear = 2025;
    
    TestRunner.test('addAssistant adds assistant to slot', () => {
        const main = addInstructor('Main Instructor', ['beginners'], []);
        const assistant = addInstructor('Assistant Instructor', ['beginners'], []);
        
        assignInstructor('2025-01-06', 'beginners', main.id);
        addAssistant('2025-01-06', 'beginners', assistant.id);
        
        const assistants = getAssistants('2025-01-06', 'beginners');
        TestRunner.assertEqual(assistants.length, 1);
        TestRunner.assertEqual(assistants[0], assistant.id);
    });
    
    TestRunner.test('addAssistant prevents duplicate assistants', () => {
        const main = addInstructor('Main2', ['beginners'], []);
        const assistant = addInstructor('Assistant2', ['beginners'], []);
        
        assignInstructor('2025-01-07', 'beginners', main.id);
        addAssistant('2025-01-07', 'beginners', assistant.id);
        addAssistant('2025-01-07', 'beginners', assistant.id);  // Try adding again
        
        const assistants = getAssistants('2025-01-07', 'beginners');
        TestRunner.assertEqual(assistants.length, 1);
    });
    
    TestRunner.test('removeAssistant removes assistant from slot', () => {
        const main = addInstructor('Main3', ['beginners'], []);
        const assistant = addInstructor('Assistant3', ['beginners'], []);
        
        assignInstructor('2025-01-08', 'beginners', main.id);
        addAssistant('2025-01-08', 'beginners', assistant.id);
        removeAssistant('2025-01-08', 'beginners', assistant.id);
        
        const assistants = getAssistants('2025-01-08', 'beginners');
        TestRunner.assertEqual(assistants.length, 0);
    });
    
    TestRunner.test('getAssistants returns empty array for slot without assistants', () => {
        const main = addInstructor('Main4', ['beginners'], []);
        assignInstructor('2025-01-09', 'beginners', main.id);
        
        const assistants = getAssistants('2025-01-09', 'beginners');
        TestRunner.assertTrue(Array.isArray(assistants));
        TestRunner.assertEqual(assistants.length, 0);
    });
    
    TestRunner.test('multiple assistants can be added', () => {
        const main = addInstructor('Main5', ['beginners'], []);
        const asst1 = addInstructor('Assistant5a', ['beginners'], []);
        const asst2 = addInstructor('Assistant5b', ['beginners'], []);
        const asst3 = addInstructor('Assistant5c', ['beginners'], []);
        
        assignInstructor('2025-01-10', 'beginners', main.id);
        addAssistant('2025-01-10', 'beginners', asst1.id);
        addAssistant('2025-01-10', 'beginners', asst2.id);
        addAssistant('2025-01-10', 'beginners', asst3.id);
        
        const assistants = getAssistants('2025-01-10', 'beginners');
        TestRunner.assertEqual(assistants.length, 3);
    });
    
    TestRunner.test('assistants are preserved in state save/load', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        
        const main = addInstructor('MainPersist', ['beginners'], []);
        const assistant = addInstructor('AssistantPersist', ['beginners'], []);
        
        assignInstructor('2025-01-11', 'beginners', main.id);
        addAssistant('2025-01-11', 'beginners', assistant.id);
        
        saveState();
        
        // Clear and reload
        const savedData = localStorage.getItem('tkkState');
        const parsed = JSON.parse(savedData);
        
        TestRunner.assertTrue(parsed.schedule['2025-01-11'].beginners.assistants !== undefined);
        TestRunner.assertEqual(parsed.schedule['2025-01-11'].beginners.assistants.length, 1);
        TestRunner.assertEqual(parsed.schedule['2025-01-11'].beginners.assistants[0], assistant.id);
    });
    
    TestRunner.test('getSlotData returns assistants array', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        
        const main = addInstructor('MainSlot', ['children'], []);
        const assistant = addInstructor('AssistantSlot', ['children'], []);
        
        assignInstructor('2025-01-12', 'children', main.id);
        addAssistant('2025-01-12', 'children', assistant.id);
        
        const slotData = getSlotData('2025-01-12', 'children');
        TestRunner.assertTrue(slotData.assistants !== undefined);
        TestRunner.assertEqual(slotData.assistants.length, 1);
    });
    
    TestRunner.test('clearAssignment removes assistants too', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        
        const main = addInstructor('MainClear', ['adults'], []);
        const assistant = addInstructor('AssistantClear', ['adults'], []);
        
        assignInstructor('2025-01-13', 'adults', main.id);
        addAssistant('2025-01-13', 'adults', assistant.id);
        assignInstructor('2025-01-13', 'adults', null);  // Clear
        
        const assistants = getAssistants('2025-01-13', 'adults');
        TestRunner.assertEqual(assistants.length, 0);
    });
    
    TestRunner.test('assistant cannot be same as main instructor', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        
        const main = addInstructor('MainSame', ['beginners'], []);
        
        assignInstructor('2025-01-14', 'beginners', main.id);
        addAssistant('2025-01-14', 'beginners', main.id);  // Try adding main as assistant
        
        const assistants = getAssistants('2025-01-14', 'beginners');
        TestRunner.assertEqual(assistants.length, 0);
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
