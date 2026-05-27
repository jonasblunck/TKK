// ============================================
// TEST UTILITIES
// ============================================
// Shared test runner and helper functions

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
            const result = fn();
            if (result && typeof result.then === 'function') {
                // Async test - queue it for later execution
                this._asyncTests = this._asyncTests || [];
                this._asyncTests.push({ name, promise: result });
                return;
            }
            this.passed++;
            console.log(`  ✅ ${name}`);
        } catch (e) {
            this.failed++;
            console.error(`  ❌ ${name}`);
            console.error(`     Error: ${e.message}`);
        }
    },

    async runAsyncTests() {
        if (!this._asyncTests || this._asyncTests.length === 0) return;
        for (const { name, promise } of this._asyncTests) {
            try {
                await promise;
                this.passed++;
                console.log(`  ✅ ${name}`);
            } catch (e) {
                this.failed++;
                console.error(`  ❌ ${name}`);
                console.error(`     Error: ${e.message}`);
            }
        }
        this._asyncTests = [];
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
        state.deletedDefaultIds = [];
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
const silentShowToast = () => {};

// Suppress renderCalendar during tests
const silentRender = () => {};

// Export for browser - these will be set after app loads
if (typeof window !== 'undefined') {
    window.TestRunner = TestRunner;
    window.silentShowToast = silentShowToast;
    window.silentRender = silentRender;
    
    // Store original functions - will be set after app loads
    window.originalShowToast = typeof showToast === 'function' ? showToast : () => {};
    window.originalRenderCalendar = typeof renderCalendar === 'function' ? renderCalendar : () => {};
    window.originalRenderInstructorList = typeof renderInstructorList === 'function' ? renderInstructorList : () => {};
}
