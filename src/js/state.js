// ============================================
// APP STATE
// ============================================

// Default instructors - used to ensure new instructors are added even when loading old saved data
const DEFAULT_INSTRUCTORS = [
    { id: 'default-1', name: 'JonasB', groups: [], availableDates: [] },
    { id: 'default-2', name: 'JonasS', groups: [], availableDates: [] },
    { id: 'default-3', name: 'Björn', groups: [], availableDates: [] },
    { id: 'default-4', name: 'Daniel', groups: [], availableDates: [] },
    { id: 'default-5', name: 'Stoffe', groups: [], availableDates: [] },
    { id: 'default-6', name: 'Ida', groups: [], availableDates: [] },
    { id: 'default-8', name: 'Mike', groups: [], availableDates: [] }
];

const state = {
    // Instructors: array of { id, name, groups: [], availableDates: [] }
    instructors: DEFAULT_INSTRUCTORS.map(i => ({ ...i })),
    
    // Track deleted default instructor IDs (so they don't get re-added on load)
    deletedDefaultIds: [],
    
    // Schedule: { 'YYYY-MM-DD': { beginners: { instructorId, description }, ..., merges: [] } }
    schedule: {},
    
    // Current view
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    
    // Class days configuration (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
    classDays: [1, 4, 6], // Default: Monday, Thursday, Saturday
    showAllDays: false,
    
    // Cancelled days (holidays, repairs, etc.)
    cancelledDays: {},  // { 'YYYY-MM-DD': true }
    
    // Modal state
    editingInstructorId: null,
    
    // Date picker state (for modal)
    datePickerMonth: new Date().getMonth(),
    datePickerYear: new Date().getFullYear(),
    selectedDates: [],
    
    // Description modal state
    editingDescriptionDate: null,
    editingDescriptionGroup: null
};

// ============================================
// LOCAL STORAGE PERSISTENCE
// ============================================

function saveState() {
    const dataToSave = {
        instructors: state.instructors,
        schedule: state.schedule,
        classDays: state.classDays,
        cancelledDays: state.cancelledDays,
        deletedDefaultIds: state.deletedDefaultIds
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        showToast('Schedule saved!', 'success');
    } catch (e) {
        console.error('Failed to save state:', e);
        showToast('Failed to save - storage may be full', 'error');
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            
            if (data.instructors) {
                state.instructors = data.instructors;
            }
            if (data.deletedDefaultIds) {
                state.deletedDefaultIds = data.deletedDefaultIds;
            }
            
            // Merge in any new default instructors that aren't in the saved data
            // BUT skip ones that were explicitly deleted by the user
            for (const defaultInstructor of DEFAULT_INSTRUCTORS) {
                const exists = state.instructors.some(i => i.id === defaultInstructor.id);
                const wasDeleted = state.deletedDefaultIds.includes(defaultInstructor.id);
                if (!exists && !wasDeleted) {
                    state.instructors.push({ ...defaultInstructor });
                }
            }
            
            if (data.schedule) state.schedule = data.schedule;
            if (data.classDays) state.classDays = data.classDays;
            if (data.cancelledDays) state.cancelledDays = data.cancelledDays;
            
            console.log('State loaded from localStorage');
        }
    } catch (e) {
        console.error('Failed to load state:', e);
    }
}
