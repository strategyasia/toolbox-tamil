/**
 * ToolBox Tamil — Cookie & Ad Consent Manager
 * GDPR / Google AdSense compliant consent banner.
 * Bilingual: English + Tamil.
 *
 * Consent choices stored in localStorage for 365 days.
 * Ads are only initialised after the user explicitly accepts.
 */

const ConsentManager = {
    KEY: 'toolbox_consent',
    EXPIRY_DAYS: 365,

    /* ── strings ── */
    i18n: {
        en: {
            title:    'We use cookies',
            body:     'We and our partners use cookies and similar technologies to personalise content, show relevant ads, and measure performance. You can choose to accept all cookies or only the essential ones needed to run this site.',
            accept:   'Accept All',
            essential:'Essential Only',
            manage:   'Cookie Policy',
            poweredBy:'Powered by TamilPetti Consent'
        },
        ta: {
            title:    'நாங்கள் குக்கீகளைப் பயன்படுத்துகிறோம்',
            body:     'நாங்களும் எங்கள் கூட்டாளர்களும் உள்ளடக்கத்தை தனிப்பயனாக்கவும், தொடர்புடைய விளம்பரங்களைக் காட்டவும், செயல்திறனை அளவிடவும் குக்கீகளைப் பயன்படுத்துகிறோம். அனைத்து குக்கீகளையும் அல்லது இந்த தளத்தை இயக்க தேவையான அவசியமான குக்கீகளை மட்டுமே ஏற்கலாம்.',
            accept:   'அனைத்தையும் ஏற்கவும்',
            essential:'அவசியமானவை மட்டும்',
            manage:   'குக்கீ கொள்கை',
            poweredBy:'TamilPetti ஒப்புதல்'
        }
    },

    /* ── state ── */
    getConsent() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            /* check expiry */
            const age = (Date.now() - new Date(data.savedAt).getTime()) / 86400000;
            if (age > this.EXPIRY_DAYS) { localStorage.removeItem(this.KEY); return null; }
            return data;
        } catch { return null; }
    },

    saveConsent(advertising, analytics) {
        localStorage.setItem(this.KEY, JSON.stringify({
            advertising, analytics,
            savedAt: new Date().toISOString(),
            version: '1.0'
        }));
    },

    hasConsented()       { return !!this.getConsent(); },
    adsAllowed()         { const c = this.getConsent(); return c?.advertising === true; },
    analyticsAllowed()   { const c = this.getConsent(); return c?.analytics === true; },

    /* ── main entry ── */
    init() {
        if (this.hasConsented()) {
            /* Consent already given — boot ads if allowed */
            if (this.adsAllowed()) this._bootAds();
            return;
        }
        this._renderBanner();
    },

    /* ── inject one-time styles ── */
    _injectStyles() {
        if (document.getElementById('consent-styles')) return;
        const s = document.createElement('style');
        s.id = 'consent-styles';
        s.textContent = `
            @keyframes consentSlideUp {
                from { transform: translateY(100%); opacity: 0; }
                to   { transform: translateY(0);    opacity: 1; }
            }
            @keyframes consentSlideDown {
                from { transform: translateY(0);    opacity: 1; }
                to   { transform: translateY(100%); opacity: 0; }
            }

            #consent-bar {
                position: fixed;
                bottom: 0; left: 0; right: 0;
                z-index: 999999;
                background: #fff;
                border-top: 2px solid #FF6B6B;
                box-shadow: 0 -6px 32px rgba(0,0,0,.13);
                animation: consentSlideUp .35s cubic-bezier(.4,0,.2,1);
                font-family: 'Inter', system-ui, sans-serif;
            }

            #consent-inner {
                max-width: 1100px;
                margin: 0 auto;
                padding: 1.1rem 1.5rem;
                display: flex;
                align-items: flex-start;
                gap: 1.5rem;
                flex-wrap: wrap;
            }

            #consent-icon {
                font-size: 1.8rem;
                flex-shrink: 0;
                margin-top: .1rem;
            }

            #consent-text { flex: 1; min-width: 220px; }

            #consent-text strong {
                display: block;
                font-size: .95rem;
                font-weight: 700;
                color: #2d3436;
                margin-bottom: .3rem;
            }

            #consent-text p {
                font-size: .8rem;
                color: #636e72;
                line-height: 1.6;
                margin: 0;
            }

            #consent-text a {
                color: #FF6B6B;
                text-decoration: underline;
                font-size: .78rem;
            }

            #consent-actions {
                display: flex;
                align-items: center;
                gap: .6rem;
                flex-wrap: wrap;
                flex-shrink: 0;
                padding-top: .15rem;
            }

            #consent-accept {
                background: linear-gradient(135deg, #FF6B6B, #FF8E53);
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: .6rem 1.3rem;
                font-size: .85rem;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
                transition: opacity .2s, transform .2s;
                font-family: inherit;
            }
            #consent-accept:hover { opacity: .88; transform: translateY(-1px); }

            #consent-essential {
                background: transparent;
                color: #636e72;
                border: 1.5px solid #dfe6e9;
                border-radius: 8px;
                padding: .58rem 1rem;
                font-size: .82rem;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
                transition: border-color .2s, color .2s;
                font-family: inherit;
            }
            #consent-essential:hover { border-color: #b2bec3; color: #2d3436; }

            #consent-powered {
                width: 100%;
                text-align: right;
                font-size: .65rem;
                color: #b2bec3;
                padding-top: .3rem;
            }

            @media (max-width: 600px) {
                #consent-inner    { flex-direction: column; gap: .9rem; }
                #consent-actions  { width: 100%; justify-content: stretch; }
                #consent-accept,
                #consent-essential { flex: 1; text-align: center; }
                #consent-powered  { text-align: center; }
            }
        `;
        document.head.appendChild(s);
    },

    /* ── render the consent bar ── */
    _renderBanner() {
        this._injectStyles();

        const lang = localStorage.getItem('toolbox-lang') || 'en';
        const t    = this.i18n[lang] || this.i18n.en;

        const bar  = document.createElement('div');
        bar.id     = 'consent-bar';
        bar.setAttribute('role', 'dialog');
        bar.setAttribute('aria-live', 'polite');
        bar.setAttribute('aria-label', t.title);

        bar.innerHTML = `
            <div id="consent-inner">
                <div id="consent-icon" aria-hidden="true">🍪</div>
                <div id="consent-text">
                    <strong>${t.title}</strong>
                    <p>${t.body}</p>
                    <a href="#" id="consent-policy-link">${t.manage}</a>
                </div>
                <div id="consent-actions">
                    <button id="consent-essential">${t.essential}</button>
                    <button id="consent-accept">${t.accept}</button>
                </div>
                <div id="consent-powered">${t.poweredBy}</div>
            </div>
        `;

        document.body.appendChild(bar);

        /* ── button handlers ── */
        document.getElementById('consent-accept').addEventListener('click', () => {
            this.saveConsent(true, true);
            this._dismiss();
            this._bootAds();
        });

        document.getElementById('consent-essential').addEventListener('click', () => {
            this.saveConsent(false, false);
            this._dismiss();
        });

        document.getElementById('consent-policy-link').addEventListener('click', (e) => {
            e.preventDefault();
            /* Show simple modal with cookie policy */
            this._showPolicy(t);
        });
    },

    /* ── slide out and remove ── */
    _dismiss() {
        const bar = document.getElementById('consent-bar');
        if (!bar) return;
        bar.style.animation = 'consentSlideDown .3s cubic-bezier(.4,0,.2,1) forwards';
        setTimeout(() => bar.remove(), 320);
    },

    /* ── boot ads (only called after explicit accept) ── */
    _bootAds() {
        /* If ToolBoxAds is available, initialise */
        if (window.ToolBoxAds && typeof window.ToolBoxAds.init === 'function') {
            window.ToolBoxAds.init();
        }
        /* Also trigger Google AdSense consent signal if using CMP */
        if (window.gtag) {
            window.gtag('consent', 'update', {
                ad_storage: 'granted',
                analytics_storage: 'granted'
            });
        }
    },

    /* ── simple cookie policy modal ── */
    _showPolicy(t) {
        if (document.getElementById('consent-policy-modal')) return;

        const overlay = document.createElement('div');
        overlay.id = 'consent-policy-modal';
        overlay.style.cssText = `
            position:fixed;inset:0;background:rgba(0,0,0,.55);
            z-index:1000001;display:flex;align-items:center;justify-content:center;padding:1rem;
        `;
        overlay.innerHTML = `
            <div style="background:#fff;border-radius:16px;max-width:520px;width:100%;
                        padding:2rem;box-shadow:0 24px 64px rgba(0,0,0,.22);
                        font-family:'Inter',system-ui,sans-serif;max-height:80vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem;">
                    <h2 style="font-size:1.1rem;font-weight:800;color:#2d3436;margin:0;">🍪 Cookie Policy</h2>
                    <button id="consent-policy-close" style="background:none;border:none;font-size:1.4rem;
                        cursor:pointer;color:#636e72;line-height:1;">×</button>
                </div>
                <div style="font-size:.85rem;color:#636e72;line-height:1.7;">
                    <p><strong style="color:#2d3436;">Essential Cookies</strong><br>
                    Required for the site to function. They remember your language preference and consent choice. Cannot be disabled.</p>
                    <p><strong style="color:#2d3436;">Advertising Cookies</strong><br>
                    Used by Google AdSense to show you relevant ads based on your interests. These cookies collect information about your browsing activity across websites.</p>
                    <p><strong style="color:#2d3436;">Analytics Cookies</strong><br>
                    Help us understand how visitors use the site so we can improve the tools and user experience.</p>
                    <p><strong style="color:#2d3436;">Your Rights</strong><br>
                    You can withdraw consent at any time by clearing your browser's localStorage or by clicking "Essential Only" on the consent banner.
                    Under GDPR, you have the right to access, correct, or delete your personal data.</p>
                    <p style="margin-top:1rem;font-size:.75rem;">
                        This site is operated by <strong>Dorvin</strong> — <a href="mailto:ceo@dorvin.in" style="color:#FF6B6B;">ceo@dorvin.in</a>
                    </p>
                </div>
                <div style="display:flex;gap:.6rem;margin-top:1.25rem;flex-wrap:wrap;">
                    <button id="consent-policy-accept" style="flex:1;background:linear-gradient(135deg,#FF6B6B,#FF8E53);
                        color:#fff;border:none;border-radius:8px;padding:.65rem 1rem;font-weight:700;
                        font-size:.85rem;cursor:pointer;font-family:inherit;">Accept All Cookies</button>
                    <button id="consent-policy-essential" style="flex:1;background:transparent;
                        border:1.5px solid #dfe6e9;border-radius:8px;padding:.63rem 1rem;font-weight:600;
                        font-size:.82rem;cursor:pointer;color:#636e72;font-family:inherit;">Essential Only</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('#consent-policy-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        overlay.querySelector('#consent-policy-accept').addEventListener('click', () => {
            this.saveConsent(true, true);
            this._dismiss();
            this._bootAds();
            overlay.remove();
        });
        overlay.querySelector('#consent-policy-essential').addEventListener('click', () => {
            this.saveConsent(false, false);
            this._dismiss();
            overlay.remove();
        });
    }
};

/* ── Auto-init when DOM is ready ── */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ConsentManager.init());
} else {
    ConsentManager.init();
}

/* ── Expose globally so ads.js can check ── */
window.ConsentManager = ConsentManager;
