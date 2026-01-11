// ============================================
// INSTRUCTOR FUNCTIONS
// ============================================

function addInstructor(name, groups, availableDates) {
    const instructor = {
        id: generateId(),
        name,
        groups,
        availableDates
    };
    state.instructors.push(instructor);
    renderInstructorList();
    return instructor;
}

function updateInstructor(id, name, groups, availableDates) {
    const instructor = state.instructors.find(i => i.id === id);
    if (instructor) {
        instructor.name = name;
        instructor.groups = groups;
        instructor.availableDates = availableDates;
        renderInstructorList();
        renderCalendar();
    }
}

function deleteInstructor(id) {
    state.instructors = state.instructors.filter(i => i.id !== id);
    // Remove from schedule
    for (const date in state.schedule) {
        for (const group of GROUPS) {
            if (state.schedule[date][group]?.instructorId === id) {
                state.schedule[date][group].instructorId = null;
            }
        }
    }
    renderInstructorList();
    renderCalendar();
}

function getInstructorById(id) {
    return state.instructors.find(i => i.id === id);
}

function confirmDeleteInstructor(id) {
    const instructor = getInstructorById(id);
    if (confirm(`Delete instructor "${instructor.name}"?`)) {
        deleteInstructor(id);
        showToast('Instructor deleted', 'success');
    }
}
