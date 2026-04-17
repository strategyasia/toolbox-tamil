/**
 * ToolBox Tamil - Admin Authentication
 */

const AdminAuth = {
    SESSION_KEY: 'toolbox_admin_session',
    CREDS_KEY: 'toolbox_admin_creds',

    // Simple hash using btoa (no async, works everywhere)
    simpleHash(str) {
        const salted = str + 'toolbox_2024';
        return btoa(unescape(encodeURIComponent(salted)));
    },

    ensureCredentials() {
        if (!localStorage.getItem(this.CREDS_KEY)) {
            localStorage.setItem(this.CREDS_KEY, JSON.stringify({
                username: 'admin',
                password: this.simpleHash('vino98843B@i')
            }));
        }
    },

    isSetupComplete() {
        return !!localStorage.getItem(this.CREDS_KEY);
    },

    isAuthenticated() {
        const raw = sessionStorage.getItem(this.SESSION_KEY);
        if (!raw) return false;
        try {
            const s = JSON.parse(raw);
            // 30 minute timeout
            return Date.now() - s.loginTime < 30 * 60 * 1000;
        } catch {
            return false;
        }
    },

    async login(username, password) {
        this.ensureCredentials();
        const stored = JSON.parse(localStorage.getItem(this.CREDS_KEY) || '{}');
        const hashed = this.simpleHash(password);

        if (username === stored.username && hashed === stored.password) {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
                username,
                loginTime: Date.now()
            }));
            this.logActivity('login', 'Logged in');
            return { success: true };
        }
        this.logActivity('login_failed', `Failed: ${username}`);
        return { success: false, error: 'Invalid username or password' };
    },

    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
        this.logActivity('logout', 'Logged out');
        window.location.href = 'login.html';
    },

    getUsername() {
        try {
            const s = JSON.parse(sessionStorage.getItem(this.SESSION_KEY) || '{}');
            return s.username || 'Admin';
        } catch { return 'Admin'; }
    },

    logActivity(type, description) {
        try {
            const logs = JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
            logs.unshift({ timestamp: new Date().toISOString(), type, description });
            if (logs.length > 100) logs.length = 100;
            localStorage.setItem('admin_activity_logs', JSON.stringify(logs));
        } catch {}
    },

    getActivityLogs() {
        try {
            return JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
        } catch { return []; }
    },

    async updatePassword(currentPassword, newPassword) {
        const stored = JSON.parse(localStorage.getItem(this.CREDS_KEY) || '{}');
        if (this.simpleHash(currentPassword) !== stored.password)
            return { success: false, error: 'Current password is incorrect' };
        if (newPassword.length < 8)
            return { success: false, error: 'New password must be at least 8 characters' };
        stored.password = this.simpleHash(newPassword);
        localStorage.setItem(this.CREDS_KEY, JSON.stringify(stored));
        return { success: true };
    },

    getSession() {
        try { return JSON.parse(sessionStorage.getItem(this.SESSION_KEY)); } catch { return null; }
    },

    delay(ms) { return new Promise(r => setTimeout(r, ms)); }
};

// Page guard — runs once on load, no loops possible
document.addEventListener('DOMContentLoaded', function () {
    AdminAuth.ensureCredentials();

    const path = window.location.pathname;
    const onLogin = path.includes('login');
    const onSetup = path.includes('setup');
    const authed  = AdminAuth.isAuthenticated();

    if (onLogin || onSetup) {
        // Only redirect away from login if already logged in
        if (onLogin && authed) {
            window.location.replace('index.html');
        }
        return; // Never redirect TO login from the login page
    }

    // Protected page — redirect to login if not authenticated
    if (!authed) {
        window.location.replace('login.html');
    }
});
