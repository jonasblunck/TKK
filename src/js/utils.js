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
