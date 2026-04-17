/**
 * UserGate — Lead capture gate for ToolBox Tamil
 * Rule: 1 free use per tool, signup required on 2nd use.
 * After registering once, all tools are always free.
 */

const UserGate = {
    USER_KEY:  'toolbox_user',
    LEADS_KEY: 'toolbox_leads',
    USES_KEY:  'tb_my_uses',   // per-device per-tool visit counts

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
     * 1st click on a tool  → free, navigate directly.
     * 2nd+ click same tool → show signup gate (unless already registered).
     */
    checkAndProceed(toolId, toolName, navigateFn) {
        const count = this._getCount(toolId);

        if (this.isRegistered()) {
            this._incCount(toolId);
            this._logAccess(toolId, toolName);
            navigateFn();
            return;
        }

        if (count === 0) {
            // First use — free pass
            this._incCount(toolId);
            navigateFn();
            return;
        }

        // Second use and not registered — gate
        this._showModal(toolId, toolName, () => {
            this._incCount(toolId);
            navigateFn();
        });
    },

    /**
     * Called automatically on tool page load.
     * Shows a full-page blocking gate if this is the user's 2nd+ visit
     * to this specific tool and they haven't registered yet.
     */
    checkOnToolLoad() {
        const toolId   = this._toolIdFromUrl();
        const toolName = this._toolNameFromUrl();
        if (!toolId) return;

        const count = this._getCount(toolId);

        if (this.isRegistered()) {
            this._incCount(toolId);
            this._logAccess(toolId, toolName);
            return;
        }

        if (count === 0) {
            // First page load — free, count it
            this._incCount(toolId);
            return;
        }

        // 2nd+ visit, not registered — show blocking modal
        // Modal resolves and lets them use the tool after signup
        this._showModal(toolId, toolName, () => {
            this._incCount(toolId);
        });
    },

    /* ─── Use-count helpers ─── */

    _getCount(toolId) {
        try {
            const uses = JSON.parse(localStorage.getItem(this.USES_KEY)) || {};
            return uses[toolId] || 0;
        } catch { return 0; }
    },

    _incCount(toolId) {
        try {
            const uses = JSON.parse(localStorage.getItem(this.USES_KEY)) || {};
            uses[toolId] = (uses[toolId] || 0) + 1;
            localStorage.setItem(this.USES_KEY, JSON.stringify(uses));
        } catch {}
    },

    /* ─── Registration helpers ─── */

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
            name:    name  || user?.name  || '',
            email:   email || user?.email || '',
            phone:   phone || user?.phone || '',
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
        if (!id) return '';
        return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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
                    animation:gateBackdropIn .22s ease;
                    padding:1rem;
                }
                #gate-card {
                    background:#fff; border-radius:20px;
                    width:100%; max-width:420px;
                    box-shadow:0 24px 64px rgba(0,0,0,.28);
                    overflow:hidden;
                    animation:gateCardIn .3s cubic-bezier(.4,0,.2,1);
                }
                #gate-card .gate-top {
                    background:linear-gradient(135deg,#FF6B6B,#FF8E53);
                    padding:2rem 2rem 1.5rem; text-align:center; color:#fff;
                }
                #gate-card .gate-top .gate-logo {
                    width:52px; height:52px;
                    background:rgba(255,255,255,.22); border-radius:14px;
                    display:inline-flex; align-items:center; justify-content:center;
                    margin-bottom:.85rem; font-size:1.6rem;
                }
                #gate-card .gate-top h2 { font-size:1.35rem; font-weight:800; margin:0 0 .35rem; letter-spacing:-.3px; }
                #gate-card .gate-top p  { font-size:.85rem; opacity:.88; margin:0; line-height:1.5; }
                #gate-card .gate-tool-badge {
                    display:inline-flex; align-items:center; gap:.4rem;
                    background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.3);
                    border-radius:999px; padding:.25rem .8rem;
                    font-size:.72rem; font-weight:700; letter-spacing:.4px; text-transform:uppercase;
                    margin-top:.75rem;
                }
                #gate-card .gate-body { padding:1.75rem 2rem 2rem; }
                #gate-card .gate-free-note {
                    background:#fff8f0; border:1px solid #ffe0b2; border-radius:10px;
                    padding:.7rem 1rem; margin-bottom:1.2rem;
                    font-size:.8rem; color:#e65100; text-align:center; font-weight:600;
                }
                #gate-card .gate-field { margin-bottom:1rem; }
                #gate-card .gate-field label { display:block; font-size:.78rem; font-weight:700; color:#2d3436; margin-bottom:.4rem; letter-spacing:.2px; }
                #gate-card .gate-field input {
                    width:100%; box-sizing:border-box; border:1.5px solid #e0e0e0;
                    border-radius:10px; padding:.7rem .9rem; font-size:.92rem; color:#2d3436;
                    outline:none; transition:border-color .2s,box-shadow .2s; font-family:inherit;
                }
                #gate-card .gate-field input:focus { border-color:#FF6B6B; box-shadow:0 0 0 3px rgba(255,107,107,.12); }
                #gate-card .gate-field input.error { border-color:#e53e3e; }
                #gate-card .gate-field .field-error { display:none; color:#e53e3e; font-size:.72rem; margin-top:.3rem; }
                #gate-card .gate-field .field-error.show { display:block; }
                #gate-submit {
                    width:100%; padding:.85rem;
                    background:linear-gradient(135deg,#FF6B6B,#FF8E53);
                    border:none; border-radius:12px; color:#fff; font-size:.95rem; font-weight:700;
                    cursor:pointer; margin-top:.5rem; font-family:inherit; letter-spacing:.2px;
                    display:flex; align-items:center; justify-content:center; gap:.5rem;
                    transition:opacity .2s,transform .2s;
                }
                #gate-submit:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
                #gate-submit:disabled { opacity:.7; cursor:not-allowed; transform:none; }
                #gate-submit .gate-spinner {
                    width:16px; height:16px; border:2px solid rgba(255,255,255,.4);
                    border-top-color:#fff; border-radius:50%;
                    animation:gateSpin .7s linear infinite; display:none;
                }
                #gate-submit.loading .gate-spinner { display:block; }
                #gate-submit.loading .gate-btn-text { display:none; }
                #gate-card .gate-privacy {
                    text-align:center; margin-top:1rem; font-size:.72rem; color:#888;
                    display:flex; align-items:center; justify-content:center; gap:.35rem;
                }
                #gate-success {
                    display:none; text-align:center; padding:2.5rem 2rem;
                    animation:gateSuccess .4s ease;
                }
                #gate-success .success-icon {
                    width:64px; height:64px;
                    background:linear-gradient(135deg,#FF6B6B,#FF8E53);
                    border-radius:50%; display:inline-flex; align-items:center; justify-content:center;
                    font-size:1.8rem; margin-bottom:1rem;
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
                    <h2>One More Step</h2>
                    <p>You've used your 1 free access. Sign up to continue — it's 100% free.</p>
                    <div class="gate-tool-badge">✦ ${toolName}</div>
                </div>
                <div class="gate-body">
                    <div class="gate-free-note">🎉 Free forever — no credit card, no payment ever</div>
                    <form id="gate-form" novalidate>
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
                        <button type="submit" id="gate-submit">
                            <span class="gate-btn-text">Get Free Access →</span>
                            <span class="gate-spinner"></span>
                        </button>
                        <div class="gate-privacy">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Your information is secure and will never be shared.
                        </div>
                    </form>
                    <div id="gate-success">
                        <div class="success-icon">✓</div>
                        <h3>You're all set!</h3>
                        <p>Enjoy unlimited access to all tools.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('gate-name')?.focus(), 100);

        document.getElementById('gate-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this._validate()) return;

            const name  = document.getElementById('gate-name').value.trim();
            const email = document.getElementById('gate-email').value.trim();
            const phone = document.getElementById('gate-phone').value.trim();

            const btn = document.getElementById('gate-submit');
            btn.disabled = true;
            btn.classList.add('loading');

            setTimeout(() => {
                this._registerUser(name, email, phone, toolId, toolName);
                document.getElementById('gate-form').style.display = 'none';
                document.getElementById('gate-success').style.display = 'block';
                setTimeout(() => {
                    backdrop.remove();
                    document.body.style.overflow = '';
                    onSuccess();
                }, 1200);
            }, 600);
        });
    },

    _validate() {
        let ok = true;
        const set = (id, errId, cond) => {
            const inp = document.getElementById(id);
            const err = document.getElementById(errId);
            if (cond) { inp.classList.add('error'); err.classList.add('show'); ok = false; }
            else { inp.classList.remove('error'); err.classList.remove('show'); }
        };
        const name  = document.getElementById('gate-name').value.trim();
        const email = document.getElementById('gate-email').value.trim();
        const phone = document.getElementById('gate-phone').value.trim();
        set('gate-name',  'err-name',  name.length < 2);
        set('gate-email', 'err-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        set('gate-phone', 'err-phone', phone.replace(/\D/g,'').length < 7);
        return ok;
    }
};

/* ── Auto-run on tool pages ── */
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/tools/')) {
        UserGate.checkOnToolLoad();
    }
});
