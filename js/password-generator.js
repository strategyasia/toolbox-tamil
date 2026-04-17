/**
 * Password Generator
 * Generate strong, secure passwords
 */

const CHARS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    ambiguous: 'O0lI1'
};

document.addEventListener('DOMContentLoaded', function() {
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthValue = document.getElementById('lengthValue');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const generateMultipleBtn = document.getElementById('generateMultipleBtn');
    const copyAllBtn = document.getElementById('copyAllBtn');

    // Length slider
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });

    // Generate password
    generateBtn.addEventListener('click', () => {
        const password = generatePassword();
        displayPassword(password);
    });

    // Copy password
    copyBtn.addEventListener('click', copyPassword);

    // Generate multiple passwords
    generateMultipleBtn.addEventListener('click', generateMultiplePasswords);

    // Copy all passwords
    copyAllBtn.addEventListener('click', copyAllPasswords);

    // Generate on page load
    const initialPassword = generatePassword();
    displayPassword(initialPassword);
});

/**
 * Generate password based on options
 */
function generatePassword() {
    const length = parseInt(document.getElementById('lengthSlider').value);
    const includeUppercase = document.getElementById('includeUppercase').checked;
    const includeLowercase = document.getElementById('includeLowercase').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;
    const excludeAmbiguous = document.getElementById('excludeAmbiguous').checked;

    // Build character set
    let charset = '';
    if (includeUppercase) charset += CHARS.uppercase;
    if (includeLowercase) charset += CHARS.lowercase;
    if (includeNumbers) charset += CHARS.numbers;
    if (includeSymbols) charset += CHARS.symbols;

    // Exclude ambiguous characters if selected
    if (excludeAmbiguous) {
        charset = charset.split('').filter(char => !CHARS.ambiguous.includes(char)).join('');
    }

    // Check if at least one option is selected
    if (charset.length === 0) {
        showNotification('Please select at least one character type', 'error');
        return '';
    }

    // Generate password
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
}

/**
 * Display password and calculate strength
 */
function displayPassword(password) {
    const passwordDisplay = document.getElementById('generatedPassword');
    passwordDisplay.textContent = password;
    passwordDisplay.style.fontFamily = 'monospace';
    passwordDisplay.style.fontSize = '1.25rem';
    passwordDisplay.style.color = 'var(--text-primary)';

    // Calculate and display strength
    calculateStrength(password);
}

/**
 * Calculate password strength
 */
function calculateStrength(password) {
    let strength = 0;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (!password) {
        strengthFill.style.width = '0%';
        strengthText.textContent = 'Strength: -';
        return;
    }

    // Length score
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (password.length >= 16) strength += 10;

    // Character variety score
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    // Update UI
    strengthFill.style.width = strength + '%';

    let strengthLabel = '';
    let color = '';

    if (strength < 40) {
        strengthLabel = 'Weak';
        color = '#f44336';
    } else if (strength < 70) {
        strengthLabel = 'Medium';
        color = '#ff9800';
    } else if (strength < 90) {
        strengthLabel = 'Strong';
        color = '#4CAF50';
    } else {
        strengthLabel = 'Very Strong';
        color = '#2196F3';
    }

    strengthFill.style.background = color;
    strengthText.textContent = `Strength: ${strengthLabel} (${strength}%)`;
    strengthText.style.color = color;
}

/**
 * Copy password to clipboard
 */
function copyPassword() {
    const password = document.getElementById('generatedPassword').textContent;

    if (!password || password === 'Click generate to create password') {
        showNotification('Generate a password first', 'error');
        return;
    }

    navigator.clipboard.writeText(password).then(() => {
        showNotification('Password copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy password', 'error');
    });
}

/**
 * Generate multiple passwords
 */
function generateMultiplePasswords() {
    const passwords = [];

    for (let i = 0; i < 10; i++) {
        passwords.push(generatePassword());
    }

    // Display passwords
    const passwordsList = document.getElementById('passwordsList');
    passwordsList.innerHTML = '';

    passwords.forEach((password, index) => {
        const passwordItem = document.createElement('div');
        passwordItem.className = 'password-item';
        passwordItem.innerHTML = `
            <span class="password-number">#${index + 1}</span>
            <span class="password-value">${password}</span>
            <button class="copy-single-btn" data-password="${password}">📋</button>
        `;

        // Copy individual password
        passwordItem.querySelector('.copy-single-btn').addEventListener('click', function() {
            const pwd = this.dataset.password;
            navigator.clipboard.writeText(pwd);
            showNotification('Password copied!', 'success');
        });

        passwordsList.appendChild(passwordItem);
    });

    document.getElementById('multiplePasswords').style.display = 'block';
}

/**
 * Copy all passwords
 */
function copyAllPasswords() {
    const passwordItems = document.querySelectorAll('.password-value');
    const passwords = Array.from(passwordItems).map(item => item.textContent).join('\n');

    navigator.clipboard.writeText(passwords).then(() => {
        showNotification('All passwords copied!', 'success');
    }).catch(() => {
        showNotification('Failed to copy passwords', 'error');
    });
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else {
        notification.style.background = '#FF6B6B';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
