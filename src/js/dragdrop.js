// ============================================
// DRAG AND DROP
// ============================================

let draggedInstructorId = null;
let dragSourceDate = null;
let dragSourceGroup = null;

// Pending drop action (for assistant modal)
let pendingDropAction = null;

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
    
    // Check if target slot already has an instructor
    const targetSlot = state.schedule[targetDate]?.[targetGroup];
    const existingInstructorId = targetSlot?.instructorId;
    const existingInstructor = existingInstructorId ? getInstructorById(existingInstructorId) : null;
    
    // If dragging from calendar (not sidebar) and target has instructor, check if it's a swap scenario
    const isFromCalendar = dragSourceDate && dragSourceGroup;
    const isSameSlot = dragSourceDate === targetDate && dragSourceGroup === targetGroup;
    
    // If target has an instructor and we're NOT dragging the same instructor back to its slot
    if (existingInstructor && existingInstructorId !== draggedInstructorId && !isSameSlot) {
        // If dragging from calendar, check if it's really a swap (different instructors)
        if (isFromCalendar) {
            // This is a swap scenario - proceed with existing swap logic
            performDropAction(targetDate, targetGroup, 'swap');
        } else {
            // Dragging from sidebar onto occupied slot - show modal
            pendingDropAction = {
                targetDate,
                targetGroup,
                instructorId: draggedInstructorId,
                existingInstructorId
            };
            showAssistantModal(instructor.name, existingInstructor.name);
        }
        return;
    }
    
    // No existing instructor or same instructor - just assign
    performDropAction(targetDate, targetGroup, 'assign');
}

function showAssistantModal(newInstructorName, existingInstructorName) {
    const modal = document.getElementById('assistantModal');
    const text = document.getElementById('assistantModalText');
    text.innerHTML = `<strong>${existingInstructorName}</strong> is already assigned to this slot.<br><br>Would you like to <strong>replace</strong> them with <strong>${newInstructorName}</strong>, or add <strong>${newInstructorName}</strong> as an <strong>assistant</strong>?`;
    modal.classList.add('active');
}

function hideAssistantModal() {
    document.getElementById('assistantModal').classList.remove('active');
    pendingDropAction = null;
    draggedInstructorId = null;
    dragSourceDate = null;
    dragSourceGroup = null;
}

function handleReplaceInstructor() {
    if (!pendingDropAction) return;
    const { targetDate, targetGroup, instructorId } = pendingDropAction;
    hideAssistantModal();
    
    // Validate and assign (replace)
    const instructor = getInstructorById(instructorId);
    const warnings = validateInstructorAssignment(instructor, targetDate, targetGroup);
    
    if (warnings.length > 0) {
        if (!confirm(`Warning:\n${warnings.join('\n')}\n\nAssign anyway?`)) {
            return;
        }
    }
    
    assignInstructor(targetDate, targetGroup, instructorId);
    showToast(`Replaced with ${instructor.name}`, 'success');
}

function handleAddAssistant() {
    if (!pendingDropAction) return;
    const { targetDate, targetGroup, instructorId } = pendingDropAction;
    hideAssistantModal();
    
    const instructor = getInstructorById(instructorId);
    const warnings = validateInstructorAssignment(instructor, targetDate, targetGroup, true);
    
    if (warnings.length > 0) {
        if (!confirm(`Warning:\n${warnings.join('\n')}\n\nAdd as assistant anyway?`)) {
            return;
        }
    }
    
    addAssistant(targetDate, targetGroup, instructorId);
    showToast(`Added ${instructor.name} as assistant`, 'success');
}

function validateInstructorAssignment(instructor, targetDate, targetGroup, isAssistant = false) {
    const warnings = [];
    
    if (!instructor.availableDates.includes(targetDate)) {
        warnings.push(`${instructor.name} is not available on this date`);
    }
    
    if (!instructor.groups.includes(targetGroup)) {
        warnings.push(`${instructor.name} cannot teach ${GROUP_LABELS[targetGroup]}`);
    }
    
    // Check for double-booking on same day
    const daySchedule = state.schedule[targetDate] || {};
    for (const group of GROUPS) {
        if (group !== targetGroup) {
            if (daySchedule[group]?.instructorId === instructor.id) {
                warnings.push(`${instructor.name} is already assigned to ${GROUP_LABELS[group]} on this day`);
            }
            // Also check if they're an assistant in another group
            if (daySchedule[group]?.assistants?.includes(instructor.id)) {
                warnings.push(`${instructor.name} is already an assistant for ${GROUP_LABELS[group]} on this day`);
            }
        }
    }
    
    // If adding as assistant, check if already main instructor of target slot
    if (isAssistant && daySchedule[targetGroup]?.instructorId === instructor.id) {
        warnings.push(`${instructor.name} is already the main instructor for this slot`);
    }
    
    return warnings;
}

function performDropAction(targetDate, targetGroup, action) {
    const instructor = getInstructorById(draggedInstructorId);
    if (!instructor) return;
    
    const targetSlot = state.schedule[targetDate]?.[targetGroup];
    const existingInstructorId = targetSlot?.instructorId;
    const existingInstructor = existingInstructorId ? getInstructorById(existingInstructorId) : null;
    const isSwap = action === 'swap' && existingInstructor && dragSourceDate && dragSourceGroup && existingInstructorId !== draggedInstructorId;
    
    // Validate constraints for dragged instructor
    let warnings = validateInstructorAssignment(instructor, targetDate, targetGroup);
    
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
                if (!(targetDate === dragSourceDate && targetGroup === group)) {
                    warnings.push(`${existingInstructor.name} is already assigned to ${GROUP_LABELS[group]} on ${dragSourceDate}`);
                }
            }
        }
    }
    
    if (warnings.length > 0) {
        const actionText = isSwap ? 'Swap anyway?' : 'Assign anyway?';
        if (!confirm(`Warning:\n${warnings.join('\n')}\n\n${actionText}`)) {
            resetDragState();
            return;
        }
    }
    
    // Perform the assignment or swap
    if (isSwap) {
        // Swap: move existing instructor to source, dragged instructor to target
        // Preserve assistants on both slots
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
    
    resetDragState();
}

function resetDragState() {
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

/**
 * Handle click on assistant remove button
 */
function handleRemoveAssistant(e, dateStr, group, instructorId) {
    e.stopPropagation();
    const instructor = getInstructorById(instructorId);
    removeAssistant(dateStr, group, instructorId);
    showToast(`Removed assistant ${instructor?.name || ''}`, 'success');
}
