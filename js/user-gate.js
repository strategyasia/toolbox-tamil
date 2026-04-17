/**
 * UserGate — Lead capture gate for ToolBox Tamil
 * Rule: 1 free use per tool, signup required on 2nd use.
 * Returning users can sign in with just their email (any device).
 * After registering/signing in once per device, all tools are free forever.
 */

const UserGate = {
    USER_KEY:  'toolbox_user',
    LEADS_KEY: 'toolbox_leads',
    USES_KEY:  'tb_my_uses',

    /* ─── Public API ─── */

    isRegistered() {
        return !!localStorage.getItem(this.USER_KEY);
    },

    getUser() {
        try { return JSON.parse(localStorage.getItem(this.USER_KEY)); } catch { return null; }
    },

    getLeads() {
        try { return JSON.parse(localStorage.getItem(this.LEADS_KEY)) || []; } catch { return []; }
    },

    /**
     * Called from homepage tool card click.
     * 1st click → free pass. 2nd+ click → gate (unless registered).
     */
    checkAndProceed(toolId, toolName, navigateFn) {
        if (this.isRegistered()) {
            this._incCount(toolId);
            this._logAccess(toolId, toolName);
            navigateFn();
            return;
        }
        if (this._getCount(toolId) === 0) {
            this._incCount(toolId);
            navigateFn();
            return;
        }
        this._showModal(toolId, toolName, () => {
            this._incCount(toolId);
            navigateFn();
        });
    },

    /**
     * Auto-called on tool page load.
     * Blocks page on 2nd+ visit if not registered.
     */
    checkOnToolLoad() {
        const toolId   = this._toolIdFromUrl();
        const toolName = this._toolNameFromUrl();
        if (!toolId) return;

        if (this.isRegistered()) {
            this._incCount(toolId);
            this._logAccess(toolId, toolName);
            return;
        }
        if (this._getCount(toolId) === 0) {
            this._incCount(toolId);
            return;
        }
        this._showModal(toolId, toolName, () => {
            this._incCount(toolId);
        });
    },

    /* ─── Email sign-in for returning users (cross-device) ─── */

    _findLeadByEmail(email) {
        return this.getLeads().find(l => l.email.toLowerCase() === email.toLowerCase()) || null;
    },

    _signInWithEmail(email) {
        const lead = this._findLeadByEmail(email);
        if (!lead) return false;
        localStorage.setItem(this.USER_KEY, JSON.stringify({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            registeredAt: lead.date,
            signedInAt: new Date().toISOString()
        }));
        return true;
    },

    /* ─── Use-count helpers ─── */

    _getCount(toolId) {
        try { return (JSON.parse(localStorage.getItem(this.USES_KEY)) || {})[toolId] || 0; } catch { return 0; }
    },

    _incCount(toolId) {
        try {
            const u = JSON.parse(localStorage.getItem(this.USES_KEY)) || {};
            u[toolId] = (u[toolId] || 0) + 1;
            localStorage.setItem(this.USES_KEY, JSON.stringify(u));
        } catch {}
    },

    /* ─── Registration / access logging ─── */

    _registerUser(name, email, phone, toolId, toolName) {
        localStorage.setItem(this.USER_KEY, JSON.stringify({
            name, email, phone,
            registeredAt: new Date().toISOString()
        }));
        this._logAccess(toolId, toolName, name, email, phone);
    },

    _logAccess(toolId, toolName, name, email, phone) {
        const user = this.getUser();
        const leads = this.getLeads();
        leads.unshift({
            id: Date.now(),
            name:     name  || user?.name  || '',
            email:    email || user?.email || '',
            phone:    phone || user?.phone || '',
            toolId,
            toolName: toolName || toolId,
            date: new Date().toISOString()
        });
        if (leads.length > 5000) leads.splice(5000);
        localStorage.setItem(this.LEADS_KEY, JSON.stringify(leads));
    },

    /* ─── URL helpers ─── */

    _toolIdFromUrl() {
        const m = window.location.pathname.match(/\/tools\/([^/]+?)(?:\.html)?$/);
        return m ? m[1] : null;
    },

    _toolNameFromUrl() {
        const id = this._toolIdFromUrl();
        return id ? id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
    },

    /* ─── Modal ─── */

    _showModal(toolId, toolName, onSuccess) {
        if (!document.getElementById('gate-styles')) {
            const s = document.createElement('style');
            s.id = 'gate-styles';
            s.textContent = `
                @keyframes gateBackdropIn { from{opacity:0} to{opacity:1} }
                @keyframes gateCardIn     { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:none} }
                @keyframes gateSpin       { to{transform:rotate(360deg)} }
                @keyframes gateSuccess    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }

                #gate-backdrop {
                    position:fixed; inset:0;
                    background:rgba(15,12,9,.72);
                    backdrop-filter:blur(6px);
                    z-index:99999;
                    display:flex; align-items:center; justify-content:center;
                    animation:gateBackdropIn .22s ease; padding:1rem;
                }
                #gate-card {
                    background:#fff; border-radius:20px;
                    width:100%; max-width:420px;
                    box-shadow:0 24px 64px rgba(0,0,0,.28); overflow:hidden;
                    animation:gateCardIn .3s cubic-bezier(.4,0,.2,1);
                }
                #gate-card .gate-top {
                    background:linear-gradient(135deg,#FF6B6B,#FF8E53);
                    padding:2rem 2rem 1.5rem; text-align:center; color:#fff;
                }
                #gate-card .gate-top .gate-logo {
                    width:52px; height:52px; background:rgba(255,255,255,.22);
                    border-radius:14px; display:inline-flex; align-items:center;
                    justify-content:center; margin-bottom:.85rem; font-size:1.6rem;
                }
                #gate-card .gate-top h2 { font-size:1.35rem; font-weight:800; margin:0 0 .35rem; letter-spacing:-.3px; }
                #gate-card .gate-top p  { font-size:.85rem; opacity:.88; margin:0; line-height:1.5; }
                #gate-card .gate-tool-badge {
                    display:inline-flex; align-items:center; gap:.4rem;
                    background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.3);
                    border-radius:999px; padding:.25rem .8rem;
                    font-size:.72rem; font-weight:700; letter-spacing:.4px;
                    text-transform:uppercase; margin-top:.75rem;
                }
                #gate-card .gate-body { padding:1.5rem 2rem 2rem; }
                #gate-card .gate-tabs {
                    display:flex; border-bottom:2px solid #f0f0f0; margin-bottom:1.25rem;
                }
                #gate-card .gate-tab {
                    flex:1; padding:.6rem; text-align:center; font-size:.82rem;
                    font-weight:700; color:#999; cursor:pointer; border:none;
                    background:none; font-family:inherit; letter-spacing:.2px;
                    border-bottom:2px solid transparent; margin-bottom:-2px;
                    transition:color .2s, border-color .2s;
                }
                #gate-card .gate-tab.active { color:#FF6B6B; border-bottom-color:#FF6B6B; }
                #gate-card .gate-panel { display:none; }
                #gate-card .gate-panel.active { display:block; }
                #gate-card .gate-free-note {
                    background:#fff8f0; border:1px solid #ffe0b2; border-radius:10px;
                    padding:.65rem 1rem; margin-bottom:1.1rem;
                    font-size:.78rem; color:#e65100; text-align:center; font-weight:600;
                }
                #gate-card .gate-field { margin-bottom:.9rem; }
                #gate-card .gate-field label {
                    display:block; font-size:.78rem; font-weight:700;
                    color:#2d3436; margin-bottom:.4rem; letter-spacing:.2px;
                }
                #gate-card .gate-field input {
                    width:100%; box-sizing:border-box; border:1.5px solid #e0e0e0;
                    border-radius:10px; padding:.7rem .9rem; font-size:.92rem;
                    color:#2d3436; outline:none; font-family:inherit;
                    transition:border-color .2s, box-shadow .2s;
                }
                #gate-card .gate-field input:focus { border-color:#FF6B6B; box-shadow:0 0 0 3px rgba(255,107,107,.12); }
                #gate-card .gate-field input.error { border-color:#e53e3e; }
                #gate-card .gate-field .field-error { display:none; color:#e53e3e; font-size:.72rem; margin-top:.3rem; }
                #gate-card .gate-field .field-error.show { display:block; }
                .gate-btn {
                    width:100%; padding:.85rem;
                    background:linear-gradient(135deg,#FF6B6B,#FF8E53);
                    border:none; border-radius:12px; color:#fff;
                    font-size:.95rem; font-weight:700; cursor:pointer;
                    margin-top:.4rem; font-family:inherit; letter-spacing:.2px;
                    display:flex; align-items:center; justify-content:center; gap:.5rem;
                    transition:opacity .2s, transform .2s;
                }
                .gate-btn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
                .gate-btn:disabled { opacity:.7; cursor:not-allowed; transform:none; }
                .gate-btn .gate-spinner {
                    width:16px; height:16px; border:2px solid rgba(255,255,255,.4);
                    border-top-color:#fff; border-radius:50%;
                    animation:gateSpin .7s linear infinite; display:none;
                }
                .gate-btn.loading .gate-spinner { display:block; }
                .gate-btn.loading .gate-btn-text { display:none; }
                #gate-card .gate-privacy {
                    text-align:center; margin-top:.9rem; font-size:.72rem; color:#888;
                    display:flex; align-items:center; justify-content:center; gap:.35rem;
                }
                #gate-signin-error {
                    display:none; background:#fff0f0; border:1px solid #ffcccc;
                    border-radius:8px; padding:.6rem .9rem; font-size:.8rem;
                    color:#c0392b; margin-top:.75rem; text-align:center;
                }
                #gate-success {
                    display:none; text-align:center; padding:2.5rem 2rem;
                    animation:gateSuccess .4s ease;
                }
                #gate-success .success-icon {
                    width:64px; height:64px;
                    background:linear-gradient(135deg,#FF6B6B,#FF8E53);
                    border-radius:50%; display:inline-flex; align-items:center;
                    justify-content:center; font-size:1.8rem; margin-bottom:1rem;
                }
                #gate-success h3 { font-size:1.2rem; font-weight:800; color:#2d3436; margin:0 0 .4rem; }
                #gate-success p  { color:#636e72; font-size:.88rem; margin:0; }
            `;
            document.head.appendChild(s);
        }

        const backdrop = document.createElement('div');
        backdrop.id = 'gate-backdrop';
        backdrop.innerHTML = `
            <div id="gate-card">
                <div class="gate-top">
                    <div class="gate-logo">🛠️</div>
                    <h2 id="gate-title">One More Step</h2>
                    <p id="gate-subtitle">You've used your 1 free access. Sign up or sign in — it's 100% free.</p>
                    <div class="gate-tool-badge">✦ ${toolName}</div>
                </div>

                <div class="gate-body">
                    <!-- Tabs -->
                    <div class="gate-tabs">
                        <button class="gate-tab active" data-panel="signup">New User</button>
                        <button class="gate-tab" data-panel="signin">Already Registered</button>
                    </div>

                    <!-- Sign Up Panel -->
                    <div class="gate-panel active" id="panel-signup">
                        <div class="gate-free-note">🎉 Free forever — no credit card, no payment ever</div>
                        <form id="gate-signup-form" novalidate>
                            <div class="gate-field">
                                <label for="gate-name">Full Name</label>
                                <input type="text" id="gate-name" placeholder="e.g. Arun Kumar" autocomplete="name" />
                                <div class="field-error" id="err-name">Please enter your full name</div>
                            </div>
                            <div class="gate-field">
                                <label for="gate-email">Email Address</label>
                                <input type="email" id="gate-email" placeholder="e.g. arun@example.com" autocomplete="email" />
                                <div class="field-error" id="err-email">Please enter a valid email</div>
                            </div>
                            <div class="gate-field">
                                <label for="gate-phone">Phone Number</label>
                                <input type="tel" id="gate-phone" placeholder="e.g. +91 98765 43210" autocomplete="tel" />
                                <div class="field-error" id="err-phone">Please enter a valid phone number</div>
                            </div>
                            <button type="submit" class="gate-btn" id="gate-signup-btn">
                                <span class="gate-btn-text">Get Free Access →</span>
                                <span class="gate-spinner"></span>
                            </button>
                            <div class="gate-privacy">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Your information is secure and will never be shared.
                            </div>
                        </form>
                    </div>

                    <!-- Sign In Panel -->
                    <div class="gate-panel" id="panel-signin">
                        <div class="gate-free-note">👋 Welcome back! Enter your registered email to continue.</div>
                        <form id="gate-signin-form" novalidate>
                            <div class="gate-field">
                                <label for="gate-signin-email">Your Email Address</label>
                                <input type="email" id="gate-signin-email" placeholder="e.g. arun@example.com" autocomplete="email" />
                                <div class="field-error" id="err-signin-email">Please enter a valid email</div>
                            </div>
                            <button type="submit" class="gate-btn" id="gate-signin-btn">
                                <span class="gate-btn-text">Sign In & Continue →</span>
                                <span class="gate-spinner"></span>
                            </button>
                            <div id="gate-signin-error">Email not found. Please sign up as a new user.</div>
                        </form>
                    </div>

                    <!-- Success state -->
                    <div id="gate-success">
                        <div class="success-icon">✓</div>
                        <h3 id="success-msg">You're all set!</h3>
                        <p>Enjoy unlimited access to all tools.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('gate-name')?.focus(), 100);

        /* ── Tab switching ── */
        backdrop.querySelectorAll('.gate-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                backdrop.querySelectorAll('.gate-tab').forEach(t => t.classList.remove('active'));
                backdrop.querySelectorAll('.gate-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.panel).classList.add('active');
                if (tab.dataset.panel === 'signin') {
                    setTimeout(() => document.getElementById('gate-signin-email')?.focus(), 80);
                } else {
                    setTimeout(() => document.getElementById('gate-name')?.focus(), 80);
                }
            });
        });

        /* ── Sign Up submit ── */
        document.getElementById('gate-signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this._validateSignup()) return;
            const name  = document.getElementById('gate-name').value.trim();
            const email = document.getElementById('gate-email').value.trim();
            const phone = document.getElementById('gate-phone').value.trim();
            const btn   = document.getElementById('gate-signup-btn');
            btn.disabled = true; btn.classList.add('loading');
            setTimeout(() => {
                this._registerUser(name, email, phone, toolId, toolName);
                this._showSuccess('Welcome, ' + name.split(' ')[0] + '!');
                setTimeout(() => { this._close(); onSuccess(); }, 1300);
            }, 600);
        });

        /* ── Sign In submit ── */
        document.getElementById('gate-signin-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const emailEl  = document.getElementById('gate-signin-email');
            const errorEl  = document.getElementById('gate-signin-error');
            const emailErr = document.getElementById('err-signin-email');
            const email    = emailEl.value.trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                emailEl.classList.add('error'); emailErr.classList.add('show');
                return;
            }
            emailEl.classList.remove('error'); emailErr.classList.remove('show');
            const btn = document.getElementById('gate-signin-btn');
            btn.disabled = true; btn.classList.add('loading');
            setTimeout(() => {
                const ok = this._signInWithEmail(email);
                if (ok) {
                    const user = this.getUser();
                    this._logAccess(toolId, toolName);
                    this._showSuccess('Welcome back, ' + (user?.name?.split(' ')[0] || 'there') + '!');
                    setTimeout(() => { this._close(); onSuccess(); }, 1300);
                } else {
                    btn.disabled = false; btn.classList.remove('loading');
                    errorEl.style.display = 'block';
                }
            }, 600);
        });
    },

    _validateSignup() {
        let ok = true;
        const set = (id, errId, bad) => {
            const i = document.getElementById(id), e = document.getElementById(errId);
            if (bad) { i.classList.add('error'); e.classList.add('show'); ok = false; }
            else     { i.classList.remove('error'); e.classList.remove('show'); }
        };
        set('gate-name',  'err-name',  document.getElementById('gate-name').value.trim().length < 2);
        set('gate-email', 'err-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('gate-email').value.trim()));
        set('gate-phone', 'err-phone', document.getElementById('gate-phone').value.trim().replace(/\D/g,'').length < 7);
        return ok;
    },

    _showSuccess(msg) {
        document.querySelectorAll('#gate-card .gate-tabs, #gate-card .gate-panel').forEach(el => el.style.display = 'none');
        const s = document.getElementById('gate-success');
        s.style.display = 'block';
        document.getElementById('success-msg').textContent = msg || "You're all set!";
    },

    _close() {
        document.getElementById('gate-backdrop')?.remove();
        document.body.style.overflow = '';
    }
};

/* ── Auto-run on tool pages ── */
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/tools/')) {
        UserGate.checkOnToolLoad();
    }
});
