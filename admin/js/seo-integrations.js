/**
 * ToolBox Tamil - SEO & Analytics Integrations
 * Handles Google Analytics and Google Search Console verification
 */

const SEOIntegrations = {
    STORAGE_KEY: 'toolbox_seo_integrations',

    /**
     * Initialize SEO integrations
     */
    init() {
        this.loadSettings();
        this.setupEventListeners();
    },

    /**
     * Load saved settings
     */
    loadSettings() {
        const settings = this.getSettings();

        // Load Google Analytics
        const gaTrackingId = document.getElementById('gaTrackingId');
        const gaEnabled = document.getElementById('gaEnabled');

        if (gaTrackingId && settings.googleAnalytics) {
            gaTrackingId.value = settings.googleAnalytics.trackingId || '';
        }

        if (gaEnabled && settings.googleAnalytics) {
            gaEnabled.checked = settings.googleAnalytics.enabled || false;
        }

        // Load Google Search Console
        const gscVerification = document.getElementById('gscVerification');

        if (gscVerification && settings.googleSearchConsole) {
            gscVerification.value = settings.googleSearchConsole.verificationCode || '';
        }
    },

    /**
     * Get settings from localStorage
     */
    getSettings() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : {
            googleAnalytics: {
                trackingId: '',
                enabled: false
            },
            googleSearchConsole: {
                verificationCode: ''
            }
        };
    },

    /**
     * Save settings
     */
    saveSettings() {
        const gaTrackingId = document.getElementById('gaTrackingId');
        const gaEnabled = document.getElementById('gaEnabled');
        const gscVerification = document.getElementById('gscVerification');

        const settings = {
            googleAnalytics: {
                trackingId: gaTrackingId ? gaTrackingId.value.trim() : '',
                enabled: gaEnabled ? gaEnabled.checked : false
            },
            googleSearchConsole: {
                verificationCode: gscVerification ? gscVerification.value.trim() : ''
            },
            lastUpdated: Date.now()
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));

        console.log('✅ SEO Integrations saved:', settings);

        // Generate integration code
        this.generateIntegrationCode(settings);

        return settings;
    },

    /**
     * Generate integration code for main site
     */
    generateIntegrationCode(settings) {
        let code = '<!-- SEO & Analytics Integration Code -->\n';
        code += '<!-- Generated from Admin Panel - ' + new Date().toISOString() + ' -->\n\n';

        // Google Analytics
        if (settings.googleAnalytics.enabled && settings.googleAnalytics.trackingId) {
            code += '<!-- Google Analytics (GA4) -->\n';
            code += '<script async src="https://www.googletagmanager.com/gtag/js?id=' + settings.googleAnalytics.trackingId + '"></script>\n';
            code += '<script>\n';
            code += '  window.dataLayer = window.dataLayer || [];\n';
            code += '  function gtag(){dataLayer.push(arguments);}\n';
            code += '  gtag(\'js\', new Date());\n';
            code += '  gtag(\'config\', \'' + settings.googleAnalytics.trackingId + '\');\n';
            code += '</script>\n\n';
        }

        // Google Search Console Verification
        if (settings.googleSearchConsole.verificationCode) {
            code += '<!-- Google Search Console Verification -->\n';
            // Extract just the content value if full meta tag was pasted
            let verificationContent = settings.googleSearchConsole.verificationCode;

            // If it's a full meta tag, extract the content
            if (verificationContent.includes('content=')) {
                const match = verificationContent.match(/content="([^"]+)"/);
                if (match) {
                    verificationContent = match[1];
                }
            }

            // If it starts with "google-site-verification:", remove that
            if (verificationContent.startsWith('google-site-verification:')) {
                verificationContent = verificationContent.replace('google-site-verification:', '').trim();
            }

            code += '<meta name="google-site-verification" content="' + verificationContent + '" />\n\n';
        }

        // Store the generated code
        settings.generatedCode = code;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));

        console.log('Generated integration code:\n', code);

        return code;
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Save button
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
                this.showSaveNotification();
            });
        }

        // Real-time validation
        const gaTrackingId = document.getElementById('gaTrackingId');
        if (gaTrackingId) {
            gaTrackingId.addEventListener('input', (e) => {
                this.validateGoogleAnalyticsId(e.target.value);
            });
        }

        const gscVerification = document.getElementById('gscVerification');
        if (gscVerification) {
            gscVerification.addEventListener('input', (e) => {
                this.validateGSCVerification(e.target.value);
            });
        }
    },

    /**
     * Validate Google Analytics tracking ID
     */
    validateGoogleAnalyticsId(value) {
        const input = document.getElementById('gaTrackingId');
        if (!input) return true;

        // GA4 format: G-XXXXXXXXXX
        // Universal Analytics format: UA-XXXXXXXXX-X
        const ga4Pattern = /^G-[A-Z0-9]+$/;
        const uaPattern = /^UA-[0-9]+-[0-9]+$/;

        if (value && !ga4Pattern.test(value) && !uaPattern.test(value)) {
            input.style.borderColor = '#FF6B6B';
            return false;
        } else {
            input.style.borderColor = '';
            return true;
        }
    },

    /**
     * Validate GSC verification code
     */
    validateGSCVerification(value) {
        const input = document.getElementById('gscVerification');
        if (!input) return true;

        if (value && value.length < 20) {
            input.style.borderColor = '#FF6B6B';
            return false;
        } else {
            input.style.borderColor = '';
            return true;
        }
    },

    /**
     * Show save notification
     */
    showSaveNotification() {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'save-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <div class="notification-text">
                    <strong>Settings Saved!</strong>
                    <p>SEO integrations updated successfully.</p>
                    <button class="btn btn-small btn-primary" onclick="SEOIntegrations.showIntegrationInstructions()">
                        View Integration Code
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    },

    /**
     * Show integration instructions
     */
    showIntegrationInstructions() {
        const settings = this.getSettings();
        const code = this.generateIntegrationCode(settings);

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'integration-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔗 Integration Code</h2>
                    <button class="modal-close" onclick="this.closest('.integration-modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <p><strong>Add this code to your main site's index.html</strong></p>
                    <p>Place it in the <code>&lt;head&gt;</code> section, before the closing <code>&lt;/head&gt;</code> tag.</p>

                    <div class="code-container">
                        <button class="copy-btn" onclick="SEOIntegrations.copyToClipboard(this)">
                            📋 Copy Code
                        </button>
                        <pre><code>${this.escapeHtml(code)}</code></pre>
                    </div>

                    <div class="instructions">
                        <h3>📋 Integration Steps:</h3>
                        <ol>
                            <li>Copy the code above</li>
                            <li>Open your <code>index.html</code> file</li>
                            <li>Find the <code>&lt;head&gt;</code> section</li>
                            <li>Paste the code before <code>&lt;/head&gt;</code></li>
                            <li>Save and push to GitHub</li>
                            <li>Wait 2-3 minutes for GitHub Pages to update</li>
                            <li>Verify it's working (see below)</li>
                        </ol>

                        <h3>✅ Verification:</h3>
                        <ul>
                            <li><strong>Google Analytics:</strong> Check Real-Time reports in GA dashboard (takes 24-48 hours for full data)</li>
                            <li><strong>Search Console:</strong> Go to GSC and click "Verify" button (should succeed immediately)</li>
                        </ul>

                        <h3>🔍 Quick Test:</h3>
                        <p>View your site's source code (<code>Ctrl+U</code>) and search for:</p>
                        <ul>
                            <li>Google Analytics: Look for <code>gtag.js</code></li>
                            <li>Search Console: Look for <code>google-site-verification</code></li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.integration-modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="SEOIntegrations.autoIntegrate()">
                        🚀 Auto-Integrate (Advanced)
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    /**
     * Copy code to clipboard
     */
    copyToClipboard(button) {
        const codeElement = button.nextElementSibling.querySelector('code');
        const code = codeElement.textContent;

        navigator.clipboard.writeText(code).then(() => {
            const originalText = button.textContent;
            button.textContent = '✅ Copied!';
            button.style.background = '#51CF66';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 2000);
        }).catch(err => {
            alert('Failed to copy. Please select and copy manually.');
        });
    },

    /**
     * Auto-integrate (Advanced users)
     */
    autoIntegrate() {
        alert('Auto-integration feature coming soon! For now, please copy the code and paste it manually into your index.html file.');
    },

    /**
     * Escape HTML for display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Get integration status
     */
    getIntegrationStatus() {
        const settings = this.getSettings();

        return {
            googleAnalytics: {
                configured: !!(settings.googleAnalytics.trackingId),
                enabled: settings.googleAnalytics.enabled,
                trackingId: settings.googleAnalytics.trackingId
            },
            googleSearchConsole: {
                configured: !!(settings.googleSearchConsole.verificationCode),
                verificationCode: settings.googleSearchConsole.verificationCode
            }
        };
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SEOIntegrations.init();
});

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .save-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    }

    .save-notification.show {
        transform: translateX(0);
    }

    .notification-content {
        display: flex;
        gap: 15px;
        align-items: flex-start;
    }

    .notification-icon {
        font-size: 24px;
    }

    .notification-text strong {
        display: block;
        margin-bottom: 5px;
        color: #2D3436;
    }

    .notification-text p {
        margin: 0 0 10px 0;
        color: #636E72;
        font-size: 14px;
    }

    .integration-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
    }

    .modal-content {
        position: relative;
        background: white;
        border-radius: 12px;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }

    .modal-header {
        padding: 20px 30px;
        border-bottom: 1px solid #E1E8ED;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-header h2 {
        margin: 0;
        color: #2D3436;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #636E72;
        padding: 0;
        width: 30px;
        height: 30px;
    }

    .modal-close:hover {
        color: #2D3436;
    }

    .modal-body {
        padding: 30px;
    }

    .code-container {
        position: relative;
        margin: 20px 0;
    }

    .copy-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #FF6B6B;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        z-index: 10;
    }

    .copy-btn:hover {
        background: #FF5252;
    }

    .code-container pre {
        background: #2D3436;
        color: #00FF00;
        padding: 20px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 0;
    }

    .code-container code {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
    }

    .instructions {
        margin-top: 30px;
        background: #F8F9FA;
        padding: 20px;
        border-radius: 8px;
    }

    .instructions h3 {
        color: #2D3436;
        margin-top: 0;
    }

    .instructions ol, .instructions ul {
        margin: 10px 0;
        padding-left: 25px;
    }

    .instructions li {
        margin: 8px 0;
        line-height: 1.6;
    }

    .instructions code {
        background: #E1E8ED;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
    }

    .modal-footer {
        padding: 20px 30px;
        border-top: 1px solid #E1E8ED;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }

    .btn-small {
        padding: 6px 12px;
        font-size: 13px;
    }
`;
document.head.appendChild(notificationStyles);
