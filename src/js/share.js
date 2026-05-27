// ============================================
// SHARE LINK FUNCTIONALITY
// ============================================

/**
 * LZ-String compression (minimal implementation for URL-safe compression)
 * Based on lz-string by pieroxy: https://github.com/pieroxy/lz-string
 */
const LZString = (function() {
    const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
    const baseReverseDic = {};
    
    function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
            baseReverseDic[alphabet] = {};
            for (let i = 0; i < alphabet.length; i++) {
                baseReverseDic[alphabet][alphabet.charAt(i)] = i;
            }
        }
        return baseReverseDic[alphabet][character];
    }

    function compressToEncodedURIComponent(input) {
        if (input == null) return "";
        return _compress(input, 6, function(a) { return keyStrUriSafe.charAt(a); });
    }

    function decompressFromEncodedURIComponent(input) {
        if (input == null) return "";
        if (input === "") return null;
        input = input.replace(/ /g, "+");
        return _decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
    }

    function _compress(uncompressed, bitsPerChar, getCharFromInt) {
        if (uncompressed == null) return "";
        let i, value,
            context_dictionary = {},
            context_dictionaryToCreate = {},
            context_c = "",
            context_wc = "",
            context_w = "",
            context_enlargeIn = 2,
            context_dictSize = 3,
            context_numBits = 2,
            context_data = [],
            context_data_val = 0,
            context_data_position = 0;

        for (let ii = 0; ii < uncompressed.length; ii++) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                context_dictionary[context_c] = context_dictSize++;
                context_dictionaryToCreate[context_c] = true;
            }
            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                context_w = context_wc;
            } else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 8; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    } else {
                        value = 1;
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | value;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 16; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                } else {
                    value = context_dictionary[context_w];
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                context_dictionary[context_wc] = context_dictSize++;
                context_w = String(context_c);
            }
        }
        if (context_w !== "") {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 8; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                } else {
                    value = 1;
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | value;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = 0;
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 16; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
            } else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = (context_data_val << 1) | (value & 1);
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    } else {
                        context_data_position++;
                    }
                    value = value >> 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
            }
        }
        value = 2;
        for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
            } else {
                context_data_position++;
            }
            value = value >> 1;
        }
        while (true) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar - 1) {
                context_data.push(getCharFromInt(context_data_val));
                break;
            }
            else context_data_position++;
        }
        return context_data.join('');
    }

    function _decompress(length, resetValue, getNextValue) {
        let dictionary = [],
            next,
            enlargeIn = 4,
            dictSize = 4,
            numBits = 3,
            entry = "",
            result = [],
            i,
            w,
            bits, resb, maxpower, power,
            c,
            data = { val: getNextValue(0), position: resetValue, index: 1 };

        for (i = 0; i < 3; i++) {
            dictionary[i] = i;
        }
        bits = 0;
        maxpower = Math.pow(2, 2);
        power = 1;
        while (power != maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
        }
        switch (next = bits) {
            case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                c = String.fromCharCode(bits);
                break;
            case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }
                c = String.fromCharCode(bits);
                break;
            case 2:
                return "";
        }
        dictionary[3] = c;
        w = c;
        result.push(c);
        while (true) {
            if (data.index > length) {
                return "";
            }
            bits = 0;
            maxpower = Math.pow(2, numBits);
            power = 1;
            while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }
            switch (c = bits) {
                case 0:
                    bits = 0;
                    maxpower = Math.pow(2, 8);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    dictionary[dictSize++] = String.fromCharCode(bits);
                    c = dictSize - 1;
                    enlargeIn--;
                    break;
                case 1:
                    bits = 0;
                    maxpower = Math.pow(2, 16);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    dictionary[dictSize++] = String.fromCharCode(bits);
                    c = dictSize - 1;
                    enlargeIn--;
                    break;
                case 2:
                    return result.join('');
            }
            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
            if (dictionary[c]) {
                entry = dictionary[c];
            } else {
                if (c === dictSize) {
                    entry = w + w.charAt(0);
                } else {
                    return null;
                }
            }
            result.push(entry);
            dictionary[dictSize++] = w + entry.charAt(0);
            enlargeIn--;
            if (enlargeIn == 0) {
                enlargeIn = Math.pow(2, numBits);
                numBits++;
            }
            w = entry;
        }
    }

    return {
        compressToEncodedURIComponent: compressToEncodedURIComponent,
        decompressFromEncodedURIComponent: decompressFromEncodedURIComponent
    };
})();

// ============================================
// SHARE LINK GENERATION
// ============================================

// Track if we're in view-only mode (opened from a share link)
let isViewOnlyMode = false;

function getShareableState() {
    // Only include schedule data for the current month
    const monthPrefix = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}-`;
    
    // Filter schedule to only current month
    const monthSchedule = {};
    for (const dateStr in state.schedule) {
        if (dateStr.startsWith(monthPrefix)) {
            monthSchedule[dateStr] = state.schedule[dateStr];
        }
    }
    
    // Filter cancelledDays to only current month
    const monthCancelledDays = {};
    for (const dateStr in state.cancelledDays) {
        if (dateStr.startsWith(monthPrefix)) {
            monthCancelledDays[dateStr] = state.cancelledDays[dateStr];
        }
    }
    
    // Only include instructors that are assigned in this month's schedule
    const assignedInstructorIds = new Set();
    for (const dateStr in monthSchedule) {
        const dayData = monthSchedule[dateStr];
        for (const group of ALL_GROUPS) {
            if (dayData[group]?.instructorId) {
                assignedInstructorIds.add(dayData[group].instructorId);
            }
            // Also include assistants
            if (dayData[group]?.assistants) {
                dayData[group].assistants.forEach(id => assignedInstructorIds.add(id));
            }
        }
    }
    
    const monthInstructors = state.instructors
        .filter(i => assignedInstructorIds.has(i.id))
        .map(i => ({ id: i.id, name: i.name })); // Only need id and name for display
    
    return {
        month: state.currentMonth,
        year: state.currentYear,
        instructors: monthInstructors,
        schedule: monthSchedule,
        classDays: state.classDays,
        cancelledDays: monthCancelledDays,
        viewOnly: true
    };
}

// Group key mapping for compact encoding
const GROUP_KEY_MAP = { beginners: 'b', children: 'c', adults: 'a' };
const GROUP_KEY_REVERSE = { b: 'beginners', c: 'children', a: 'adults' };

/**
 * Encode shareable state into a compact format (v2).
 * 
 * Format: { v:2, m, y, i:[[id,name],...], s:[[day,{group:val}],...], d:[classDays], c:[cancelledDays], vo:true }
 * 
 * Group values:
 *   - number: instructor index only
 *   - [idx, desc]: instructor index + description
 *   - [idx, null, [assistantIdx, ...]]: instructor + assistants (no description)
 *   - [idx, desc, [assistantIdx, ...]]: instructor + description + assistants
 */
function encodeCompactState(shareableState) {
    const { month, year, instructors, schedule, classDays, cancelledDays } = shareableState;
    
    // Build instructor index: id -> index
    const idToIdx = {};
    const compactInstructors = instructors.map((inst, idx) => {
        idToIdx[inst.id] = idx;
        return [inst.id, inst.name];
    });
    
    // Encode schedule as [day, {groupKey: value}] tuples
    const compactSchedule = [];
    for (const dateStr in schedule) {
        const day = parseInt(dateStr.split('-')[2], 10);
        const dayData = schedule[dateStr];
        const compactDay = {};
        
        for (const group of ALL_GROUPS) {
            const slot = dayData[group];
            if (!slot || slot.instructorId === undefined || slot.instructorId === null) continue;
            
            const idx = idToIdx[slot.instructorId];
            if (idx === undefined) continue;
            
            const gKey = GROUP_KEY_MAP[group];
            const desc = slot.description || null;
            const assistants = slot.assistants && slot.assistants.length > 0
                ? slot.assistants.map(id => idToIdx[id]).filter(i => i !== undefined)
                : null;
            
            if (!desc && !assistants) {
                compactDay[gKey] = idx;
            } else if (desc && !assistants) {
                compactDay[gKey] = [idx, desc];
            } else if (!desc && assistants) {
                compactDay[gKey] = [idx, null, assistants];
            } else {
                compactDay[gKey] = [idx, desc, assistants];
            }
        }
        
        if (Object.keys(compactDay).length > 0) {
            compactSchedule.push([day, compactDay]);
        }
    }
    
    // Encode cancelled days as day-of-month numbers
    const compactCancelled = Object.keys(cancelledDays)
        .map(dateStr => parseInt(dateStr.split('-')[2], 10))
        .sort((a, b) => a - b);
    
    const compact = { v: 2, m: month, y: year, i: compactInstructors, s: compactSchedule, d: classDays };
    if (compactCancelled.length > 0) compact.c = compactCancelled;
    compact.vo = true;
    
    return compact;
}

/**
 * Decode compact format (v2) back to the full shareable state.
 */
function decodeCompactState(compact) {
    if (compact.v !== 2) throw new Error('Unknown compact format version');
    
    const month = compact.m;
    const year = compact.y;
    const monthStr = String(month + 1).padStart(2, '0');
    
    // Rebuild instructors
    const instructors = compact.i.map(([id, name]) => ({ id, name, groups: [], availableDates: [] }));
    
    // Rebuild schedule
    const schedule = {};
    for (const [day, groups] of compact.s) {
        const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
        const dayData = {};
        
        for (const [gKey, value] of Object.entries(groups)) {
            const group = GROUP_KEY_REVERSE[gKey];
            if (!group) continue;
            
            let idx, desc = undefined, assistants = undefined;
            if (typeof value === 'number') {
                idx = value;
            } else if (Array.isArray(value)) {
                idx = value[0];
                desc = value[1] || undefined;
                assistants = value[2] || undefined;
            } else {
                continue;
            }
            
            if (idx === undefined || idx === null || idx < 0 || idx >= instructors.length) continue;
            
            const slot = { instructorId: instructors[idx].id };
            if (desc) slot.description = desc;
            if (assistants && Array.isArray(assistants)) {
                slot.assistants = assistants
                    .filter(aIdx => aIdx >= 0 && aIdx < instructors.length)
                    .map(aIdx => instructors[aIdx].id);
            }
            dayData[group] = slot;
        }
        
        schedule[dateStr] = dayData;
    }
    
    // Rebuild cancelled days
    const cancelledDays = {};
    if (compact.c) {
        for (const day of compact.c) {
            const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
            cancelledDays[dateStr] = true;
        }
    }
    
    return {
        month, year, instructors, schedule,
        classDays: compact.d || [],
        cancelledDays,
        viewOnly: !!compact.vo
    };
}

function generateShareUrl() {
    const data = getShareableState();
    const compact = encodeCompactState(data);
    const json = JSON.stringify(compact);
    const compressed = LZString.compressToEncodedURIComponent(json);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?s2=${compressed}`;
}

async function shortenUrl(longUrl) {
    try {
        // Use da.gd API (supports CORS, direct 302 redirects, no interstitial pages)
        const response = await fetch(`https://da.gd/s?url=${encodeURIComponent(longUrl)}`);
        if (!response.ok) {
            throw new Error('URL shortening failed');
        }
        const shortUrl = (await response.text()).trim();
        if (shortUrl && shortUrl.startsWith('http')) {
            return { success: true, shortUrl };
        } else {
            throw new Error(shortUrl || 'Unknown error');
        }
    } catch (error) {
        console.warn('URL shortening failed:', error);
        return { success: false, error: error.message };
    }
}

function loadStateFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const compactParam = urlParams.get('s2');
    const legacyParam = urlParams.get('s');
    
    // Also check hash for backwards compatibility
    const hash = window.location.hash;
    const hashData = (hash && hash.startsWith('#share=')) ? hash.substring(7) : null;
    
    // Try compact format (s2) first
    if (compactParam) {
        try {
            const json = LZString.decompressFromEncodedURIComponent(compactParam);
            if (!json) throw new Error('Failed to decompress data');
            const compact = JSON.parse(json);
            const data = decodeCompactState(compact);
            applySharedState(data);
            return true;
        } catch (error) {
            console.warn('Failed to load compact share link, trying legacy format:', error);
            // Fall through to legacy format
        }
    }
    
    // Try legacy format (s param or hash)
    const compressed = legacyParam || hashData;
    
    if (compressed) {
        try {
            const json = LZString.decompressFromEncodedURIComponent(compressed);
            if (!json) {
                throw new Error('Failed to decompress data');
            }
            const data = JSON.parse(json);
            applySharedState(data);
            return true;
        } catch (error) {
            console.error('Failed to load shared state:', error);
            showToast('Failed to load shared schedule', 'error');
            return false;
        }
    }
    return false;
}

function applySharedState(data) {
    if (typeof data.month === 'number') {
        state.currentMonth = data.month;
    }
    if (typeof data.year === 'number') {
        state.currentYear = data.year;
    }
    
    if (data.instructors && Array.isArray(data.instructors)) {
        state.instructors = data.instructors.map(i => ({
            id: i.id,
            name: i.name,
            groups: i.groups || [],
            availableDates: i.availableDates || []
        }));
    }
    if (data.schedule && typeof data.schedule === 'object') {
        state.schedule = data.schedule;
    }
    if (data.classDays && Array.isArray(data.classDays)) {
        state.classDays = data.classDays;
    }
    if (data.cancelledDays && typeof data.cancelledDays === 'object') {
        state.cancelledDays = data.cancelledDays;
    }
    
    if (data.viewOnly) {
        isViewOnlyMode = true;
        applyViewOnlyMode();
    }
    
    history.replaceState(null, '', window.location.pathname);
}

function applyViewOnlyMode() {
    // Add a class to the body for CSS styling
    document.body.classList.add('view-only-mode');
    console.log('View-only mode applied:', document.body.classList.contains('view-only-mode'));
    
    // Update the header title to indicate shared view
    const header = document.querySelector('.header h1');
    if (header) {
        header.textContent = 'Shared Schedule';
    }
}

// Check if we're in view-only mode (for use by other modules)
function isInViewOnlyMode() {
    return isViewOnlyMode;
}

/**
 * In view-only mode, render the calendar as a static image.
 * This gives mobile users native pinch-to-zoom and scroll.
 */
function renderViewOnlyAsImage() {
    const calendarElement = document.getElementById('calendarGrid');
    const calendarArea = document.querySelector('.calendar-area');
    if (!calendarElement || !calendarArea) return;
    
    // Hide interactive elements before capture
    document.querySelectorAll('.surplus-indicator, .cancel-btn, .add-desc, .remove-assistant').forEach(el => {
        el.style.display = 'none';
    });
    
    // Apply export mode for better readability
    calendarElement.classList.add('export-mode');
    
    // Temporarily expand the container so html2canvas captures the full grid,
    // even on narrow mobile viewports where 1fr columns would shrink
    const appContainer = document.querySelector('.app-container');
    const savedAppMinWidth = appContainer ? appContainer.style.minWidth : '';
    const savedAreaOverflow = calendarArea.style.overflow;
    const savedAreaMinWidth = calendarArea.style.minWidth;
    if (appContainer) appContainer.style.minWidth = '1200px';
    calendarArea.style.overflow = 'visible';
    calendarArea.style.minWidth = '1100px';
    
    html2canvas(calendarElement, {
        backgroundColor: '#ffffff',
        scale: 3,
        logging: false,
        windowWidth: 1200
    }).then(canvas => {
        // Restore container styles
        if (appContainer) appContainer.style.minWidth = savedAppMinWidth;
        calendarArea.style.overflow = savedAreaOverflow;
        calendarArea.style.minWidth = savedAreaMinWidth;
        
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.alt = 'Schedule';
        
        // Keep the calendar header (month/year title), replace the grid with the image
        const calendarHeader = calendarArea.querySelector('.calendar-header');
        calendarArea.innerHTML = '';
        if (calendarHeader) {
            calendarArea.appendChild(calendarHeader);
        }
        calendarArea.appendChild(img);
    }).catch(err => {
        console.error('Failed to render view-only image:', err);
        // Restore container styles and fall back to normal HTML view
        if (appContainer) appContainer.style.minWidth = savedAppMinWidth;
        calendarArea.style.overflow = savedAreaOverflow;
        calendarArea.style.minWidth = savedAreaMinWidth;
        calendarElement.classList.remove('export-mode');
    });
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (e) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

async function openShareModal() {
    const modal = document.getElementById('shareModal');
    const longUrlInput = document.getElementById('shareLongUrl');
    const shortUrlInput = document.getElementById('shareShortUrl');
    const shortUrlSection = document.getElementById('shortUrlSection');
    const shortenBtn = document.getElementById('btnShortenUrl');
    const shortenStatus = document.getElementById('shortenStatus');
    const shareDescription = document.getElementById('shareDescription');
    
    // Update description with current month
    const monthName = MONTH_NAMES[state.currentMonth];
    shareDescription.textContent = `Share this link to let others view the ${monthName} ${state.currentYear} schedule. They'll see a read-only view.`;
    
    // Generate the long URL
    const longUrl = generateShareUrl();
    longUrlInput.value = longUrl;
    
    // Reset short URL section
    shortUrlInput.value = '';
    shortUrlSection.style.display = 'none';
    shortenBtn.disabled = false;
    shortenBtn.textContent = '🔗 Shorten URL';
    shortenStatus.textContent = '';
    
    // Show URL size info
    const sizeKB = (longUrl.length / 1024).toFixed(1);
    shortenStatus.textContent = `URL size: ${sizeKB} KB`;
    
    modal.classList.add('active');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('active');
}

async function handleShortenUrl() {
    const longUrlInput = document.getElementById('shareLongUrl');
    const shortUrlInput = document.getElementById('shareShortUrl');
    const shortUrlSection = document.getElementById('shortUrlSection');
    const shortenBtn = document.getElementById('btnShortenUrl');
    const shortenStatus = document.getElementById('shortenStatus');
    
    shortenBtn.disabled = true;
    shortenBtn.textContent = '⏳ Shortening...';
    shortenStatus.textContent = '';
    
    const result = await shortenUrl(longUrlInput.value);
    
    if (result.success) {
        shortUrlInput.value = result.shortUrl;
        shortUrlSection.style.display = 'block';
        shortenBtn.textContent = '✅ Shortened!';
        shortenStatus.textContent = 'Short URL created successfully!';
        shortenStatus.style.color = '#2e7d32';
    } else {
        shortenBtn.disabled = false;
        shortenBtn.textContent = '🔗 Shorten URL';
        shortenStatus.textContent = `Shortening failed: ${result.error}. You can still copy the long URL.`;
        shortenStatus.style.color = '#c62828';
    }
}

async function handleCopyLongUrl() {
    const longUrl = document.getElementById('shareLongUrl').value;
    const success = await copyToClipboard(longUrl);
    if (success) {
        showToast('Long URL copied to clipboard!', 'success');
    } else {
        showToast('Failed to copy URL', 'error');
    }
}

async function handleCopyShortUrl() {
    const shortUrl = document.getElementById('shareShortUrl').value;
    const success = await copyToClipboard(shortUrl);
    if (success) {
        showToast('Short URL copied to clipboard!', 'success');
    } else {
        showToast('Failed to copy URL', 'error');
    }
}
