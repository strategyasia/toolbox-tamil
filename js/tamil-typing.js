/**
 * Tamil Typing Tool - Transliteration Engine
 * Converts English letters to Tamil script
 */

// Tamil transliteration map
const tamilMap = {
    // Vowels
    'a': 'அ',
    'aa': 'ஆ', 'A': 'ஆ',
    'i': 'இ',
    'ee': 'ஈ', 'ii': 'ஈ', 'I': 'ஈ',
    'u': 'உ',
    'oo': 'ஊ', 'uu': 'ஊ', 'U': 'ஊ',
    'e': 'எ',
    'ae': 'ஏ', 'E': 'ஏ',
    'ai': 'ஐ',
    'o': 'ஒ',
    'O': 'ஓ', 'oe': 'ஓ',
    'au': 'ஔ',

    // Consonants with 'a'
    'ka': 'க', 'ga': 'க',
    'nga': 'ங',
    'sa': 'ச', 'cha': 'ச',
    'ja': 'ஜ',
    'nya': 'ஞ', 'nja': 'ஞ',
    'ta': 'ட', 'da': 'ட',
    'na': 'ண',
    'tha': 'த', 'dha': 'த',
    'nha': 'ந',
    'pa': 'ப', 'ba': 'ப',
    'ma': 'ம',
    'ya': 'ய',
    'ra': 'ர',
    'la': 'ல',
    'va': 'வ', 'wa': 'வ',
    'zha': 'ழ', 'Zha': 'ழ',
    'La': 'ள', 'laa': 'ள',
    'Ra': 'ற', 'raa': 'ற',
    'Na': 'ன', 'naa': 'ன',

    // Consonants without vowel (pulli)
    'k': 'க்',
    'ng': 'ங்',
    'ch': 'ச்',
    'j': 'ஜ்',
    'ny': 'ஞ்',
    't': 'ட்',
    'n': 'ண்',
    'th': 'த்',
    'nh': 'ந்',
    'p': 'ப்',
    'm': 'ம்',
    'y': 'ய்',
    'r': 'ர்',
    'l': 'ல்',
    'v': 'வ்', 'w': 'வ்',
    'zh': 'ழ்',
    'L': 'ள்',
    'R': 'ற்',
    'N': 'ன்',

    // Common combinations
    'kaa': 'கா',
    'ki': 'கி',
    'kee': 'கீ', 'kii': 'கீ',
    'ku': 'கு',
    'koo': 'கூ', 'kuu': 'கூ',
    'ke': 'கெ',
    'kae': 'கே',
    'kai': 'கை',
    'ko': 'கொ',
    'kO': 'கோ',
    'kau': 'கௌ',

    // Numbers
    '0': '௦',
    '1': '௧',
    '2': '௨',
    '3': '௩',
    '4': '௪',
    '5': '௫',
    '6': '௬',
    '7': '௭',
    '8': '௮',
    '9': '௯'
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Transliterate on input
    inputText.addEventListener('input', function() {
        const englishText = this.value;
        const tamilText = transliterate(englishText);
        outputText.value = tamilText;
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', function() {
        if (outputText.value.trim()) {
            outputText.select();
            document.execCommand('copy');
            showNotification('Tamil text copied to clipboard! ✓', 'success');
        } else {
            showNotification('Nothing to copy! Type something first.', 'info');
        }
    });

    // Clear all
    clearBtn.addEventListener('click', function() {
        inputText.value = '';
        outputText.value = '';
        inputText.focus();
    });

    // Download as text file
    downloadBtn.addEventListener('click', function() {
        if (outputText.value.trim()) {
            downloadTextFile(outputText.value, 'tamil-text.txt');
            showNotification('File downloaded! ✓', 'success');
        } else {
            showNotification('Nothing to download! Type something first.', 'info');
        }
    });
});

/**
 * Transliterate English to Tamil
 */
function transliterate(text) {
    if (!text) return '';

    // Store result
    let result = '';
    let i = 0;

    while (i < text.length) {
        let matched = false;

        // Try to match longer patterns first (4 chars, 3 chars, 2 chars, 1 char)
        for (let len = 4; len >= 1; len--) {
            if (i + len <= text.length) {
                const substr = text.substr(i, len);
                if (tamilMap[substr]) {
                    result += tamilMap[substr];
                    i += len;
                    matched = true;
                    break;
                }
            }
        }

        // If no match found, keep the original character
        if (!matched) {
            result += text[i];
            i++;
        }
    }

    return result;
}

/**
 * Download text as file
 */
function downloadTextFile(text, filename) {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Style based on type
    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else {
        notification.style.background = '#FF6B6B';
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add slide down animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
