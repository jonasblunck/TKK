// ============================================
// DRAG AND DROP
// ============================================

let draggedInstructorId = null;
let dragSourceDate = null;
let dragSourceGroup = null;

function setupInstructorDragHandlers() {
    document.querySelectorAll('.instructor-card[draggable="true"]').forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedInstructorId = card.dataset.instructorId;
            dragSourceDate = null;
            dragSourceGroup = null;
            e.dataTransfer.effectAllowed = 'move';
        });
    });
}

function handleAssignmentDragStart(e) {
    draggedInstructorId = e.target.dataset.instructorId;
    dragSourceDate = e.target.dataset.sourceDate;
    dragSourceGroup = e.target.dataset.sourceGroup;
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const cell = e.target.closest('.calendar-cell');
    if (!cell || !draggedInstructorId) return;
    
    const targetDate = cell.dataset.date;
    const targetGroup = cell.dataset.group;
    
    if (!targetDate || !targetGroup) return;
    
    const instructor = getInstructorById(draggedInstructorId);
    if (!instructor) return;
    
    // Check if target slot already has an instructor (for swap)
    const targetSlot = state.schedule[targetDate]?.[targetGroup];
    const existingInstructorId = targetSlot?.instructorId;
    const existingInstructor = existingInstructorId ? getInstructorById(existingInstructorId) : null;
    const isSwap = existingInstructor && dragSourceDate && dragSourceGroup && existingInstructorId !== draggedInstructorId;
    
    // Validate constraints for dragged instructor
    let warnings = [];
    
    if (!instructor.availableDates.includes(targetDate)) {
        warnings.push(`${instructor.name} is not available on this date`);
    }
    
    if (!instructor.groups.includes(targetGroup)) {
        warnings.push(`${instructor.name} cannot teach ${GROUP_LABELS[targetGroup]}`);
    }
    
    // Check for double-booking on same day (excluding the source slot which will be cleared/swapped)
    const daySchedule = state.schedule[targetDate] || {};
    for (const group of GROUPS) {
        if (group !== targetGroup && daySchedule[group]?.instructorId === instructor.id) {
            // Skip if this is the source slot in a same-day swap
            if (!(dragSourceDate === targetDate && dragSourceGroup === group)) {
                warnings.push(`${instructor.name} is already assigned to ${GROUP_LABELS[group]} on this day`);
            }
        }
    }
    
    // Validate constraints for existing instructor being swapped to source
    if (isSwap) {
        if (!existingInstructor.availableDates.includes(dragSourceDate)) {
            warnings.push(`${existingInstructor.name} is not available on ${dragSourceDate}`);
        }
        
        if (!existingInstructor.groups.includes(dragSourceGroup)) {
            warnings.push(`${existingInstructor.name} cannot teach ${GROUP_LABELS[dragSourceGroup]}`);
        }
        
        // Check for double-booking of swapped instructor on source day
        const sourceDaySchedule = state.schedule[dragSourceDate] || {};
        for (const group of GROUPS) {
            if (group !== dragSourceGroup && sourceDaySchedule[group]?.instructorId === existingInstructorId) {
                // Skip if this is the target slot in a same-day swap
                if (!(targetDate === dragSourceDate && targetGroup === group)) {
                    warnings.push(`${existingInstructor.name} is already assigned to ${GROUP_LABELS[group]} on ${dragSourceDate}`);
                }
            }
        }
    }
    
    if (warnings.length > 0) {
        const action = isSwap ? 'Swap anyway?' : 'Assign anyway?';
        if (!confirm(`Warning:\n${warnings.join('\n')}\n\n${action}`)) {
            return;
        }
    }
    
    // Perform the assignment or swap
    if (isSwap) {
        // Swap: move existing instructor to source, dragged instructor to target
        assignInstructorWithoutRender(dragSourceDate, dragSourceGroup, existingInstructorId);
        assignInstructor(targetDate, targetGroup, instructor.id);
        showToast(`Swapped ${instructor.name} and ${existingInstructor.name}`, 'success');
    } else {
        // Regular move/assign
        if (dragSourceDate && dragSourceGroup) {
            unassignSlotWithoutRender(dragSourceDate, dragSourceGroup);
        }
        assignInstructor(targetDate, targetGroup, instructor.id);
    }
    
    draggedInstructorId = null;
    dragSourceDate = null;
    dragSourceGroup = null;
}

function handleAssignmentClick(e, dateStr, group) {
    e.stopPropagation();
    if (confirm('Remove this assignment?')) {
        unassignSlot(dateStr, group);
        showToast('Assignment removed', 'success');
    }
}
