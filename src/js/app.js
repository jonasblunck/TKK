// ============================================
// APP INITIALIZATION & EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load saved state from localStorage
    loadState();
    
    // Initial render
    renderInstructorList();
    renderCalendar();
    
    // Actions dropdown toggle
    const actionsDropdown = document.getElementById('btnActionsDropdown');
    const actionsMenu = document.getElementById('actionsMenu');
    
    actionsDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        actionsMenu.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        actionsMenu.classList.remove('active');
    });
    
    // Prevent dropdown from closing when clicking inside menu
    actionsMenu.addEventListener('click', (e) => {
        // Only keep open for checkbox toggle, close for buttons
        if (e.target.type !== 'checkbox') {
            actionsMenu.classList.remove('active');
        }
    });
    
    // Add instructor buttons
    document.getElementById('btnAddInstructor').addEventListener('click', openAddInstructorModal);
    document.getElementById('btnAddFirstInstructor')?.addEventListener('click', openAddInstructorModal);
    
    // Modal controls
    document.getElementById('btnCancelModal').addEventListener('click', closeModal);
    document.getElementById('instructorModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) closeModal();
    });
    
    // Form submission
    document.getElementById('instructorForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('instructorName').value.trim();
        const groups = Array.from(document.querySelectorAll('input[name="groups"]:checked'))
            .map(cb => cb.value);
        const availableDates = state.selectedDates;
        
        if (!name) {
            showToast('Please enter a name', 'error');
            return;
        }
        
        if (groups.length === 0) {
            showToast('Please select at least one group', 'error');
            return;
        }
        
        if (availableDates.length === 0) {
            showToast('Please select at least one available date', 'error');
            return;
        }
        
        if (state.editingInstructorId) {
            updateInstructor(state.editingInstructorId, name, groups, availableDates);
            showToast('Instructor updated', 'success');
        } else {
            addInstructor(name, groups, availableDates);
            showToast('Instructor added', 'success');
        }
        
        closeModal();
    });
    
    // Date picker navigation
    document.getElementById('btnDatePickerPrev').addEventListener('click', () => {
        state.datePickerMonth--;
        if (state.datePickerMonth < 0) {
            state.datePickerMonth = 11;
            state.datePickerYear--;
        }
        renderDatePicker();
    });
    
    document.getElementById('btnDatePickerNext').addEventListener('click', () => {
        state.datePickerMonth++;
        if (state.datePickerMonth > 11) {
            state.datePickerMonth = 0;
            state.datePickerYear++;
        }
        renderDatePicker();
    });
    
    // Calendar navigation
    document.getElementById('btnPrevMonth').addEventListener('click', () => {
        state.currentMonth--;
        if (state.currentMonth < 0) {
            state.currentMonth = 11;
            state.currentYear--;
        }
        renderCalendar();
        renderInstructorList();
    });
    
    document.getElementById('btnNextMonth').addEventListener('click', () => {
        state.currentMonth++;
        if (state.currentMonth > 11) {
            state.currentMonth = 0;
            state.currentYear++;
        }
        renderCalendar();
        renderInstructorList();
    });
    
    // Auto-generate schedule
    document.getElementById('btnAutoGenerate').addEventListener('click', () => {
        if (state.instructors.length === 0) {
            showToast('Add some instructors first', 'error');
            return;
        }
        autoGenerateSchedule();
    });
    
    // Clear schedule
    document.getElementById('btnClearSchedule').addEventListener('click', () => {
        if (confirm(`Clear all assignments for ${MONTH_NAMES[state.currentMonth]} ${state.currentYear}?\n\nThis will remove all instructor assignments but keep class descriptions.`)) {
            clearSchedule();
        }
    });
    
    // Export schedule as image
    document.getElementById('btnExport').addEventListener('click', exportScheduleAsImage);
    
    // Save state
    document.getElementById('btnSave').addEventListener('click', saveState);
    
    // Stats modal
    document.getElementById('btnStats').addEventListener('click', openStatsModal);
    document.getElementById('btnCloseStats').addEventListener('click', closeStatsModal);
    document.getElementById('statsModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) closeStatsModal();
    });
    
    // Help modal
    document.getElementById('btnHelp').addEventListener('click', openHelpModal);
    document.getElementById('btnCloseHelp').addEventListener('click', closeHelpModal);
    document.getElementById('helpModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) closeHelpModal();
    });
    
    // Class days configuration
    document.getElementById('btnConfigDays').addEventListener('click', openClassDaysModal);
    document.getElementById('btnCancelClassDays').addEventListener('click', closeClassDaysModal);
    document.getElementById('btnSaveClassDays').addEventListener('click', saveClassDays);
    document.getElementById('classDaysModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) closeClassDaysModal();
    });
    
    // Show all days toggle
    document.getElementById('toggleAllDays').addEventListener('change', (e) => {
        state.showAllDays = e.target.checked;
        renderCalendar();
    });
    
    // Description modal
    document.getElementById('btnCancelDescription').addEventListener('click', closeDescriptionModal);
    document.getElementById('descriptionModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) closeDescriptionModal();
    });
    
    document.getElementById('descriptionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('classDescription').value.trim();
        setClassDescription(state.editingDescriptionDate, state.editingDescriptionGroup, description);
        
        // Handle merge options
        const group = state.editingDescriptionGroup;
        const dateStr = state.editingDescriptionDate;
        const mergeCheck1 = document.getElementById('mergeCheck1');
        const mergeCheck2 = document.getElementById('mergeCheck2');
        
        let newMerges = [];
        
        if (group === 'beginners') {
            if (mergeCheck2.checked) {
                newMerges = ['all'];
            } else if (mergeCheck1.checked) {
                newMerges = ['beg-chi'];
            }
        } else if (group === 'children') {
            // Preserve beg-chi or all merges if they exist
            const current = getMerges(dateStr);
            if (current.includes('all')) {
                newMerges = ['all'];
            } else if (current.includes('beg-chi')) {
                newMerges = ['beg-chi'];
                if (mergeCheck1.checked) {
                    newMerges.push('chi-adu');
                }
            } else if (mergeCheck1.checked) {
                newMerges = ['chi-adu'];
            }
        }
        
        setMerges(dateStr, newMerges);
        
        showToast('Class details saved', 'success');
        closeDescriptionModal();
    });
});
