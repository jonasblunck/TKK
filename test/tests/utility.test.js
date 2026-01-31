// ============================================
// UTILITY FUNCTION TESTS
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
