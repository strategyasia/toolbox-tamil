/**
 * ToolBox Tamil - Login Page Handler
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const demoAlert = document.getElementById('demoAlert');

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Validate inputs
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        // Show loading state
        setLoading(true);
        hideError();

        // Attempt login
        const result = await AdminAuth.login(username, password);

        if (result.success) {
            // Hide demo alert on first successful login
            if (demoAlert) {
                localStorage.setItem('demo_alert_dismissed', 'true');
            }

            // Show success message
            showSuccess('Login successful! Redirecting...');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            setLoading(false);
            showError(result.error || 'Login failed. Please try again.');
            
            // Shake animation on error
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
        }
    });

    // Auto-fill demo credentials (for demo purposes only!)
    usernameInput.addEventListener('focus', () => {
        if (demoAlert && !localStorage.getItem('demo_alert_dismissed')) {
            demoAlert.style.animation = 'pulse 0.5s';
        }
    });

    // Helper functions
    function setLoading(loading) {
        if (loading) {
            loginBtn.disabled = true;
            loginBtn.querySelector('.btn-text').style.display = 'none';
            loginBtn.querySelector('.btn-loader').style.display = 'flex';
        } else {
            loginBtn.disabled = false;
            loginBtn.querySelector('.btn-text').style.display = 'block';
            loginBtn.querySelector('.btn-loader').style.display = 'none';
        }
    }

    function showError(message) {
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

    // Dismiss demo alert
    if (demoAlert && localStorage.getItem('demo_alert_dismissed')) {
        demoAlert.style.display = 'none';
    }

    // Focus username field
    usernameInput.focus();
});

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    .shake {
        animation: shake 0.5s;
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(style);
