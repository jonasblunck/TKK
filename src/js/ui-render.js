// ============================================
// RENDER FUNCTIONS
// ============================================

function renderInstructorList() {
    const container = document.getElementById('instructorList');
    
    if (state.instructors.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No instructors yet</p>
                <button class="btn btn-secondary btn-small" onclick="openAddInstructorModal()">Add your first instructor</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = state.instructors.map(instructor => {
        const groupTags = instructor.groups.map(g => 
            `<span class="group-tag ${g}">${GROUP_LABELS[g]}</span>`
        ).join('');
        
        // Count only available dates for the current month
        const currentMonthPrefix = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}-`;
        const dateCount = instructor.availableDates.filter(d => d.startsWith(currentMonthPrefix)).length;
        
        return `
            <div class="instructor-card" draggable="true" data-instructor-id="${instructor.id}">
                <h3>${instructor.name}</h3>
                <div class="availability">${dateCount} day${dateCount !== 1 ? 's' : ''} available</div>
                <div class="groups">${groupTags}</div>
                <div class="actions">
                    <button class="btn btn-secondary btn-small" onclick="openEditInstructorModal('${instructor.id}')">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="confirmDeleteInstructor('${instructor.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Add drag handlers
    setupInstructorDragHandlers();
}

function renderCalendar() {
    const container = document.getElementById('calendarGrid');
    const year = state.currentYear;
    const month = state.currentMonth;
    const daysInMonth = getDaysInMonth(year, month);
    
    // Update month header
    document.getElementById('currentMonth').textContent = `${MONTH_NAMES[month]} ${year}`;
    
    // Build grid HTML
    let html = `
        <div class="calendar-cell header">Date</div>
        <div class="calendar-cell header beginners-col">Beginners</div>
        <div class="calendar-cell header children-col">Children</div>
        <div class="calendar-cell header adults-col">Adults</div>
    `;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const dayName = DAY_NAMES[dayOfWeek];
        
        // Skip days that aren't class days (unless showAllDays is enabled)
        if (!state.showAllDays && !state.classDays.includes(dayOfWeek)) {
            continue;
        }
        
        // Check if day is cancelled - skip it entirely (hidden from calendar)
        if (state.cancelledDays[dateStr]) {
            continue;
        }
        
        // In view-only mode, don't show the cancel button
        const cancelBtn = (typeof isViewOnlyMode !== 'undefined' && isViewOnlyMode) 
            ? '' 
            : `<button class="cancel-btn" onclick="cancelDay('${dateStr}')" title="Cancel this day">❌</button>`;
        html += `<div class="calendar-cell date-cell">${dayName} ${day} ${cancelBtn}</div>`;
        
        for (const group of GROUPS) {
            const mergeInfo = isGroupMerged(dateStr, group);
            
            // Skip rendering if this group is merged into another
            if (mergeInfo.merged) {
                continue;
            }
            
            const span = getMergeSpan(dateStr, group);
            const slotData = getSlotData(dateStr, group);
            const instructor = slotData.instructorId ? getInstructorById(slotData.instructorId) : null;
            const description = slotData.description || '';
            const hasDescription = description.trim().length > 0;
            const mergedLabel = span > 1 ? getMergedGroupLabel(dateStr, group) : '';
            
            const spanClass = span > 1 ? `merged-span-${span}` : '';
            const bgClass = span === 3 ? 'all-levels-col' : (span === 2 && group === 'beginners' ? 'beg-chi-col' : (span === 2 && group === 'children' ? 'chi-adu-col' : `${group}-col`));
            
            // In view-only mode, disable all interactive features
            const viewOnly = typeof isViewOnlyMode !== 'undefined' && isViewOnlyMode;
            const dragHandlers = viewOnly ? '' : `ondragover="handleDragOver(event)" ondrop="handleDrop(event)"`;
            const dblClickHandler = viewOnly ? '' : `ondblclick="openDescriptionModal('${dateStr}', '${group}')"`;
            
            html += `
                <div class="calendar-cell ${group}-col ${spanClass} ${viewOnly ? 'view-only' : ''}" 
                     data-date="${dateStr}" 
                     data-group="${group}"
                     ${dragHandlers}
                     ${dblClickHandler}>
                    <div class="cell-content">
                        ${span > 1 ? `<span class="merge-indicator">${mergedLabel}</span>` : ''}
                        ${instructor 
                            ? viewOnly 
                                ? `<span class="assignment">${instructor.name}</span>`
                                : `<span class="assignment" 
                                    draggable="true" 
                                    data-instructor-id="${instructor.id}"
                                    data-source-date="${dateStr}"
                                    data-source-group="${group}"
                                    ondragstart="handleAssignmentDragStart(event)"
                                    onclick="handleAssignmentClick(event, '${dateStr}', '${group}')">${instructor.name}</span>`
                            : `<span class="unassigned">-</span>`
                        }
                        ${viewOnly 
                            ? (hasDescription ? `<div class="cell-description" title="${description.replace(/"/g, '&quot;')}">${description.length > 30 ? description.substring(0, 30) + '...' : description}</div>` : '')
                            : (hasDescription 
                                ? `<div class="cell-description" title="${description.replace(/"/g, '&quot;')}" onclick="openDescriptionModal('${dateStr}', '${group}')">${description.length > 30 ? description.substring(0, 30) + '...' : description}</div>`
                                : `<div class="cell-description add-desc" onclick="openDescriptionModal('${dateStr}', '${group}')">+ Add focus</div>`
                            )
                        }
                    </div>
                </div>
            `;
        }
    }
    
    container.innerHTML = html;
}

function renderDatePicker() {
    const container = document.getElementById('datePickerGrid');
    const year = state.datePickerYear;
    const month = state.datePickerMonth;
    
    document.getElementById('datePickerMonth').textContent = `${MONTH_NAMES[month]} ${year}`;
    
    const daysInMonth = getDaysInMonth(year, month);
    // Adjust firstDay for Monday-first week (0=Mon, 1=Tue, ..., 6=Sun)
    const firstDaySunday = getFirstDayOfMonth(year, month); // 0=Sun
    const firstDay = firstDaySunday === 0 ? 6 : firstDaySunday - 1; // Convert to Monday-first
    
    let html = DAY_NAMES_MONDAY_FIRST.map(d => `<div class="day-header">${d}</div>`).join('');
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="day-cell empty"></div>`;
    }
    
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);
        const isSelected = state.selectedDates.includes(dateStr);
        html += `<div class="day-cell ${isSelected ? 'selected' : ''}" 
                      data-date="${dateStr}"
                      onclick="toggleDateSelection('${dateStr}')">${day}</div>`;
    }
    
    container.innerHTML = html;
}
