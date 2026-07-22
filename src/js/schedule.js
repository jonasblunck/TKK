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
        for (const group of getGroupsForMonth(month)) {
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
        const shuffledGroups = [...getGroupsForMonth(month)].sort(() => Math.random() - 0.5);
        
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
            beginners: { instructorId: null, description: '', feedbackPoints: '', assistants: [] },
            children: { instructorId: null, description: '', feedbackPoints: '', assistants: [] },
            adults: { instructorId: null, description: '', feedbackPoints: '', assistants: [] }
        };
    }
    if (!state.schedule[dateStr][group]) {
        state.schedule[dateStr][group] = { instructorId: null, description: '', feedbackPoints: '', assistants: [] };
    }
    // Ensure assistants array exists (for legacy data)
    if (!state.schedule[dateStr][group].assistants) {
        state.schedule[dateStr][group].assistants = [];
    }
    state.schedule[dateStr][group].instructorId = instructorId;
    renderCalendar();
}

function assignInstructorWithoutRender(dateStr, group, instructorId) {
    if (!state.schedule[dateStr]) {
        state.schedule[dateStr] = {
            beginners: { instructorId: null, description: '', feedbackPoints: '', assistants: [] },
            children: { instructorId: null, description: '', feedbackPoints: '', assistants: [] },
            adults: { instructorId: null, description: '', feedbackPoints: '', assistants: [] }
        };
    }
    if (!state.schedule[dateStr][group]) {
        state.schedule[dateStr][group] = { instructorId: null, description: '', feedbackPoints: '', assistants: [] };
    }
    // Ensure assistants array exists (for legacy data)
    if (!state.schedule[dateStr][group].assistants) {
        state.schedule[dateStr][group].assistants = [];
    }
    state.schedule[dateStr][group].instructorId = instructorId;
}

/**
 * Add an assistant instructor to a slot.
 * @param {string} dateStr - Date in 'YYYY-MM-DD' format
 * @param {string} group - Group name (beginners, children, adults)
 * @param {string} instructorId - The instructor ID to add as assistant
 */
function addAssistant(dateStr, group, instructorId) {
    if (!state.schedule[dateStr]) {
        state.schedule[dateStr] = {
            beginners: { instructorId: null, description: '', feedbackPoints: '', assistants: [] },
            children: { instructorId: null, description: '', feedbackPoints: '', assistants: [] },
            adults: { instructorId: null, description: '', feedbackPoints: '', assistants: [] }
        };
    }
    if (!state.schedule[dateStr][group]) {
        state.schedule[dateStr][group] = { instructorId: null, description: '', feedbackPoints: '', assistants: [] };
    }
    if (!state.schedule[dateStr][group].assistants) {
        state.schedule[dateStr][group].assistants = [];
    }
    // Don't add if already an assistant or is the main instructor
    if (!state.schedule[dateStr][group].assistants.includes(instructorId) && 
        state.schedule[dateStr][group].instructorId !== instructorId) {
        state.schedule[dateStr][group].assistants.push(instructorId);
    }
    renderCalendar();
}

/**
 * Remove an assistant instructor from a slot.
 * @param {string} dateStr - Date in 'YYYY-MM-DD' format
 * @param {string} group - Group name (beginners, children, adults)
 * @param {string} instructorId - The instructor ID to remove
 */
function removeAssistant(dateStr, group, instructorId) {
    if (state.schedule[dateStr]?.[group]?.assistants) {
        state.schedule[dateStr][group].assistants = 
            state.schedule[dateStr][group].assistants.filter(id => id !== instructorId);
        renderCalendar();
    }
}

/**
 * Get the list of assistant instructors for a slot.
 * @param {string} dateStr - Date in 'YYYY-MM-DD' format
 * @param {string} group - Group name (beginners, children, adults)
 * @returns {Array} Array of instructor IDs
 */
function getAssistants(dateStr, group) {
    return state.schedule[dateStr]?.[group]?.assistants || [];
}

function unassignSlot(dateStr, group) {
    if (state.schedule[dateStr] && state.schedule[dateStr][group]) {
        state.schedule[dateStr][group].instructorId = null;
        // Keep assistants when unassigning main instructor? For now, clear them too
        // state.schedule[dateStr][group].assistants = [];
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
    const slot = state.schedule[dateStr]?.[group] || { instructorId: null, description: '', feedbackPoints: '', assistants: [] };
    // Ensure assistants array exists for legacy data
    if (!slot.assistants) slot.assistants = [];
    return slot;
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
            kids: { instructorId: null, description: '', feedbackPoints: '' },
            redGreen: { instructorId: null, description: '', feedbackPoints: '' },
            blueBlack: { instructorId: null, description: '', feedbackPoints: '' },
            merges: []
        };
    }
    state.schedule[dateStr].merges = merges;
    renderCalendar();
}

function getGroupsForDate(dateStr) {
    const month = parseInt(dateStr.split('-')[1], 10) - 1;
    return getGroupsForMonth(month);
}

function getMergeMap(dateStr) {
    const merges = getMerges(dateStr);
    const mergeMap = {};

    function addMerge(primary, merged) {
        if (!mergeMap[primary]) {
            mergeMap[primary] = new Set();
        }
        mergeMap[primary].add(merged);
    }

    for (const mergeToken of merges) {
        if (mergeToken === 'beg-chi') {
            addMerge('beginners', 'children');
            continue;
        }
        if (mergeToken === 'chi-adu') {
            addMerge('children', 'adults');
            continue;
        }
        if (mergeToken === 'all') {
            addMerge('beginners', 'children');
            addMerge('beginners', 'adults');
            continue;
        }
        if (mergeToken === 'beg-kids') {
            addMerge('beginners', 'kids');
            continue;
        }
        if (mergeToken === 'rg-bb') {
            addMerge('redGreen', 'blueBlack');
            continue;
        }
        if (mergeToken === 'all-aug') {
            addMerge('beginners', 'kids');
            addMerge('beginners', 'redGreen');
            addMerge('beginners', 'blueBlack');
            continue;
        }

        if (mergeToken.startsWith('m:')) {
            const parts = mergeToken.split(':');
            if (parts.length === 3 && parts[1] && parts[2]) {
                addMerge(parts[1], parts[2]);
            }
        }
    }

    return mergeMap;
}

function serializeMergeMap(mergeMap) {
    const serialized = [];

    for (const primary of Object.keys(mergeMap).sort()) {
        const mergedGroups = Array.from(mergeMap[primary]).sort();
        for (const merged of mergedGroups) {
            serialized.push(`m:${primary}:${merged}`);
        }
    }

    return serialized;
}

function getMergedGroupsForPrimary(dateStr, primary) {
    const mergeMap = getMergeMap(dateStr);
    return Array.from(mergeMap[primary] || []);
}

function setMergedGroupsForPrimary(dateStr, primary, mergedGroups) {
    const mergeMap = getMergeMap(dateStr);

    // Replace only this primary's configuration.
    delete mergeMap[primary];

    const uniqueMergedGroups = Array.from(new Set(mergedGroups));
    if (uniqueMergedGroups.length > 0) {
        mergeMap[primary] = new Set(uniqueMergedGroups);
    }

    // Remove conflicting chains where a merged group would also act as a primary.
    for (const mergedGroup of uniqueMergedGroups) {
        delete mergeMap[mergedGroup];
    }

    // Remove conflicts where another primary tries to merge into groups now merged by this primary.
    for (const otherPrimary of Object.keys(mergeMap)) {
        if (otherPrimary === primary) continue;

        const filtered = Array.from(mergeMap[otherPrimary]).filter(
            group => !uniqueMergedGroups.includes(group)
        );

        if (filtered.length === 0) {
            delete mergeMap[otherPrimary];
        } else {
            mergeMap[otherPrimary] = new Set(filtered);
        }
    }

    setMerges(dateStr, serializeMergeMap(mergeMap));
}

function isGroupMerged(dateStr, group) {
    const mergeMap = getMergeMap(dateStr);
    for (const primary of Object.keys(mergeMap)) {
        if (mergeMap[primary].has(group)) {
            return { merged: true, primary };
        }
    }
    return { merged: false, primary: null };
}

function getMergeSpan(dateStr, group) {
    const mergeMap = getMergeMap(dateStr);
    if (mergeMap[group]) {
        return 1 + mergeMap[group].size;
    }
    return 1;
}

function getMergedGroupLabel(dateStr, group) {
    const mergeMap = getMergeMap(dateStr);
    const mergedGroups = Array.from(mergeMap[group] || []);
    if (mergedGroups.length === 0) {
        return GROUP_LABELS[group];
    }

    const activeGroups = getGroupsForDate(dateStr);
    if (activeGroups[0] === group && mergedGroups.length === activeGroups.length - 1) {
        return 'All Levels';
    }

    const orderedMergedGroups = activeGroups.filter(g => mergedGroups.includes(g));
    const labels = [GROUP_LABELS[group], ...orderedMergedGroups.map(g => GROUP_LABELS[g])];
    return labels.join(' + ');
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
