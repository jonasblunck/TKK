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
        for (const group of GROUPS) {
            if (dayData[group]?.instructorId) {
                assignedInstructorIds.add(dayData[group].instructorId);
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

function generateShareUrl() {
    const data = getShareableState();
    const json = JSON.stringify(data);
    const compressed = LZString.compressToEncodedURIComponent(json);
    const baseUrl = window.location.origin + window.location.pathname;
    // Use query parameter instead of hash - URL shorteners preserve query params but strip hashes
    return `${baseUrl}?s=${compressed}`;
}

async function shortenUrl(longUrl) {
    try {
        // Use is.gd API (supports CORS)
        const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
        if (!response.ok) {
            throw new Error('URL shortening failed');
        }
        const data = await response.json();
        if (data.shorturl) {
            return { success: true, shortUrl: data.shorturl };
        } else {
            throw new Error(data.errormessage || 'Unknown error');
        }
    } catch (error) {
        console.warn('URL shortening failed:', error);
        return { success: false, error: error.message };
    }
}

function loadStateFromUrl() {
    // Check for query parameter first (new format, works with URL shorteners)
    const urlParams = new URLSearchParams(window.location.search);
    const shareParam = urlParams.get('s');
    
    // Also check hash for backwards compatibility
    const hash = window.location.hash;
    const hashData = (hash && hash.startsWith('#share=')) ? hash.substring(7) : null;
    
    const compressed = shareParam || hashData;
    
    if (compressed) {
        try {
            const json = LZString.decompressFromEncodedURIComponent(compressed);
            if (!json) {
                throw new Error('Failed to decompress data');
            }
            const data = JSON.parse(json);
            
            // Set the month/year to display
            if (typeof data.month === 'number') {
                state.currentMonth = data.month;
            }
            if (typeof data.year === 'number') {
                state.currentYear = data.year;
            }
            
            // Load instructors (minimal data for display)
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
            
            // Enable view-only mode if specified
            if (data.viewOnly) {
                isViewOnlyMode = true;
                applyViewOnlyMode();
            }
            
            // Clear the hash to clean up the URL (but keep view-only mode active)
            history.replaceState(null, '', window.location.pathname);
            
            return true;
        } catch (error) {
            console.error('Failed to load shared state:', error);
            showToast('Failed to load shared schedule', 'error');
            return false;
        }
    }
    return false;
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
