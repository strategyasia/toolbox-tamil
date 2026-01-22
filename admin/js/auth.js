/**
 * ToolBox Tamil - Secure Admin Authentication System
 * Handles login, session management, and security with password hashing
 */

const AdminAuth = {
    // Configuration
    SESSION_KEY: 'toolbox_admin_session',
    CREDENTIALS_KEY: 'toolbox_admin_credentials_secure',
    SESSION_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds

    /**
     * Initialize authentication system
     */
    init() {
        this.checkFirstTimeSetup();
        this.checkSession();
        this.setupInactivityTimer();
    },

    /**
     * Check if this is first time setup
     */
    checkFirstTimeSetup() {
        const credentials = localStorage.getItem(this.CREDENTIALS_KEY);
        const currentPage = window.location.pathname;

        if (!credentials && !currentPage.includes('setup.html')) {
            // No credentials set, redirect to setup
            if (!currentPage.includes('setup.html') && !currentPage.includes('login.html')) {
                window.location.href = 'setup.html';
            }
        }
    },

    /**
     * Hash password using SHA-256 equivalent
     */
    async hashPassword(password) {
        // Use Web Crypto API for secure hashing
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'toolbox_tamil_salt_2024'); // Add salt
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    /**
     * Setup initial admin credentials (first time only)
     */
    async setupCredentials(username, password) {
        try {
            // Validate inputs
            if (!username || username.length < 3) {
                return { success: false, error: 'Username must be at least 3 characters' };
            }

            if (!password || password.length < 8) {
                return { success: false, error: 'Password must be at least 8 characters' };
            }

            // Check if already setup
            if (localStorage.getItem(this.CREDENTIALS_KEY)) {
                return { success: false, error: 'Admin already configured' };
            }

            // Hash password
            const hashedPassword = await this.hashPassword(password);

            // Store credentials securely
            const credentials = {
                username: username,
                password: hashedPassword,
                createdAt: Date.now(),
                lastChanged: Date.now()
            };

            localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(credentials));

            // Log activity
            this.logActivity('setup', 'Admin account created');

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Setup failed. Please try again.' };
        }
    },

    /**
     * Login user with credentials
     */
    async login(username, password) {
        try {
            // Simulate API call delay
            await this.delay(500);

            // Check if credentials are set up
            const credentials = localStorage.getItem(this.CREDENTIALS_KEY);
            if (!credentials) {
                return { success: false, error: 'Admin not set up. Please complete setup first.' };
            }

            // Validate credentials
            const isValid = await this.validateCredentials(username, password);

            if (isValid) {
                const session = {
                    username: username,
                    loginTime: Date.now(),
                    lastActivity: Date.now(),
                    token: this.generateToken()
                };

                // Store session
                localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

                // Log activity
                this.logActivity('login', 'User logged in successfully');

                return { success: true };
            } else {
                // Log failed attempt
                this.logActivity('login_failed', `Failed login attempt for user: ${username}`);
                return { success: false, error: 'Invalid username or password' };
            }
        } catch (error) {
            return { success: false, error: 'Login failed. Please try again.' };
        }
    },

    /**
     * Validate user credentials with hashed password
     */
    async validateCredentials(username, password) {
        const stored = this.getStoredCredentials();
        if (!stored) return false;

        // Hash the input password
        const hashedInput = await this.hashPassword(password);

        // Compare username and hashed passwords
        return username === stored.username && hashedInput === stored.password;
    },

    /**
     * Get stored credentials (hashed)
     */
    getStoredCredentials() {
        const stored = localStorage.getItem(this.CREDENTIALS_KEY);
        return stored ? JSON.parse(stored) : null;
    },

    /**
     * Update admin password
     */
    async updatePassword(currentPassword, newPassword) {
        const stored = this.getStoredCredentials();

        if (!stored) {
            return { success: false, error: 'No credentials found' };
        }

        // Verify current password
        const currentHashed = await this.hashPassword(currentPassword);
        if (currentHashed !== stored.password) {
            return { success: false, error: 'Current password is incorrect' };
        }

        if (newPassword.length < 8) {
            return { success: false, error: 'New password must be at least 8 characters' };
        }

        // Hash new password
        const newHashed = await this.hashPassword(newPassword);

        // Update password
        const updated = {
            username: stored.username,
            password: newHashed,
            createdAt: stored.createdAt,
            lastChanged: Date.now()
        };

        localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(updated));
        this.logActivity('password_change', 'Password updated successfully');

        return { success: true };
    },

    /**
     * Reset admin (emergency use only - requires confirmation)
     */
    resetAdmin(confirmationCode) {
        // Security measure: require specific confirmation
        const expectedCode = 'RESET_TOOLBOX_TAMIL_ADMIN_2024';

        if (confirmationCode !== expectedCode) {
            this.logActivity('reset_failed', 'Failed admin reset attempt');
            return { success: false, error: 'Invalid confirmation code' };
        }

        // Clear all admin data
        localStorage.removeItem(this.CREDENTIALS_KEY);
        localStorage.removeItem(this.SESSION_KEY);
        this.logActivity('reset', 'Admin account reset');

        return { success: true };
    },

    /**
     * Check if admin is set up
     */
    isSetupComplete() {
        return localStorage.getItem(this.CREDENTIALS_KEY) !== null;
    },

    /**
     * Logout current user
     */
    logout() {
        this.logActivity('logout', 'User logged out');
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const session = this.getSession();

        if (!session) return false;

        // Check if session has expired
        const now = Date.now();
        const elapsed = now - session.lastActivity;

        if (elapsed > this.SESSION_DURATION) {
            this.logout();
            return false;
        }

        // Update last activity
        session.lastActivity = now;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        return true;
    },

    /**
     * Get current session
     */
    getSession() {
        const data = localStorage.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Check session and redirect if needed
     */
    checkSession() {
        const currentPage = window.location.pathname;
        const isLoginPage = currentPage.includes('login.html');
        const isSetupPage = currentPage.includes('setup.html');
        const isAuthenticated = this.isAuthenticated();
        const isSetup = this.isSetupComplete();

        // If not set up, redirect to setup page
        if (!isSetup && !isSetupPage) {
            window.location.href = 'setup.html';
            return;
        }

        // If set up but not logged in and not on login/setup page
        if (isSetup && !isAuthenticated && !isLoginPage && !isSetupPage) {
            window.location.href = 'login.html';
            return;
        }

        // If logged in and on login page, redirect to dashboard
        if (isLoginPage && isAuthenticated) {
            window.location.href = 'index.html';
            return;
        }

        // If on setup page but already set up, redirect to login
        if (isSetupPage && isSetup) {
            window.location.href = 'login.html';
            return;
        }
    },

    /**
     * Setup inactivity timer
     */
    setupInactivityTimer() {
        const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.isAuthenticated()) {
                    const session = this.getSession();
                    session.lastActivity = Date.now();
                    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
                }
            });
        });

        // Check every minute for session timeout
        setInterval(() => {
            if (!this.isAuthenticated() && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('setup.html')) {
                alert('Your session has expired. Please login again.');
                this.logout();
            }
        }, 60000);
    },

    /**
     * Generate session token
     */
    generateToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    },

    /**
     * Log activity
     */
    logActivity(type, description) {
        const logs = this.getActivityLogs();
        logs.unshift({
            timestamp: new Date().toISOString(),
            type: type,
            description: description,
            ip: 'Local',
            status: type.includes('failed') ? 'failed' : 'success'
        });

        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(100);
        }

        localStorage.setItem('admin_activity_logs', JSON.stringify(logs));
    },

    /**
     * Get activity logs
     */
    getActivityLogs() {
        const data = localStorage.getItem('admin_activity_logs');
        return data ? JSON.parse(data) : [];
    },

    /**
     * Helper: Delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Get current admin username
     */
    getUsername() {
        const session = this.getSession();
        return session ? session.username : 'Admin';
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AdminAuth.init();
});
