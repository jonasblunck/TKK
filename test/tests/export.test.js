// ============================================
// EXPORT FUNCTIONALITY TESTS
// ============================================

function testExportFunctionality() {
    TestRunner.suite('Export Functionality');
    
    TestRunner.resetStateForTest();
    
    window.renderCalendar = silentRender;
    window.renderInstructorList = silentRender;
    window.showToast = silentShowToast;
    
    state.currentMonth = 0;
    state.currentYear = 2025;
    
    TestRunner.test('prepareCalendarForExport hides surplus indicators', () => {
        // Create mock calendar container
        const mockCalendar = document.createElement('div');
        mockCalendar.id = 'test-calendar';
        mockCalendar.innerHTML = `
            <div class="surplus-indicator">👥 2</div>
            <div class="day-cell">Day content</div>
        `;
        document.body.appendChild(mockCalendar);
        
        const restore = prepareCalendarForExport({ includeFeedback: true });
        
        const indicator = mockCalendar.querySelector('.surplus-indicator');
        TestRunner.assertEqual(indicator.style.display, 'none');
        
        restore();
        document.body.removeChild(mockCalendar);
    });
    
    TestRunner.test('prepareCalendarForExport hides feedback points when option is false', () => {
        const mockCalendar = document.createElement('div');
        mockCalendar.id = 'test-calendar-fb';
        mockCalendar.innerHTML = `
            <div class="cell-feedback">⭐ 3</div>
            <div class="instructor-name">Test Instructor</div>
        `;
        document.body.appendChild(mockCalendar);
        
        const restore = prepareCalendarForExport({ includeFeedback: false });
        
        const feedbackPoints = mockCalendar.querySelector('.cell-feedback');
        TestRunner.assertEqual(feedbackPoints.style.display, 'none');
        
        restore();
        document.body.removeChild(mockCalendar);
    });
    
    TestRunner.test('prepareCalendarForExport shows feedback points when option is true', () => {
        const mockCalendar = document.createElement('div');
        mockCalendar.id = 'test-calendar-fb-show';
        mockCalendar.innerHTML = `
            <div class="cell-feedback">⭐ 3</div>
            <div class="instructor-name">Test Instructor</div>
        `;
        document.body.appendChild(mockCalendar);
        
        const restore = prepareCalendarForExport({ includeFeedback: true });
        
        const feedbackPoints = mockCalendar.querySelector('.cell-feedback');
        // When showing, display should not be 'none'
        TestRunner.assertTrue(feedbackPoints.style.display !== 'none');
        
        restore();
        document.body.removeChild(mockCalendar);
    });
    
    TestRunner.test('prepareCalendarForExport always hides surplus regardless of feedback option', () => {
        const mockCalendar = document.createElement('div');
        mockCalendar.id = 'test-calendar-surplus';
        mockCalendar.innerHTML = `
            <div class="surplus-indicator">👥 5</div>
        `;
        document.body.appendChild(mockCalendar);
        
        // Even with includeFeedback=true, surplus should be hidden
        const restore = prepareCalendarForExport({ includeFeedback: true });
        
        const indicator = mockCalendar.querySelector('.surplus-indicator');
        TestRunner.assertEqual(indicator.style.display, 'none');
        
        restore();
        document.body.removeChild(mockCalendar);
    });
    
    TestRunner.test('export handles calendar with no special elements', () => {
        const mockCalendar = document.createElement('div');
        mockCalendar.id = 'test-calendar-plain';
        mockCalendar.innerHTML = `
            <div class="day-cell">Just a day</div>
        `;
        document.body.appendChild(mockCalendar);
        
        // Should not throw
        let errorThrown = false;
        try {
            const restore = prepareCalendarForExport({ includeFeedback: false });
            restore();
        } catch (e) {
            errorThrown = true;
        }
        
        TestRunner.assertTrue(!errorThrown);
        
        document.body.removeChild(mockCalendar);
    });
    
    TestRunner.test('export handles multiple surplus indicators', () => {
        const mockCalendar = document.createElement('div');
        mockCalendar.id = 'test-calendar-multi';
        mockCalendar.innerHTML = `
            <div class="day-cell">
                <div class="surplus-indicator">👥 2</div>
            </div>
            <div class="day-cell">
                <div class="surplus-indicator">👥 3</div>
            </div>
            <div class="day-cell">
                <div class="surplus-indicator">👥 1</div>
            </div>
        `;
        document.body.appendChild(mockCalendar);
        
        const restore = prepareCalendarForExport({ includeFeedback: true });
        
        const indicators = mockCalendar.querySelectorAll('.surplus-indicator');
        indicators.forEach(indicator => {
            TestRunner.assertEqual(indicator.style.display, 'none');
        });
        
        restore();
        document.body.removeChild(mockCalendar);
    });
    
    TestRunner.test('export handles multiple feedback points', () => {
        const mockCalendar = document.createElement('div');
        mockCalendar.id = 'test-calendar-multi-fb';
        mockCalendar.innerHTML = `
            <div class="slot"><span class="cell-feedback">⭐ 1</span></div>
            <div class="slot"><span class="cell-feedback">⭐ 2</span></div>
            <div class="slot"><span class="cell-feedback">⭐ 3</span></div>
        `;
        document.body.appendChild(mockCalendar);
        
        const restore = prepareCalendarForExport({ includeFeedback: false });
        
        const feedbackPoints = mockCalendar.querySelectorAll('.cell-feedback');
        feedbackPoints.forEach(fp => {
            TestRunner.assertEqual(fp.style.display, 'none');
        });
        
        restore();
        document.body.removeChild(mockCalendar);
    });
    
    TestRunner.test('export preserves other calendar content', () => {
        const mockCalendar = document.createElement('div');
        mockCalendar.id = 'test-calendar-preserve';
        mockCalendar.innerHTML = `
            <div class="instructor-name">John Doe</div>
            <div class="surplus-indicator">👥 2</div>
            <div class="day-number">15</div>
        `;
        document.body.appendChild(mockCalendar);
        
        const restore = prepareCalendarForExport({ includeFeedback: false });
        
        // Other elements should be unchanged
        const name = mockCalendar.querySelector('.instructor-name');
        const dayNum = mockCalendar.querySelector('.day-number');
        
        TestRunner.assertEqual(name.textContent, 'John Doe');
        TestRunner.assertEqual(dayNum.textContent, '15');
        
        restore();
        document.body.removeChild(mockCalendar);
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.renderInstructorList = originalRenderInstructorList;
    window.showToast = originalShowToast;
}
