// ============================================
// MERGE LOGIC TESTS
// ============================================

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

    TestRunner.test('isGroupMerged supports red-green merged with blue-black', () => {
        setMerges('2026-08-17', ['m:redGreen:blueBlack']);
        const result = isGroupMerged('2026-08-17', 'blueBlack');
        TestRunner.assertTrue(result.merged);
        TestRunner.assertEqual(result.primary, 'redGreen');
    });

    TestRunner.test('setMergedGroupsForPrimary supports merging multiple groups to the right', () => {
        setMergedGroupsForPrimary('2026-08-06', 'kids', ['redGreen', 'blueBlack']);

        TestRunner.assertEqual(getMergeSpan('2026-08-06', 'kids'), 3);

        const rgResult = isGroupMerged('2026-08-06', 'redGreen');
        TestRunner.assertTrue(rgResult.merged);
        TestRunner.assertEqual(rgResult.primary, 'kids');

        const bbResult = isGroupMerged('2026-08-06', 'blueBlack');
        TestRunner.assertTrue(bbResult.merged);
        TestRunner.assertEqual(bbResult.primary, 'kids');

        TestRunner.assertEqual(
            getMergedGroupLabel('2026-08-06', 'kids'),
            'Kids + Red - Green + Blue - Black'
        );
    });

    TestRunner.test('legacy August merge tokens remain supported', () => {
        setMerges('2026-08-20', ['rg-bb']);
        const result = isGroupMerged('2026-08-20', 'blueBlack');
        TestRunner.assertTrue(result.merged);
        TestRunner.assertEqual(result.primary, 'redGreen');
    });

    TestRunner.test('openDescriptionModal shows merged group names in header', () => {
        const modal = document.createElement('div');
        modal.id = 'descriptionModal';
        modal.innerHTML = `
            <label id="descriptionLabel"></label>
            <textarea id="classDescription"></textarea>
            <textarea id="feedbackPoints"></textarea>
            <div id="mergeOptions"></div>
            <label id="mergeOption1"><input type="checkbox" id="mergeCheck1" value=""><span id="mergeLabel1"></span></label>
            <label id="mergeOption2"><input type="checkbox" id="mergeCheck2" value=""><span id="mergeLabel2"></span></label>
        `;
        document.body.appendChild(modal);

        setMergedGroupsForPrimary('2026-08-15', 'kids', ['redGreen', 'blueBlack']);
        openDescriptionModal('2026-08-15', 'kids');

        TestRunner.assertEqual(
            document.getElementById('descriptionLabel').textContent,
            'Kids + Red - Green + Blue - Black - August 15'
        );

        modal.remove();
    });
    
    window.renderCalendar = originalRenderCalendar;
    window.showToast = originalShowToast;
}
