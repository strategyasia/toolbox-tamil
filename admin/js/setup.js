/**
 * ToolBox Tamil - Admin Setup Wizard
 * Handles first-time admin account creation
 */

document.addEventListener('DOMContentLoaded', async () => {
    const setupForm = document.getElementById('setupForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const setupBtn = document.getElementById('setupBtn');
    const errorMessage = document.getElementById('errorMessage');
    const passwordStrength = document.getElementById('passwordStrength');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    // Wait for AdminAuth to initialize and auto-configure if needed
    console.log('Setup page: Waiting for AdminAuth initialization...');
    await AdminAuth.autoSetupDefaultAdmin();
    await new Promise(resolve => setTimeout(resolve, 200)); // Small delay

    // Check if already setup
    console.log('Setup page: Checking if setup complete...');
    if (AdminAuth.isSetupComplete()) {
        console.log('Setup page: Credentials found! Redirecting to login...');
        window.location.href = 'login.html';
        return;
    }

    console.log('Setup page: No credentials found, showing setup form');

    // Password strength meter
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;

        if (password.length === 0) {
            passwordStrength.style.display = 'none';
            return;
        }

        passwordStrength.style.display = 'block';
        const strength = calculatePasswordStrength(password);
        updateStrengthMeter(strength);
    });

    // Handle form submission
    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validate inputs
        if (!username || username.length < 3) {
            showError('Username must be at least 3 characters long');
            return;
        }

        if (!password || password.length < 8) {
            showError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        // Check password strength
        const strength = calculatePasswordStrength(password);
        if (strength.score < 2) {
            showError('Please choose a stronger password. Add numbers, special characters, or make it longer.');
            return;
        }

        // Show loading state
        setLoading(true);
        hideError();

        // Setup admin credentials
        const result = await AdminAuth.setupCredentials(username, password);

        if (result.success) {
            // Show success message
            showSuccess('✅ Admin account created successfully! Redirecting to login...');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            setLoading(false);
            showError(result.error || 'Setup failed. Please try again.');
        }
    });

    // Calculate password strength
    function calculatePasswordStrength(password) {
        let score = 0;
        const feedback = [];

        // Length
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;

        // Character variety
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;

        // Patterns (reduce score for common patterns)
        if (/^[a-zA-Z]+$/.test(password)) score -= 1; // Only letters
        if (/^[0-9]+$/.test(password)) score -= 2; // Only numbers
        if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters

        // Determine strength level
        let level, color, width;
        if (score <= 2) {
            level = 'Weak';
            color = '#FF6B6B';
            width = '33%';
        } else if (score <= 4) {
            level = 'Medium';
            color = '#FFC107';
            width = '66%';
        } else {
            level = 'Strong';
            color = '#51CF66';
            width = '100%';
        }

        return { score, level, color, width };
    }

    // Update strength meter
    function updateStrengthMeter(strength) {
        strengthFill.style.width = strength.width;
        strengthFill.style.background = strength.color;
        strengthText.textContent = `Password strength: ${strength.level}`;
        strengthText.style.color = strength.color;
    }

    // Helper functions
    function setLoading(loading) {
        if (loading) {
            setupBtn.disabled = true;
            setupBtn.querySelector('.btn-text').style.display = 'none';
            setupBtn.querySelector('.btn-loader').style.display = 'flex';
        } else {
            setupBtn.disabled = false;
            setupBtn.querySelector('.btn-text').style.display = 'block';
            setupBtn.querySelector('.btn-loader').style.display = 'none';
        }
    }

    function showError(message) {
        errorMessage.className = 'alert alert-error';
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.style.display = 'none';
    }

    function showSuccess(message) {
        errorMessage.className = 'alert alert-success';
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    // Focus username field
    usernameInput.focus();
});

// Add strength meter styles
const style = document.createElement('style');
style.textContent = `
    .password-strength {
        margin-top: -8px;
        margin-bottom: 16px;
    }

    .strength-meter {
        height: 6px;
        background: #E1E8ED;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 8px;
    }

    .strength-fill {
        height: 100%;
        width: 0%;
        transition: all 0.3s ease;
        border-radius: 3px;
    }

    .strength-text {
        font-size: 13px;
        font-weight: 500;
        margin: 0;
    }

    .security-tips h4 {
        color: #2D3436;
    }

    .security-tips ul {
        margin: 0;
        color: #636E72;
    }

    .security-tips li {
        margin-bottom: 4px;
    }
`;
document.head.appendChild(style);
