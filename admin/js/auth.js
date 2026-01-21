/**
 * ToolBox Tamil - Admin Authentication System
 * Handles login, session management, and security
 */

const AdminAuth = {
    // Configuration
    SESSION_KEY: 'toolbox_admin_session',
    TIMEOUT_KEY: 'toolbox_admin_timeout',
    SESSION_DURATION: 30 * 60 * 1000, // 30 minutes in milliseconds
    
    // Default credentials (CHANGE THESE!)
    DEFAULT_CREDENTIALS: {
        username: 'admin',
        password: 'admin123' // Hash this in production!
    },

    /**
     * Initialize authentication system
     */
    init() {
        this.checkSession();
        this.setupInactivityTimer();
    },

    /**
     * Login user with credentials
     */
    async login(username, password) {
        try {
            // Simulate API call delay
            await this.delay(800);

            // Validate credentials
            if (this.validateCredentials(username, password)) {
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
                this.logActivity('login_failed', 'Failed login attempt');
                return { success: false, error: 'Invalid username or password' };
            }
        } catch (error) {
            return { success: false, error: 'Login failed. Please try again.' };
        }
    },

    /**
     * Validate user credentials
     */
    validateCredentials(username, password) {
        // Get stored credentials or use defaults
        const stored = this.getStoredCredentials();
        return username === stored.username && password === stored.password;
    },

    /**
     * Get stored credentials
     */
    getStoredCredentials() {
        const stored = localStorage.getItem('admin_credentials');
        return stored ? JSON.parse(stored) : this.DEFAULT_CREDENTIALS;
    },

    /**
     * Update admin password
     */
    updatePassword(currentPassword, newPassword) {
        const stored = this.getStoredCredentials();
        
        if (currentPassword !== stored.password) {
            return { success: false, error: 'Current password is incorrect' };
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Update password
        const updated = {
            username: stored.username,
            password: newPassword
        };
        
        localStorage.setItem('admin_credentials', JSON.stringify(updated));
        this.logActivity('password_change', 'Password updated successfully');
        
        return { success: true };
    },

    /**
     * Logout current user
     */
    logout() {
        this.logActivity('logout', 'User logged out');
        localStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.TIMEOUT_KEY);
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
        const isAuthenticated = this.isAuthenticated();

        if (isLoginPage && isAuthenticated) {
            // Already logged in, redirect to dashboard
            window.location.href = 'index.html';
        } else if (!isLoginPage && !isAuthenticated) {
            // Not logged in, redirect to login
            window.location.href = 'login.html';
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
            if (!this.isAuthenticated() && !window.location.pathname.includes('login.html')) {
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
            ip: 'Local', // In production, get real IP
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
