// ============================================
// MODAL FUNCTIONS
// ============================================

function openAddInstructorModal() {
    state.editingInstructorId = null;
    state.selectedDates = [];
    
    // Sync date picker to current calendar view
    state.datePickerMonth = parseInt(state.currentMonth, 10);
    state.datePickerYear = parseInt(state.currentYear, 10);
    
    document.getElementById('modalTitle').textContent = 'Add Instructor';
    document.getElementById('instructorName').value = '';
    document.querySelectorAll('input[name="groups"]').forEach(cb => cb.checked = false);
    
    renderDatePicker();
    document.getElementById('instructorModal').classList.add('active');
}

function openEditInstructorModal(id) {
    const instructor = getInstructorById(id);
    if (!instructor) return;
    
    state.editingInstructorId = id;
    state.selectedDates = [...instructor.availableDates];
    
    // Sync date picker to current calendar view
    state.datePickerMonth = parseInt(state.currentMonth, 10);
    state.datePickerYear = parseInt(state.currentYear, 10);
    
    document.getElementById('modalTitle').textContent = 'Edit Instructor';
    document.getElementById('instructorName').value = instructor.name;
    document.querySelectorAll('input[name="groups"]').forEach(cb => {
        cb.checked = instructor.groups.includes(cb.value);
    });
    
    renderDatePicker();
    document.getElementById('instructorModal').classList.add('active');
}

function closeModal() {
    document.getElementById('instructorModal').classList.remove('active');
}

function toggleDateSelection(dateStr) {
    const index = state.selectedDates.indexOf(dateStr);
    if (index === -1) {
        state.selectedDates.push(dateStr);
    } else {
        state.selectedDates.splice(index, 1);
    }
    renderDatePicker();
}

// ============================================
// DESCRIPTION MODAL FUNCTIONS
// ============================================

function openDescriptionModal(dateStr, group) {
    state.editingDescriptionDate = dateStr;
    state.editingDescriptionGroup = group;
    
    const date = new Date(dateStr);
    const monthName = MONTH_NAMES[date.getMonth()];
    const day = date.getDate();
    
    document.getElementById('descriptionLabel').textContent = 
        `${GROUP_LABELS[group]} - ${monthName} ${day}`;
    
    const slotData = getSlotData(dateStr, group);
    document.getElementById('classDescription').value = slotData.description || '';
    document.getElementById('feedbackPoints').value = slotData.feedbackPoints || '';
    
    // Setup merge options based on groups to the right of the selected group
    const mergeOptionsDiv = document.getElementById('mergeOptions');
    const mergeOption1 = document.getElementById('mergeOption1');
    const mergeOption2 = document.getElementById('mergeOption2');
    const mergeCheck1 = document.getElementById('mergeCheck1');
    const mergeCheck2 = document.getElementById('mergeCheck2');
    const mergeLabel1 = document.getElementById('mergeLabel1');
    const mergeLabel2 = document.getElementById('mergeLabel2');

    const groups = getGroupsForDate(dateStr);
    const currentIndex = groups.indexOf(group);
    const rightGroups = currentIndex >= 0 ? groups.slice(currentIndex + 1) : [];
    const currentMergedGroups = getMergedGroupsForPrimary(dateStr, group);
    
    // Reset
    mergeOption1.style.display = 'none';
    mergeOption2.style.display = 'none';
    mergeCheck1.value = '';
    mergeCheck2.value = '';
    mergeCheck1.checked = false;
    mergeCheck2.checked = false;

    if (rightGroups.length > 0) {
        mergeOptionsDiv.style.display = 'block';

        const firstRightGroup = rightGroups[0];
        mergeOption1.style.display = 'flex';
        mergeCheck1.value = firstRightGroup;
        mergeLabel1.textContent = `Merge with ${GROUP_LABELS[firstRightGroup]}`;
        mergeCheck1.checked = currentMergedGroups.includes(firstRightGroup);

        if (rightGroups.length > 1) {
            mergeOption2.style.display = 'flex';
            mergeCheck2.value = rightGroups.join(',');
            mergeLabel2.textContent = `Merge with all to the right (${rightGroups.map(g => GROUP_LABELS[g]).join(' + ')})`;
            mergeCheck2.checked = rightGroups.every(g => currentMergedGroups.includes(g));
        }
    } else {
        mergeOptionsDiv.style.display = 'none';
    }

    function syncMergeCheckboxState() {
        const allRightSelected = mergeOption2.style.display !== 'none' && mergeCheck2.checked;

        if (allRightSelected) {
            mergeCheck1.checked = true;
            mergeCheck1.disabled = true;
            mergeOption1.style.opacity = '0.65';
            mergeOption1.title = 'Automatically enabled when merging with all groups to the right';
        } else {
            mergeCheck1.disabled = false;
            mergeOption1.style.opacity = '';
            mergeOption1.title = '';
        }
    }

    mergeCheck2.onchange = syncMergeCheckboxState;
    syncMergeCheckboxState();
    
    document.getElementById('descriptionModal').classList.add('active');
    document.getElementById('classDescription').focus();
}

function closeDescriptionModal() {
    document.getElementById('descriptionModal').classList.remove('active');
    state.editingDescriptionDate = null;
    state.editingDescriptionGroup = null;
}

// ============================================
// STATISTICS MODAL FUNCTIONS
// ============================================

function calculateStats() {
    const year = state.currentYear;
    const month = state.currentMonth;
    const daysInMonth = getDaysInMonth(year, month);
    const groups = getGroupsForMonth(month);
    
    // Initialize stats for each instructor with dynamic groups
    const stats = {};
    state.instructors.forEach(instructor => {
        const instStats = {
            name: instructor.name,
            total: 0
        };
        // Initialize all possible groups to 0
        Object.keys(GROUP_LABELS).forEach(group => {
            instStats[group] = 0;
        });
        stats[instructor.id] = instStats;
    });
    
    // Count assignments
    let totalAssignments = 0;
    let unassignedSlots = 0;
    let mergedDays = 0;
    let classDaysCount = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        
        // Skip days that aren't class days
        if (!state.classDays.includes(dayOfWeek)) {
            continue;
        }
        
        // Skip cancelled days
        if (state.cancelledDays[dateStr]) {
            continue;
        }
        
        classDaysCount++;
        const merges = getMerges(dateStr);
        
        if (merges.length > 0) mergedDays++;
        
        const groups = getGroupsForMonth(month);
        for (const group of groups) {
            const mergeInfo = isGroupMerged(dateStr, group);
            if (mergeInfo.merged && groups.includes(mergeInfo.primary)) continue;
            
            const slotData = getSlotData(dateStr, group);
            if (slotData.instructorId) {
                if (stats[slotData.instructorId]) {
                    stats[slotData.instructorId][group]++;
                    stats[slotData.instructorId].total++;
                    totalAssignments++;
                }
            } else {
                unassignedSlots++;
            }
        }
    }
    
    return { stats, totalAssignments, unassignedSlots, mergedDays, daysInMonth: classDaysCount };
}

function openStatsModal() {
    const { stats, totalAssignments, unassignedSlots, mergedDays, daysInMonth } = calculateStats();
    const groups = getGroupsForMonth(state.currentMonth);
    
    document.getElementById('statsTitle').textContent = 
        `Instructor Statistics - ${MONTH_NAMES[state.currentMonth]} ${state.currentYear}`;
    
    // Build dynamic table headers
    const headerCells = groups.map(g => `<th class="col-${g}">${GROUP_LABELS[g]}</th>`).join('');
    
    // Build table HTML
    let html = `
        <table class="stats-table">
            <thead>
                <tr>
                    <th>Instructor</th>
                    ${headerCells}
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Sort by total sessions descending
    const sortedStats = Object.values(stats).sort((a, b) => b.total - a.total);
    
    // Initialize group totals dynamically
    const groupTotals = {};
    groups.forEach(g => groupTotals[g] = 0);
    
    sortedStats.forEach(s => {
        // Accumulate totals
        groups.forEach(g => groupTotals[g] += s[g]);
        
        // Build row cells dynamically
        const rowCells = groups.map(g => 
            `<td class="count ${s[g] === 0 ? 'count-zero' : ''}">${s[g]}</td>`
        ).join('');
        
        html += `
            <tr>
                <td>${s.name}</td>
                ${rowCells}
                <td class="count">${s.total}</td>
            </tr>
        `;
    });
    
    // Build total row cells dynamically
    const totalCells = groups.map(g => `<td>${groupTotals[g]}</td>`).join('');
    
    html += `
            <tr class="total-row">
                <td>Total</td>
                ${totalCells}
                <td>${totalAssignments}</td>
            </tr>
        </tbody>
        </table>
        
        <div class="stats-summary">
            <p><strong>Month Overview:</strong></p>
            <p>📅 Days in month: ${daysInMonth}</p>
            <p>✅ Assigned slots: ${totalAssignments}</p>
            <p>⚠️ Unassigned slots: ${unassignedSlots}</p>
            <p>🔗 Days with merged groups: ${mergedDays}</p>
        </div>
    `;
    
    document.getElementById('statsContent').innerHTML = html;
    document.getElementById('statsModal').classList.add('active');
}

function closeStatsModal() {
    document.getElementById('statsModal').classList.remove('active');
}

// ============================================
// CLASS DAYS CONFIGURATION
// ============================================

function openClassDaysModal() {
    // Set checkboxes based on current state
    document.querySelectorAll('input[name="classDay"]').forEach(cb => {
        cb.checked = state.classDays.includes(parseInt(cb.value));
    });
    
    // Populate cancelled days list
    const cancelledDates = Object.keys(state.cancelledDays).sort();
    const section = document.getElementById('cancelledDaysSection');
    const list = document.getElementById('cancelledDaysList');
    
    if (cancelledDates.length > 0) {
        section.style.display = 'block';
        list.innerHTML = cancelledDates.map(dateStr => {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const dayName = DAY_NAMES[date.getDay()];
            return `<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: #f9f9f9; border-radius: 4px; margin-bottom: 4px;">
                <span style="font-size: 0.9rem;">${dayName} ${day}/${month}</span>
                <button onclick="restoreDay('${dateStr}')" style="background: #4CAF50; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Restore</button>
            </div>`;
        }).join('');
    } else {
        section.style.display = 'none';
        list.innerHTML = '';
    }
    
    document.getElementById('classDaysModal').classList.add('active');
}

function closeClassDaysModal() {
    document.getElementById('classDaysModal').classList.remove('active');
}

function saveClassDays() {
    const selectedDays = Array.from(document.querySelectorAll('input[name="classDay"]:checked'))
        .map(cb => parseInt(cb.value));
    
    if (selectedDays.length === 0) {
        showToast('Please select at least one day', 'error');
        return;
    }
    
    state.classDays = selectedDays;
    renderCalendar();
    closeClassDaysModal();
    showToast('Class days updated', 'success');
}

// ============================================
// HELP MODAL FUNCTIONS
// ============================================

function openHelpModal() {
    document.getElementById('helpModal').classList.add('active');
}

function closeHelpModal() {
    document.getElementById('helpModal').classList.remove('active');
}
