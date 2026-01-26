// ============================================
// UNIT TESTS
// ============================================
// Run tests by opening the browser console and calling runAllTests()

const TestRunner = {
    passed: 0,
    failed: 0,
    currentSuite: '',
    
    // Store original state for restoration
    originalState: null,
    
    // Mock localStorage
    mockStorage: {},
    
    reset() {
        this.passed = 0;
        this.failed = 0;
        this.currentSuite = '';
    },
    
    suite(name) {
        this.currentSuite = name;
        console.log(`\n📦 Test Suite: ${name}`);
        console.log('─'.repeat(40));
    },
    
    test(name, fn) {
        try {
            fn();
            this.passed++;
            console.log(`  ✅ ${name}`);
        } catch (e) {
            this.failed++;
            console.error(`  ❌ ${name}`);
            console.error(`     Error: ${e.message}`);
        }
    },
    
    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
    },
    
    assertDeepEqual(actual, expected, message = '') {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message} Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
    },
    
    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`${message} Expected truthy value, got ${condition}`);
        }
    },
    
    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(`${message} Expected falsy value, got ${condition}`);
        }
    },
    
    assertNull(value, message = '') {
        if (value !== null) {
            throw new Error(`${message} Expected null, got ${JSON.stringify(value)}`);
        }
    },
    
    assertNotNull(value, message = '') {
        if (value === null || value === undefined) {
            throw new Error(`${message} Expected non-null value, got ${value}`);
        }
    },
    
    summary() {
        console.log('\n' + '═'.repeat(40));
        console.log(`📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        console.log('═'.repeat(40));
        return this.failed === 0;
    },
    
    // State management helpers
    backupState() {
        this.originalState = JSON.parse(JSON.stringify({
            instructors: state.instructors,
            schedule: state.schedule,
            currentMonth: state.currentMonth,
            currentYear: state.currentYear,
            classDays: state.classDays,
            cancelledDays: state.cancelledDays,
            showAllDays: state.showAllDays
        }));
    },
    
    restoreState() {
        if (this.originalState) {
            state.instructors = this.originalState.instructors;
            state.schedule = this.originalState.schedule;
            state.currentMonth = this.originalState.currentMonth;
            state.currentYear = this.originalState.currentYear;
            state.classDays = this.originalState.classDays;
            state.cancelledDays = this.originalState.cancelledDays;
            state.showAllDays = this.originalState.showAllDays;
        }
    },
    
    // Reset state to clean for testing
    resetStateForTest() {
        state.instructors = [];
        state.schedule = {};
        state.cancelledDays = {};
        state.currentMonth = 0; // January
        state.currentYear = 2025;
        state.classDays = [1, 4, 6]; // Mon, Thu, Sat
        state.showAllDays = false;
    },
    
    // Mock localStorage
    mockLocalStorage() {
        this.mockStorage = {};
        const originalSetItem = localStorage.setItem.bind(localStorage);
        const originalGetItem = localStorage.getItem.bind(localStorage);
        const originalRemoveItem = localStorage.removeItem.bind(localStorage);
        
        localStorage.setItem = (key, value) => {
            this.mockStorage[key] = value;
        };
        localStorage.getItem = (key) => {
            return this.mockStorage[key] || null;
        };
        localStorage.removeItem = (key) => {
            delete this.mockStorage[key];
        };
        
        return () => {
            localStorage.setItem = originalSetItem;
            localStorage.getItem = originalGetItem;
            localStorage.removeItem = originalRemoveItem;
        };
    }
};

// Suppress toast notifications during tests
const originalShowToast = typeof showToast === 'function' ? showToast : () => {};
const silentShowToast = () => {};

// Suppress renderCalendar during tests
const originalRenderCalendar = typeof renderCalendar === 'function' ? renderCalendar : () => {};
const originalRenderInstructorList = typeof renderInstructorList === 'function' ? renderInstructorList : () => {};
const silentRender = () => {};

// ============================================
// TEST SUITES
// ============================================

function testUtilityFunctions() {
    TestRunner.suite('Utility Functions');
    
    TestRunner.test('formatDate formats correctly', () => {
        TestRunner.assertEqual(formatDate(2025, 0, 1), '2025-01-01');
        TestRunner.assertEqual(formatDate(2025, 11, 25), '2025-12-25');
        TestRunner.assertEqual(formatDate(2025, 5, 15), '2025-06-15');
    });
    
    TestRunner.test('getDaysInMonth returns correct days', () => {
        TestRunner.assertEqual(getDaysInMonth(2025, 0), 31); // January
        TestRunner.assertEqual(getDaysInMonth(2025, 1), 28); // February (non-leap)
        TestRunner.assertEqual(getDaysInMonth(2024, 1), 29); // February (leap year)
        TestRunner.assertEqual(getDaysInMonth(2025, 3), 30); // April
    });
    
    TestRunner.test('generateId creates unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        TestRunner.assertTrue(id1.length > 0);
        TestRunner.assertTrue(id1 !== id2);
    });
}

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
    
    // Restore render functions
    window.renderInstructorList = originalRenderInstructorList;
    window.renderCalendar = originalRenderCalendar;
    window.showToast = originalShowToast;
}

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

function testMergeLogic() {
    TestRunner.suite('Merge Logic');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.showToast = silentShowToast;
    
    TestRunner.test('getMerges returns empty array for no merges', () => {
        const merges = getMerges('2025-01-06');
        TestRunner.assertDeepEqual(merges, []);
    });
    
    TestRunner.test('setMerges stores merge configuration', () => {
        setMerges('2025-01-06', ['beg-chi']);
        TestRunner.assertDeepEqual(getMerges('2025-01-06'), ['beg-chi']);
    });
    
    TestRunner.test('isGroupMerged detects beg-chi merge for children', () => {
        setMerges('2025-01-07', ['beg-chi']);
        const result = isGroupMerged('2025-01-07', 'children');
        TestRunner.assertTrue(result.merged);
        TestRunner.assertEqual(result.primary, 'beginners');
    });
    
    TestRunner.test('isGroupMerged returns not merged for primary group', () => {
        const result = isGroupMerged('2025-01-07', 'beginners');
        TestRunner.assertFalse(result.merged);
    });
    
    TestRunner.test('isGroupMerged detects chi-adu merge for adults', () => {
        setMerges('2025-01-08', ['chi-adu']);
        const result = isGroupMerged('2025-01-08', 'adults');
        TestRunner.assertTrue(result.merged);
        TestRunner.assertEqual(result.primary, 'children');
    });
    
    TestRunner.test('isGroupMerged detects all-merge for children and adults', () => {
        setMerges('2025-01-09', ['all']);
        
        const childResult = isGroupMerged('2025-01-09', 'children');
        TestRunner.assertTrue(childResult.merged);
        TestRunner.assertEqual(childResult.primary, 'beginners');
        
        const adultResult = isGroupMerged('2025-01-09', 'adults');
        TestRunner.assertTrue(adultResult.merged);
        TestRunner.assertEqual(adultResult.primary, 'beginners');
    });
    
    TestRunner.test('getMergeSpan returns correct span for all-merge', () => {
        setMerges('2025-01-10', ['all']);
        TestRunner.assertEqual(getMergeSpan('2025-01-10', 'beginners'), 3);
    });
    
    TestRunner.test('getMergeSpan returns correct span for beg-chi', () => {
        setMerges('2025-01-11', ['beg-chi']);
        TestRunner.assertEqual(getMergeSpan('2025-01-11', 'beginners'), 2);
        TestRunner.assertEqual(getMergeSpan('2025-01-11', 'adults'), 1);
    });
    
    TestRunner.test('getMergeSpan returns 1 for non-merged groups', () => {
        TestRunner.assertEqual(getMergeSpan('2025-01-12', 'beginners'), 1);
    });
    
    TestRunner.test('getMergedGroupLabel returns correct label', () => {
        setMerges('2025-01-13', ['all']);
        TestRunner.assertEqual(getMergedGroupLabel('2025-01-13', 'beginners'), 'All Levels');
        
        setMerges('2025-01-14', ['beg-chi']);
        TestRunner.assertEqual(getMergedGroupLabel('2025-01-14', 'beginners'), 'Beginners + Children');
        
        setMerges('2025-01-15', ['chi-adu']);
        TestRunner.assertEqual(getMergedGroupLabel('2025-01-15', 'children'), 'Children + Adults');
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.showToast = originalShowToast;
}

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

function testStoragePersistence() {
    TestRunner.suite('Storage Persistence');
    
    const restoreMock = TestRunner.mockLocalStorage();
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    TestRunner.test('saveState saves to localStorage', () => {
        state.instructors = [{ id: 'test-1', name: 'Test', groups: ['beginners'], availableDates: [] }];
        state.schedule = { '2025-01-06': { beginners: { instructorId: 'test-1', description: '' } } };
        state.classDays = [1, 3, 5];
        state.cancelledDays = { '2025-01-09': true };
        
        saveState();
        
        TestRunner.assertNotNull(TestRunner.mockStorage[STORAGE_KEY]);
        
        const saved = JSON.parse(TestRunner.mockStorage[STORAGE_KEY]);
        TestRunner.assertEqual(saved.instructors.length, 1);
        TestRunner.assertEqual(saved.instructors[0].name, 'Test');
        TestRunner.assertDeepEqual(saved.classDays, [1, 3, 5]);
        TestRunner.assertTrue(saved.cancelledDays['2025-01-09']);
    });
    
    TestRunner.test('loadState restores from localStorage', () => {
        // Clear state first
        state.instructors = [];
        state.schedule = {};
        state.classDays = [];
        state.cancelledDays = {};
        
        loadState();
        
        // Should have saved instructor plus all default instructors merged in
        const testInstructor = state.instructors.find(i => i.name === 'Test');
        TestRunner.assertNotNull(testInstructor, 'Saved instructor should be restored');
        TestRunner.assertEqual(testInstructor.name, 'Test');
        TestRunner.assertDeepEqual(state.classDays, [1, 3, 5]);
        TestRunner.assertTrue(state.cancelledDays['2025-01-09']);
    });
    
    TestRunner.test('loadState handles missing data gracefully', () => {
        TestRunner.mockStorage = {}; // Clear mock storage
        
        state.instructors = [{ id: 'existing', name: 'Existing', groups: [], availableDates: [] }];
        
        loadState();
        
        // Should keep existing data if nothing in storage
        TestRunner.assertEqual(state.instructors[0].name, 'Existing');
    });
    
    TestRunner.test('loadState handles corrupted data', () => {
        TestRunner.mockStorage[STORAGE_KEY] = 'not valid json {{{';
        
        // Should not throw
        let errorThrown = false;
        try {
            loadState();
        } catch (e) {
            errorThrown = true;
        }
        TestRunner.assertFalse(errorThrown);
    });
    
    TestRunner.test('loadState includes new default instructors not in saved data', () => {
        // Simulate old localStorage data that doesn't include a newly added instructor (e.g., Mike)
        // This tests the case where an instructor was added to the default list after the user saved their data
        const oldSavedData = {
            instructors: [
                { id: 'default-1', name: 'JonasB', groups: [], availableDates: [] },
                { id: 'default-2', name: 'JonasS', groups: [], availableDates: [] },
                { id: 'default-3', name: 'Björn', groups: [], availableDates: [] },
                { id: 'default-4', name: 'Daniel', groups: [], availableDates: [] },
                { id: 'default-5', name: 'Stoffe', groups: [], availableDates: [] },
                { id: 'default-6', name: 'Ida', groups: [], availableDates: [] },
                { id: 'default-7', name: 'Ola', groups: [], availableDates: [] }
                // Note: Mike (default-8) is missing - simulating old data before Mike was added
            ],
            schedule: {},
            classDays: [1, 4, 6],
            cancelledDays: {}
        };
        
        TestRunner.mockStorage[STORAGE_KEY] = JSON.stringify(oldSavedData);
        
        // Clear current state
        state.instructors = [];
        
        loadState();
        
        // Check that Mike is present after loading
        const mike = state.instructors.find(i => i.name === 'Mike');
        TestRunner.assertNotNull(mike, 'New default instructor Mike should be present after loading old data');
        
        // Also verify that existing instructors are still there
        const jonasB = state.instructors.find(i => i.name === 'JonasB');
        TestRunner.assertNotNull(jonasB, 'Existing instructor JonasB should still be present');
        
        // Verify we have all 8 instructors
        TestRunner.assertEqual(state.instructors.length, 8, 'Should have all 8 instructors including new ones');
    });
    
    restoreMock();
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}

function testAutoGenerate() {
    TestRunner.suite('Auto Generate Schedule');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    state.currentMonth = 0; // January
    state.currentYear = 2025;
    state.classDays = [1, 4, 6]; // Mon, Thu, Sat
    
    // Add instructors with different availability
    const inst1 = addInstructor('Full Time', ['beginners', 'children', 'adults'], 
        ['2025-01-02', '2025-01-04', '2025-01-06', '2025-01-09', '2025-01-11', '2025-01-13', '2025-01-16', '2025-01-18', '2025-01-20', '2025-01-23', '2025-01-25', '2025-01-27', '2025-01-30']);
    const inst2 = addInstructor('Beginners Only', ['beginners'], 
        ['2025-01-06', '2025-01-09', '2025-01-11', '2025-01-13']);
    const inst3 = addInstructor('Adults Only', ['adults'], 
        ['2025-01-04', '2025-01-06', '2025-01-09', '2025-01-11']);
    
    TestRunner.test('autoGenerateSchedule fills schedule slots', () => {
        autoGenerateSchedule();
        
        // Check that some slots are filled
        let filledSlots = 0;
        for (const dateStr in state.schedule) {
            if (dateStr.startsWith('2025-01')) {
                for (const group of GROUPS) {
                    if (state.schedule[dateStr][group]?.instructorId) {
                        filledSlots++;
                    }
                }
            }
        }
        
        TestRunner.assertTrue(filledSlots > 0, 'Should have filled at least some slots');
    });
    
    TestRunner.test('autoGenerateSchedule respects instructor groups', () => {
        // inst2 should only be assigned to beginners
        for (const dateStr in state.schedule) {
            if (dateStr.startsWith('2025-01')) {
                const children = state.schedule[dateStr]?.children?.instructorId;
                const adults = state.schedule[dateStr]?.adults?.instructorId;
                
                if (children === inst2.id) {
                    TestRunner.assertTrue(false, 'Beginners-only instructor assigned to children');
                }
                if (adults === inst2.id) {
                    TestRunner.assertTrue(false, 'Beginners-only instructor assigned to adults');
                }
            }
        }
        TestRunner.assertTrue(true);
    });
    
    TestRunner.test('autoGenerateSchedule respects cancelled days', () => {
        TestRunner.resetStateForTest();
        state.currentMonth = 0;
        state.currentYear = 2025;
        
        addInstructor('Test', ['beginners', 'children', 'adults'], 
            ['2025-01-06', '2025-01-09', '2025-01-11']);
        
        // Cancel a day
        state.cancelledDays['2025-01-06'] = true;
        
        autoGenerateSchedule();
        
        // 2025-01-06 should not have assignments from auto-generate
        const dayData = state.schedule['2025-01-06'];
        // After auto-generate, cancelled days shouldn't get new assignments
        // (the schedule entry may exist but without instructor assignments)
        if (dayData) {
            TestRunner.assertNull(dayData.beginners?.instructorId);
        }
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}

// ============================================
// SHARE LINK TESTS
// ============================================

function testShareLink() {
    TestRunner.suite('Share Link Functionality');
    
    TestRunner.test('LZString compresses and decompresses correctly', () => {
        const original = '{"instructors":[{"id":"1","name":"Test"}],"schedule":{},"classDays":[1,4,6]}';
        const compressed = LZString.compressToEncodedURIComponent(original);
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        TestRunner.assertEqual(decompressed, original);
    });
    
    TestRunner.test('LZString compression reduces size', () => {
        const original = '{"instructors":[{"id":"1","name":"Test Instructor","groups":["beginners","children"],"availableDates":["2025-01-01","2025-01-02","2025-01-03","2025-01-04","2025-01-05"]}],"schedule":{"2025-01-01":{"beginners":{"instructorId":"1"}}},"classDays":[1,4,6],"cancelledDays":{}}';
        const compressed = LZString.compressToEncodedURIComponent(original);
        TestRunner.assertTrue(compressed.length < original.length, 'Compressed should be smaller');
    });
    
    TestRunner.test('getShareableState returns current month data only', () => {
        state.currentMonth = 0; // January
        state.currentYear = 2025;
        state.instructors = [
            { id: '1', name: 'Test', groups: ['beginners'], availableDates: [] },
            { id: '2', name: 'Unused', groups: ['adults'], availableDates: [] }
        ];
        state.schedule = { 
            '2025-01-01': { beginners: { instructorId: '1' } },
            '2025-02-01': { beginners: { instructorId: '2' } } // Different month - should be excluded
        };
        state.classDays = [1, 4];
        state.cancelledDays = { 
            '2025-01-02': true,
            '2025-02-03': true // Different month - should be excluded
        };
        
        const shareData = getShareableState();
        
        // Should include month and year
        TestRunner.assertEqual(shareData.month, 0);
        TestRunner.assertEqual(shareData.year, 2025);
        
        // Should only include January schedule
        TestRunner.assertTrue('2025-01-01' in shareData.schedule);
        TestRunner.assertFalse('2025-02-01' in shareData.schedule);
        
        // Should only include January cancelled days
        TestRunner.assertTrue('2025-01-02' in shareData.cancelledDays);
        TestRunner.assertFalse('2025-02-03' in shareData.cancelledDays);
        
        // Should only include instructors assigned this month
        TestRunner.assertEqual(shareData.instructors.length, 1);
        TestRunner.assertEqual(shareData.instructors[0].name, 'Test');
        
        // Should have viewOnly flag
        TestRunner.assertTrue(shareData.viewOnly);
    });
    
    TestRunner.test('generateShareUrl creates valid URL with query param', () => {
        state.currentMonth = 0;
        state.currentYear = 2025;
        state.instructors = [{ id: '1', name: 'Test', groups: [], availableDates: [] }];
        state.schedule = {};
        state.classDays = [1, 4, 6];
        state.cancelledDays = {};
        
        const url = generateShareUrl();
        TestRunner.assertTrue(url.includes('?s='), 'URL should contain ?s= query parameter');
    });
    
    TestRunner.test('Share URL can be decoded back to original state', () => {
        state.currentMonth = 0;
        state.currentYear = 2025;
        state.instructors = [{ id: '1', name: 'ShareTest', groups: ['beginners'], availableDates: ['2025-01-01'] }];
        state.schedule = { '2025-01-01': { beginners: { instructorId: '1', description: 'Test class' } } };
        state.classDays = [1, 4, 6];
        state.cancelledDays = { '2025-01-03': true };
        
        const url = generateShareUrl();
        const paramData = url.split('?s=')[1];
        const decompressed = LZString.decompressFromEncodedURIComponent(paramData);
        const parsed = JSON.parse(decompressed);
        
        TestRunner.assertEqual(parsed.month, 0);
        TestRunner.assertEqual(parsed.year, 2025);
        TestRunner.assertEqual(parsed.instructors[0].name, 'ShareTest');
        TestRunner.assertEqual(parsed.schedule['2025-01-01'].beginners.description, 'Test class');
        TestRunner.assertEqual(parsed.classDays.length, 3);
        TestRunner.assertTrue('2025-01-03' in parsed.cancelledDays);
        TestRunner.assertTrue(parsed.viewOnly);
    });
}

// ============================================
// MAIN TEST RUNNER
// ============================================

function runAllTests() {
    console.clear();
    console.log('🧪 Running Unit Tests...\n');
    
    TestRunner.reset();
    TestRunner.backupState();
    
    try {
        testUtilityFunctions();
        testInstructorManagement();
        testAssignmentLogic();
        testMergeLogic();
        testCancelRestoreDay();
        testClearSchedule();
        testStatistics();
        testStoragePersistence();
        testAutoGenerate();
        testShareLink();
    } finally {
        TestRunner.restoreState();
    }
    
    const success = TestRunner.summary();
    
    if (success) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️ Some tests failed. Please review the errors above.');
    }
    
    return success;
}

// Export for console access
window.runAllTests = runAllTests;
window.TestRunner = TestRunner;
