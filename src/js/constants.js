// ============================================
// CONSTANTS
// ============================================

// Pre-August groups (January - July)
const ALL_GROUPS = ['beginners', 'children', 'adults'];
const SUMMER_GROUPS = ['children', 'adults'];
const SUMMER_MONTHS = [5, 6]; // June, July (0-indexed)

// August onwards groups (August - December)
const AUGUST_ONWARDS_GROUPS = ['beginners', 'kids', 'redGreen', 'blueBlack'];

function getGroupsForMonth(month) {
    // August (7) and onwards use new group structure
    if (month >= 7) {
        return AUGUST_ONWARDS_GROUPS;
    }
    // June-July use summer groups
    if (SUMMER_MONTHS.includes(month)) {
        return SUMMER_GROUPS;
    }
    // January-May use all groups
    return ALL_GROUPS;
}

const GROUP_LABELS = {
    beginners: 'Beginners',
    children: 'Children',
    adults: 'Adults',
    kids: 'Kids',
    redGreen: 'Red - Green',
    blueBlack: 'Blue - Black'
};

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAY_NAMES_MONDAY_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STORAGE_KEY = 'instructor-scheduler-state';
