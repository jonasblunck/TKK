// ============================================
// TKK TEST RUNNER - Main Entry Point
// ============================================
// This file loads all individual test suites and provides the runAllTests function

// Declare original functions as global variables for test restoration
var originalRenderCalendar;
var originalRenderInstructorList;
var originalShowToast;

// Initialize on load
if (typeof window !== 'undefined') {
    originalRenderCalendar = window.renderCalendar || function() {};
    originalRenderInstructorList = window.renderInstructorList || function() {};
    originalShowToast = window.showToast || function() {};
}

// ============================================
// RUN ALL TESTS
// ============================================
function runAllTests() {
    console.clear();
    console.log('═══════════════════════════════════════════');
    console.log('     TKK Instructor Scheduler - Unit Tests');
    console.log('═══════════════════════════════════════════');
    console.log('');
    
    TestRunner.reset();
    
    // Run all test suites
    testUtilityFunctions();
    testInstructorManagement();
    testAssignmentLogic();
    testMergeLogic();
    testCancelRestoreDay();
    testClearSchedule();
    testStatistics();
    testStorage();
    testAutogenerate();
    testShareLink();
    testAssistantInstructors();
    testSurplusInstructors();
    testExportFunctionality();
    
    // Print summary
    TestRunner.summary();
}

// Auto-run if in browser with test runner
if (typeof window !== 'undefined' && window.runTests === undefined) {
    window.runTests = runAllTests;
}
