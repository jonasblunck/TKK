// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} active`;
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function exportScheduleAsImage() {
    const calendarElement = document.getElementById('calendarGrid');
    const monthName = MONTH_NAMES[state.currentMonth];
    const year = state.currentYear;
    
    showToast('Generating image...', 'success');
    
    html2canvas(calendarElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        logging: false
    }).then(canvas => {
        // Create download link
        const link = document.createElement('a');
        link.download = `schedule-${monthName}-${year}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showToast('Schedule exported!', 'success');
    }).catch(err => {
        console.error('Export failed:', err);
        showToast('Export failed. Try again.', 'error');
    });
}

// ============================================
// AVAILABLE INSTRUCTOR SURPLUS
// ============================================

/**
 * Get all instructors who are available on a given date but not yet assigned to any group
 * (either as main instructor or assistant).
 * @param {string} dateStr - Date in 'YYYY-MM-DD' format
 * @returns {Array} Array of instructor objects who are available but unassigned
 */
function getAvailableSurplusInstructors(dateStr) {
    // Get all instructor IDs that are assigned to any group on this date (main or assistant)
    const assignedIds = new Set();
    const daySchedule = state.schedule[dateStr];
    
    if (daySchedule) {
        for (const group of GROUPS) {
            const slotData = daySchedule[group];
            if (slotData?.instructorId) {
                assignedIds.add(slotData.instructorId);
            }
            // Also include assistants
            if (slotData?.assistants) {
                slotData.assistants.forEach(id => assignedIds.add(id));
            }
        }
    }
    
    // Find instructors who are available on this date but not assigned
    return state.instructors.filter(instructor => {
        // Check if instructor is available on this date
        const isAvailable = instructor.availableDates.includes(dateStr);
        // Check if instructor can teach at least one group
        const canTeach = instructor.groups.length > 0;
        // Check if instructor is not already assigned (main or assistant)
        const isNotAssigned = !assignedIds.has(instructor.id);
        
        return isAvailable && canTeach && isNotAssigned;
    });
}

/**
 * Get the count of surplus instructors for a given date.
 * @param {string} dateStr - Date in 'YYYY-MM-DD' format
 * @returns {number} Count of available but unassigned instructors
 */
function getSurplusInstructorCount(dateStr) {
    return getAvailableSurplusInstructors(dateStr).length;
}

/**
 * Highlight instructor cards in the sidebar for the given instructor IDs.
 * Hides instructors that are not in the surplus list.
 * @param {string} idsString - Comma-separated instructor IDs
 */
function highlightSurplusInstructors(idsString) {
    const ids = new Set(idsString.split(',').filter(id => id.trim()));
    
    // Show only the surplus instructors, hide others
    document.querySelectorAll('.instructor-card').forEach(card => {
        const instructorId = card.dataset.instructorId;
        if (ids.has(instructorId)) {
            card.classList.add('surplus-highlight');
            card.classList.remove('surplus-hidden');
        } else {
            card.classList.add('surplus-hidden');
            card.classList.remove('surplus-highlight');
        }
    });
}

/**
 * Clear all surplus instructor highlights and show all instructors.
 */
function clearSurplusHighlight() {
    document.querySelectorAll('.instructor-card').forEach(card => {
        card.classList.remove('surplus-highlight', 'surplus-hidden');
    });
}
