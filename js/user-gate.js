/**
 * UserGate — Lead capture gate for ToolBox Tamil
 * Collects user info (name, email, phone) before tool access.
 * Stores registrations and tool-access history in localStorage.
 */

const UserGate = {
    USER_KEY:  'toolbox_user',
    LEADS_KEY: 'toolbox_leads',

    /* ── Public API ── */

    isRegistered() {
        return !!localStorage.getItem(this.USER_KEY);
    },

    getUser() {
        const d = localStorage.getItem(this.USER_KEY);
        return d ? JSON.parse(d) : null;
    },

    getLeads() {
        const d = localStorage.getItem(this.LEADS_KEY);
        return d ? JSON.parse(d) : [];
    },

    /**
     * Call this when a tool card is clicked.
     * Shows the gate modal if user hasn't registered yet,
     * otherwise logs the access and calls navigateFn immediately.
     */
    checkAndProceed(toolId, toolName, navigateFn) {
        if (this.isRegistered()) {
            const u = this.getUser();
            this._logAccess(u.name, u.email, u.phone, toolId, toolName);
            navigateFn();
            return;
        }
        this._showModal(toolId, toolName, navigateFn);
    },

    /* ── Private helpers ── */

    _registerUser(name, email, phone, toolId, toolName) {
        localStorage.setItem(this.USER_KEY, JSON.stringify({
            name, email, phone,
            registeredAt: new Date().toISOString()
        }));
        this._logAccess(name, email, phone, toolId, toolName);
    },

    _logAccess(name, email, phone, toolId, toolName) {
        const leads = this.getLeads();
        leads.unshift({
            id: Date.now(),
            name, email, phone, toolId, toolName,
            date: new Date().toISOString()
        });
        if (leads.length > 2000) leads.splice(2000);
        localStorage.setItem(this.LEADS_KEY, JSON.stringify(leads));
    },

    _showModal(toolId, toolName, onSuccess) {
        /* ── inject animation styles once ── */
        if (!document.getElementById('gate-styles')) {
            const s = document.createElement('style');
            s.id = 'gate-styles';
            s.textContent = `
                @keyframes gateBackdropIn { from { opacity:0 } to { opacity:1 } }
                @keyframes gateCardIn     { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:none } }
                @keyframes gateSpin       { to { transform:rotate(360deg) } }
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
                    background:#fff;
                    border-radius:20px;
                    width:100%; max-width:420px;
                    box-shadow:0 24px 64px rgba(0,0,0,.28);
                    overflow:hidden;
                    animation:gateCardIn .3s cubic-bezier(.4,0,.2,1);
                }
                #gate-card .gate-top {
                    background:linear-gradient(135deg,#FF6B6B,#FF8E53);
                    padding:2rem 2rem 1.5rem;
                    text-align:center;
                    color:#fff;
                }
                #gate-card .gate-top .gate-logo {
                    width:52px; height:52px;
                    background:rgba(255,255,255,.22);
                    border-radius:14px;
                    display:inline-flex; align-items:center; justify-content:center;
                    margin-bottom:.85rem;
                    font-size:1.6rem;
                }
                #gate-card .gate-top h2 {
                    font-size:1.35rem; font-weight:800;
                    margin:0 0 .35rem; letter-spacing:-.3px;
                }
                #gate-card .gate-top p {
                    font-size:.85rem; opacity:.88; margin:0; line-height:1.5;
                }
                #gate-card .gate-tool-badge {
                    display:inline-flex; align-items:center; gap:.4rem;
                    background:rgba(255,255,255,.18);
                    border:1px solid rgba(255,255,255,.3);
                    border-radius:999px;
                    padding:.25rem .8rem;
                    font-size:.72rem; font-weight:700;
                    letter-spacing:.4px; text-transform:uppercase;
                    margin-top:.75rem;
                }
                #gate-card .gate-body { padding:1.75rem 2rem 2rem; }

                #gate-card .gate-field { margin-bottom:1rem; }
                #gate-card .gate-field label {
                    display:block; font-size:.78rem; font-weight:700;
                    color:#2d3436; margin-bottom:.4rem; letter-spacing:.2px;
                }
                #gate-card .gate-field input {
                    width:100%; box-sizing:border-box;
                    border:1.5px solid #e0e0e0;
                    border-radius:10px;
                    padding:.7rem .9rem;
                    font-size:.92rem; color:#2d3436;
                    outline:none; transition:border-color .2s, box-shadow .2s;
                    font-family:inherit;
                }
                #gate-card .gate-field input:focus {
                    border-color:#FF6B6B;
                    box-shadow:0 0 0 3px rgba(255,107,107,.12);
                }
                #gate-card .gate-field input.error { border-color:#e53e3e; }
                #gate-card .gate-field .field-error {
                    display:none; color:#e53e3e; font-size:.72rem; margin-top:.3rem;
                }
                #gate-card .gate-field .field-error.show { display:block; }

                #gate-submit {
                    width:100%; padding:.85rem;
                    background:linear-gradient(135deg,#FF6B6B,#FF8E53);
                    border:none; border-radius:12px;
                    color:#fff; font-size:.95rem; font-weight:700;
                    cursor:pointer; margin-top:.5rem;
                    transition:opacity .2s, transform .2s;
                    font-family:inherit; letter-spacing:.2px;
                    display:flex; align-items:center; justify-content:center; gap:.5rem;
                }
                #gate-submit:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
                #gate-submit:disabled { opacity:.7; cursor:not-allowed; transform:none; }
                #gate-submit .gate-spinner {
                    width:16px; height:16px;
                    border:2px solid rgba(255,255,255,.4);
                    border-top-color:#fff;
                    border-radius:50%;
                    animation:gateSpin .7s linear infinite;
                    display:none;
                }
                #gate-submit.loading .gate-spinner { display:block; }
                #gate-submit.loading .gate-btn-text { display:none; }

                #gate-card .gate-privacy {
                    text-align:center; margin-top:1rem;
                    font-size:.72rem; color:#888;
                    display:flex; align-items:center; justify-content:center; gap:.35rem;
                }
                #gate-card .gate-privacy svg { flex-shrink:0; }

                #gate-success {
                    display:none; text-align:center; padding:2.5rem 2rem;
                    animation:gateSuccess .4s ease;
                }
                #gate-success .success-icon {
                    width:64px; height:64px;
                    background:linear-gradient(135deg,#FF6B6B,#FF8E53);
                    border-radius:50%;
                    display:inline-flex; align-items:center; justify-content:center;
                    font-size:1.8rem; margin-bottom:1rem;
                }
                #gate-success h3 { font-size:1.2rem; font-weight:800; color:#2d3436; margin:0 0 .4rem; }
                #gate-success p  { color:#636e72; font-size:.88rem; margin:0; }
            `;
            document.head.appendChild(s);
        }

        /* ── build modal HTML ── */
        const backdrop = document.createElement('div');
        backdrop.id = 'gate-backdrop';
        backdrop.innerHTML = `
            <div id="gate-card">
                <div class="gate-top">
                    <div class="gate-logo">🛠️</div>
                    <h2>Get Free Access</h2>
                    <p>Enter your details to use all tools instantly — 100% free, no payment needed.</p>
                    <div class="gate-tool-badge">
                        ✦ Opening: ${toolName}
                    </div>
                </div>

                <div class="gate-body">
                    <form id="gate-form" novalidate>
                        <div class="gate-field">
                            <label for="gate-name">Full Name</label>
                            <input type="text" id="gate-name" placeholder="e.g. Arun Kumar" autocomplete="name" />
                            <div class="field-error" id="err-name">Please enter your full name</div>
                        </div>
                        <div class="gate-field">
                            <label for="gate-email">Email Address</label>
                            <input type="email" id="gate-email" placeholder="e.g. arun@example.com" autocomplete="email" />
                            <div class="field-error" id="err-email">Please enter a valid email address</div>
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
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Your information is secure and will never be shared.
                        </div>
                    </form>

                    <div id="gate-success">
                        <div class="success-icon">✓</div>
                        <h3>You're all set!</h3>
                        <p>Taking you to ${toolName}…</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        /* ── prevent background scroll ── */
        document.body.style.overflow = 'hidden';

        /* ── focus first field ── */
        setTimeout(() => document.getElementById('gate-name')?.focus(), 100);

        /* ── form submit handler ── */
        document.getElementById('gate-form').addEventListener('submit', (e) => {
            e.preventDefault();
            if (!this._validateForm()) return;

            const name  = document.getElementById('gate-name').value.trim();
            const email = document.getElementById('gate-email').value.trim();
            const phone = document.getElementById('gate-phone').value.trim();

            /* Show loading */
            const btn = document.getElementById('gate-submit');
            btn.disabled = true;
            btn.classList.add('loading');

            /* Small delay for UX polish */
            setTimeout(() => {
                this._registerUser(name, email, phone, toolId, toolName);
                this._showSuccess();

                setTimeout(() => {
                    this._closeModal();
                    onSuccess();
                }, 1200);
            }, 600);
        });
    },

    _validateForm() {
        let valid = true;

        const name  = document.getElementById('gate-name').value.trim();
        const email = document.getElementById('gate-email').value.trim();
        const phone = document.getElementById('gate-phone').value.trim();

        /* Name */
        const nameInp = document.getElementById('gate-name');
        const nameErr = document.getElementById('err-name');
        if (name.length < 2) {
            nameInp.classList.add('error');
            nameErr.classList.add('show');
            valid = false;
        } else {
            nameInp.classList.remove('error');
            nameErr.classList.remove('show');
        }

        /* Email */
        const emailInp = document.getElementById('gate-email');
        const emailErr = document.getElementById('err-email');
        const emailRe  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
            emailInp.classList.add('error');
            emailErr.classList.add('show');
            valid = false;
        } else {
            emailInp.classList.remove('error');
            emailErr.classList.remove('show');
        }

        /* Phone */
        const phoneInp = document.getElementById('gate-phone');
        const phoneErr = document.getElementById('err-phone');
        const digits   = phone.replace(/\D/g, '');
        if (digits.length < 7) {
            phoneInp.classList.add('error');
            phoneErr.classList.add('show');
            valid = false;
        } else {
            phoneInp.classList.remove('error');
            phoneErr.classList.remove('show');
        }

        return valid;
    },

    _showSuccess() {
        document.getElementById('gate-form').style.display = 'none';
        document.getElementById('gate-success').style.display = 'block';
    },

    _closeModal() {
        document.getElementById('gate-backdrop')?.remove();
        document.body.style.overflow = '';
    }
};
