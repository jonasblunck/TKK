// ============================================
// SCHEDULE FUNCTIONS
// ============================================

function autoGenerateSchedule() {
    const year = state.currentYear;
    const month = state.currentMonth;
    const daysInMonth = getDaysInMonth(year, month);
    
    // Track assignment counts per instructor per group for fair distribution
    const assignmentCounts = {};
    state.instructors.forEach(instructor => {
        assignmentCounts[instructor.id] = {
            beginners: 0,
            children: 0,
            adults: 0,
            total: 0
        };
    });
    
    // Clear current month's schedule (preserve existing descriptions)
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);
        const existing = state.schedule[dateStr] || {};
        state.schedule[dateStr] = {
            beginners: { instructorId: null, description: existing.beginners?.description || '' },
            children: { instructorId: null, description: existing.children?.description || '' },
            adults: { instructorId: null, description: existing.adults?.description || '' }
        };
    }
    
    // Get list of class days to schedule
    const classDaysToSchedule = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        
        // Only schedule actual class days that aren't cancelled
        if (state.classDays.includes(dayOfWeek) && !state.cancelledDays[dateStr]) {
            classDaysToSchedule.push({ day, dateStr });
        }
    }
    
    // Build a list of all available slots (dateStr + group combinations)
    const allSlots = [];
    for (const { dateStr } of classDaysToSchedule) {
        for (const group of GROUPS) {
            allSlots.push({ dateStr, group });
        }
    }
    
    // Track which slots are assigned and which instructors have been assigned
    const assignedSlots = new Set(); // "dateStr|group"
    const assignedPerDay = {}; // dateStr -> Set of instructor IDs
    classDaysToSchedule.forEach(({ dateStr }) => {
        assignedPerDay[dateStr] = new Set();
    });
    
    // PASS 1: Ensure each instructor gets at least one class
    // Prioritize instructors with fewer available slots (harder to place)
    const instructorsByScarcity = [...state.instructors].sort((a, b) => {
        // Count how many slots each instructor can fill
        const aSlots = allSlots.filter(slot => 
            a.groups.includes(slot.group) && a.availableDates.includes(slot.dateStr)
        ).length;
        const bSlots = allSlots.filter(slot => 
            b.groups.includes(slot.group) && b.availableDates.includes(slot.dateStr)
        ).length;
        return aSlots - bSlots; // Fewer available slots = higher priority
    });
    
    for (const instructor of instructorsByScarcity) {
        if (assignmentCounts[instructor.id].total > 0) continue; // Already assigned
        
        // Find available slots for this instructor
        const availableSlots = allSlots.filter(slot => {
            const slotKey = `${slot.dateStr}|${slot.group}`;
            return instructor.groups.includes(slot.group) &&
                   instructor.availableDates.includes(slot.dateStr) &&
                   !assignedSlots.has(slotKey) &&
                   !assignedPerDay[slot.dateStr].has(instructor.id);
        });
        
        if (availableSlots.length > 0) {
            // Pick a random slot to add variety
            const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
            const slotKey = `${slot.dateStr}|${slot.group}`;
            
            state.schedule[slot.dateStr][slot.group].instructorId = instructor.id;
            assignedSlots.add(slotKey);
            assignedPerDay[slot.dateStr].add(instructor.id);
            assignmentCounts[instructor.id][slot.group]++;
            assignmentCounts[instructor.id].total++;
        }
    }
    
    // PASS 2: Fill remaining slots with fair distribution
    for (const { dateStr } of classDaysToSchedule) {
        // Shuffle group order to avoid always prioritizing the same group
        const shuffledGroups = [...GROUPS].sort(() => Math.random() - 0.5);
        
        for (const group of shuffledGroups) {
            const slotKey = `${dateStr}|${group}`;
            if (assignedSlots.has(slotKey)) continue; // Already assigned in Pass 1
            
            // Find available instructors for this group on this day
            const candidates = state.instructors.filter(instructor => {
                return instructor.groups.includes(group) &&
                       instructor.availableDates.includes(dateStr) &&
                       !assignedPerDay[dateStr].has(instructor.id);
            });
            
            if (candidates.length > 0) {
                // Sort candidates by:
                // 1. Fewest assignments in THIS group (primary - for variety)
                // 2. Fewest total assignments (secondary - for balance)
                candidates.sort((a, b) => {
                    const aGroupCount = assignmentCounts[a.id][group];
                    const bGroupCount = assignmentCounts[b.id][group];
                    
                    if (aGroupCount !== bGroupCount) {
                        return aGroupCount - bGroupCount;
                    }
                    
                    // Tie-breaker: fewer total assignments
                    return assignmentCounts[a.id].total - assignmentCounts[b.id].total;
                });
                
                const selected = candidates[0];
                state.schedule[dateStr][group].instructorId = selected.id;
                assignedSlots.add(slotKey);
                assignedPerDay[dateStr].add(selected.id);
                
                // Update counts
                assignmentCounts[selected.id][group]++;
                assignmentCounts[selected.id].total++;
            }
        }
    }
    
    renderCalendar();
    showToast('Schedule generated!', 'success');
}

function clearSchedule() {
    const year = state.currentYear;
    const month = state.currentMonth;
    const daysInMonth = getDaysInMonth(year, month);
    
    // Clear everything for the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDate(year, month, day);
        
        // Clear all schedule data for this day
        delete state.schedule[dateStr];
        
        // Restore any cancelled days for this month
        delete state.cancelledDays[dateStr];
    }
    
    renderCalendar();
    saveState();
}

function assignInstructor(dateStr, group, instructorId) {
    if (!state.schedule[dateStr]) {
        state.schedule[dateStr] = {
            beginners: { instructorId: null, description: '' },
            children: { instructorId: null, description: '' },
            adults: { instructorId: null, description: '' }
        };
    }
    if (!state.schedule[dateStr][group]) {
        state.schedule[dateStr][group] = { instructorId: null, description: '' };
    }
    state.schedule[dateStr][group].instructorId = instructorId;
    renderCalendar();
}

function assignInstructorWithoutRender(dateStr, group, instructorId) {
    if (!state.schedule[dateStr]) {
        state.schedule[dateStr] = {
            beginners: { instructorId: null, description: '', feedbackPoints: '' },
            children: { instructorId: null, description: '', feedbackPoints: '' },
            adults: { instructorId: null, description: '', feedbackPoints: '' }
        };
    }
    if (!state.schedule[dateStr][group]) {
        state.schedule[dateStr][group] = { instructorId: null, description: '', feedbackPoints: '' };
    }
    state.schedule[dateStr][group].instructorId = instructorId;
}

function unassignSlot(dateStr, group) {
    if (state.schedule[dateStr] && state.schedule[dateStr][group]) {
        state.schedule[dateStr][group].instructorId = null;
        renderCalendar();
    }
}

function unassignSlotWithoutRender(dateStr, group) {
    if (state.schedule[dateStr] && state.schedule[dateStr][group]) {
        state.schedule[dateStr][group].instructorId = null;
    }
}

function setClassDescription(dateStr, group, description, feedbackPoints) {
    if (!state.schedule[dateStr]) {
        state.schedule[dateStr] = {
            beginners: { instructorId: null, description: '', feedbackPoints: '' },
            children: { instructorId: null, description: '', feedbackPoints: '' },
            adults: { instructorId: null, description: '', feedbackPoints: '' }
        };
    }
    if (!state.schedule[dateStr][group]) {
        state.schedule[dateStr][group] = { instructorId: null, description: '', feedbackPoints: '' };
    }
    state.schedule[dateStr][group].description = description;
    if (feedbackPoints !== undefined) {
        state.schedule[dateStr][group].feedbackPoints = feedbackPoints;
    }
    renderCalendar();
}

function getSlotData(dateStr, group) {
    return state.schedule[dateStr]?.[group] || { instructorId: null, description: '', feedbackPoints: '' };
}

function getMerges(dateStr) {
    return state.schedule[dateStr]?.merges || [];
}

function setMerges(dateStr, merges) {
    if (!state.schedule[dateStr]) {
        state.schedule[dateStr] = {
            beginners: { instructorId: null, description: '', feedbackPoints: '' },
            children: { instructorId: null, description: '', feedbackPoints: '' },
            adults: { instructorId: null, description: '', feedbackPoints: '' },
            merges: []
        };
    }
    state.schedule[dateStr].merges = merges;
    renderCalendar();
}

function isGroupMerged(dateStr, group) {
    const merges = getMerges(dateStr);
    // Check if this group is the secondary part of a merge
    if (group === 'children' && merges.includes('beg-chi')) return { merged: true, primary: 'beginners' };
    if (group === 'adults' && merges.includes('chi-adu')) return { merged: true, primary: 'children' };
    if (group === 'children' && merges.includes('all')) return { merged: true, primary: 'beginners' };
    if (group === 'adults' && merges.includes('all')) return { merged: true, primary: 'beginners' };
    return { merged: false, primary: null };
}

function getMergeSpan(dateStr, group) {
    const merges = getMerges(dateStr);
    if (merges.includes('all') && group === 'beginners') return 3;
    if (merges.includes('beg-chi') && group === 'beginners') return 2;
    if (merges.includes('chi-adu') && group === 'children') return 2;
    return 1;
}

function getMergedGroupLabel(dateStr, group) {
    const merges = getMerges(dateStr);
    if (merges.includes('all') && group === 'beginners') return 'All Levels';
    if (merges.includes('beg-chi') && group === 'beginners') return 'Beginners + Children';
    if (merges.includes('chi-adu') && group === 'children') return 'Children + Adults';
    return GROUP_LABELS[group];
}

// ============================================
// CANCEL/RESTORE DAYS
// ============================================

function cancelDay(dateStr) {
    state.cancelledDays[dateStr] = true;
    renderCalendar();
    showToast('Day cancelled', 'success');
}

function restoreDay(dateStr) {
    delete state.cancelledDays[dateStr];
    renderCalendar();
    // Refresh the modal if it's open
    if (document.getElementById('classDaysModal').classList.contains('active')) {
        openClassDaysModal();
    }
    showToast('Day restored', 'success');
}
