/**
 * ToolBox Tamil - Admin Dashboard
 * Main dashboard functionality
 */

const Dashboard = {
    // Charts instances
    charts: {},

    // Current section
    currentSection: 'overview',

    /**
     * Initialize dashboard
     */
    init() {
        this.setupNavigation();
        this.loadUserInfo();
        this.setupLogout();
        this.loadOverviewData();
        this.initializeCharts();
        this.setupAdManagement();
        this.setupSettings();
        this.setupActivityLogs();
        this.setupRefresh();
    },

    /**
     * Setup navigation
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                const sectionId = item.getAttribute('data-section');

                // Update active states
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                sections.forEach(section => section.classList.remove('active'));
                document.getElementById(`section-${sectionId}`).classList.add('active');

                // Update page title
                this.updatePageTitle(sectionId);

                // Load section-specific data
                this.loadSectionData(sectionId);

                this.currentSection = sectionId;
            });
        });
    },

    /**
     * Update page title
     */
    updatePageTitle(section) {
        const titles = {
            overview: {
                title: 'Dashboard Overview',
                subtitle: 'Welcome back! Here\'s what\'s happening today.'
            },
            ads: {
                title: 'Advertisement Management',
                subtitle: 'Manage your ad placements and track revenue.'
            },
            analytics: {
                title: 'Traffic Analytics',
                subtitle: 'Detailed insights about your website visitors.'
            },
            tools: {
                title: 'Tools Management',
                subtitle: 'Manage and monitor your online tools.'
            },
            settings: {
                title: 'Settings',
                subtitle: 'Configure your website and admin preferences.'
            },
            logs: {
                title: 'Activity Logs',
                subtitle: 'Track all admin activities and events.'
            }
        };

        const info = titles[section] || titles.overview;
        document.getElementById('pageTitle').textContent = info.title;
        document.getElementById('pageSubtitle').textContent = info.subtitle;
    },

    /**
     * Load user info
     */
    loadUserInfo() {
        const username = AdminAuth.getUsername();
        document.getElementById('adminUsername').textContent = username;

        // Set avatar initial
        const avatar = document.querySelector('.user-avatar');
        if (avatar) {
            avatar.textContent = username.charAt(0).toUpperCase();
        }
    },

    /**
     * Setup logout
     */
    setupLogout() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                AdminAuth.logout();
            }
        });
    },

    /**
     * Load overview data
     */
    loadOverviewData() {
        // Get analytics data from localStorage
        const analytics = this.getAnalyticsData();

        // Update stats
        document.getElementById('totalVisitors').textContent = this.formatNumber(analytics.totalVisitors);
        document.getElementById('todayVisitors').textContent = this.formatNumber(analytics.todayVisitors);
        document.getElementById('monthVisitors').textContent = this.formatNumber(analytics.monthVisitors);
        document.getElementById('adRevenue').textContent = '$' + analytics.adRevenue.toFixed(2);
        document.getElementById('totalClicks').textContent = this.formatNumber(analytics.totalClicks);
    },

    /**
     * Initialize charts
     */
    initializeCharts() {
        this.createTrafficChart();
        this.createToolsChart();
        this.createVisitorsChart();
        this.createSourcesChart();
    },

    /**
     * Create traffic overview chart
     */
    createTrafficChart() {
        const ctx = document.getElementById('trafficChart');
        if (!ctx) return;

        this.charts.traffic = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Visitors',
                    data: [120, 190, 150, 220, 180, 270, 320],
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },

    /**
     * Create tools usage chart
     */
    createToolsChart() {
        const ctx = document.getElementById('toolsChart');
        if (!ctx) return;

        this.charts.tools = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['PDF to Word', 'Tamil Typing', 'Password Gen', 'QR Code', 'PDF Merger'],
                datasets: [{
                    label: 'Uses',
                    data: [1245, 2345, 1123, 678, 890],
                    backgroundColor: [
                        'rgba(255, 107, 107, 0.8)',
                        'rgba(255, 142, 83, 0.8)',
                        'rgba(81, 207, 102, 0.8)',
                        'rgba(77, 171, 247, 0.8)',
                        'rgba(255, 193, 7, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },

    /**
     * Create visitors analytics chart
     */
    createVisitorsChart() {
        const ctx = document.getElementById('visitorsChart');
        if (!ctx) return;

        this.charts.visitors = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Unique Visitors',
                    data: [850, 1100, 980, 1340],
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Page Views',
                    data: [1200, 1600, 1400, 1900],
                    borderColor: '#4DABF7',
                    backgroundColor: 'rgba(77, 171, 247, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    /**
     * Create traffic sources chart
     */
    createSourcesChart() {
        const ctx = document.getElementById('sourcesChart');
        if (!ctx) return;

        this.charts.sources = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Direct', 'Search', 'Social Media', 'Referral'],
                datasets: [{
                    data: [35, 40, 15, 10],
                    backgroundColor: [
                        'rgba(255, 107, 107, 0.8)',
                        'rgba(81, 207, 102, 0.8)',
                        'rgba(77, 171, 247, 0.8)',
                        'rgba(255, 193, 7, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    },

    /**
     * Setup ad management
     */
    setupAdManagement() {
        const saveBtn = document.getElementById('saveAdsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAdSettings());
        }

        // Load current ad settings
        this.loadAdSettings();
    },

    /**
     * Load ad settings
     */
    loadAdSettings() {
        const settings = this.getAdSettings();

        // Set global settings
        document.getElementById('adsEnabled').checked = settings.enabled;
        document.getElementById('adNetwork').value = settings.network || 'adsense';
        document.getElementById('publisherId').value = settings.publisherId || '';

        // Set ad slot settings
        Object.keys(settings.slots || {}).forEach(slotName => {
            const slot = settings.slots[slotName];
            const unitInput = document.querySelector(`.ad-unit-input[data-slot="${slotName}"]`);
            const toggleInput = document.querySelector(`.toggle-input[data-slot="${slotName}"]`);

            if (unitInput) unitInput.value = slot.id || '';
            if (toggleInput) toggleInput.checked = slot.enabled !== false;
        });
    },

    /**
     * Save ad settings
     */
    saveAdSettings() {
        const settings = {
            enabled: document.getElementById('adsEnabled').checked,
            network: document.getElementById('adNetwork').value,
            publisherId: document.getElementById('publisherId').value,
            slots: {}
        };

        // Get all ad slots
        document.querySelectorAll('.ad-unit-input').forEach(input => {
            const slotName = input.getAttribute('data-slot');
            const toggle = document.querySelector(`.toggle-input[data-slot="${slotName}"]`);

            settings.slots[slotName] = {
                id: input.value,
                enabled: toggle ? toggle.checked : true
            };
        });

        // Save to localStorage
        localStorage.setItem('ad_settings', JSON.stringify(settings));

        // Update ads.js config file (this would require server-side in production)
        this.updateAdsConfig(settings);

        // Show success message
        this.showNotification('Ad settings saved successfully!', 'success');

        // Log activity
        AdminAuth.logActivity('ads_update', 'Ad settings updated');
    },

    /**
     * Update ads.js configuration
     */
    updateAdsConfig(settings) {
        // In a real implementation, this would update the ads.js file
        // For now, we'll just store it in localStorage
        const config = {
            enabled: settings.enabled,
            publisherId: settings.publisherId,
            slots: settings.slots
        };

        localStorage.setItem('ads_config_update', JSON.stringify(config));

        console.log('Ads config to be updated:', config);
    },

    /**
     * Get ad settings
     */
    getAdSettings() {
        const data = localStorage.getItem('ad_settings');
        return data ? JSON.parse(data) : {
            enabled: false,
            network: 'adsense',
            publisherId: '',
            slots: {}
        };
    },

    /**
     * Setup settings
     */
    setupSettings() {
        // Settings tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');

                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });

        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveAllSettings());
        }

        // Load current settings
        this.loadSettings();
    },

    /**
     * Load settings
     */
    loadSettings() {
        const settings = this.getSettings();

        // General settings
        if (settings.siteTitle) {
            document.getElementById('siteTitle').value = settings.siteTitle;
        }
        if (settings.siteDescription) {
            document.getElementById('siteDescription').value = settings.siteDescription;
        }
        if (settings.contactEmail) {
            document.getElementById('contactEmail').value = settings.contactEmail;
        }

        // Integration settings
        if (settings.gaTrackingId) {
            document.getElementById('gaTrackingId').value = settings.gaTrackingId;
        }
        if (settings.gscVerification) {
            document.getElementById('gscVerification').value = settings.gscVerification;
        }

        document.getElementById('gaEnabled').checked = settings.gaEnabled || false;

        // Performance settings
        document.getElementById('cacheEnabled').checked = settings.cacheEnabled !== false;
        document.getElementById('compressionEnabled').checked = settings.compressionEnabled !== false;
    },

    /**
     * Save all settings
     */
    saveAllSettings() {
        const settings = {
            siteTitle: document.getElementById('siteTitle').value,
            siteDescription: document.getElementById('siteDescription').value,
            contactEmail: document.getElementById('contactEmail').value,
            gaTrackingId: document.getElementById('gaTrackingId').value,
            gscVerification: document.getElementById('gscVerification').value,
            gaEnabled: document.getElementById('gaEnabled').checked,
            cacheEnabled: document.getElementById('cacheEnabled').checked,
            compressionEnabled: document.getElementById('compressionEnabled').checked
        };

        localStorage.setItem('site_settings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully!', 'success');

        AdminAuth.logActivity('settings_update', 'Site settings updated');
    },

    /**
     * Get settings
     */
    getSettings() {
        const data = localStorage.getItem('site_settings');
        return data ? JSON.parse(data) : {};
    },

    /**
     * Setup activity logs
     */
    setupActivityLogs() {
        this.loadActivityLogs();
    },

    /**
     * Load activity logs
     */
    loadActivityLogs() {
        const logs = AdminAuth.getActivityLogs();
        const tbody = document.getElementById('logsTableBody');

        if (tbody && logs.length > 0) {
            tbody.innerHTML = logs.slice(0, 20).map(log => `
                <tr>
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                    <td><span class="badge badge-${this.getLogBadgeType(log.type)}">${log.type}</span></td>
                    <td>${log.description}</td>
                    <td>${log.ip}</td>
                    <td><span class="badge badge-${log.status === 'success' ? 'success' : 'danger'}">${log.status}</span></td>
                </tr>
            `).join('');
        }
    },

    /**
     * Get log badge type
     */
    getLogBadgeType(type) {
        if (type.includes('login')) return 'info';
        if (type.includes('settings') || type.includes('ads')) return 'warning';
        return 'info';
    },

    /**
     * Setup refresh button
     */
    setupRefresh() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });
    },

    /**
     * Refresh data
     */
    refreshData() {
        this.loadSectionData(this.currentSection);
        this.showNotification('Data refreshed!', 'info');
    },

    /**
     * Load section-specific data
     */
    loadSectionData(section) {
        switch (section) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'ads':
                this.loadAdSettings();
                break;
            case 'logs':
                this.loadActivityLogs();
                break;
        }
    },

    /**
     * Get analytics data (simulated)
     */
    getAnalyticsData() {
        // In production, this would fetch from Google Analytics API
        return {
            totalVisitors: 12450,
            todayVisitors: 320,
            monthVisitors: 8930,
            adRevenue: 124.80,
            totalClicks: 1567
        };
    },

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    /**
     * Show notification
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#51CF66' : '#4DABF7'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Enquiries Management Functions
function loadEnquiries() {
    const enquiries = JSON.parse(localStorage.getItem('contact_enquiries') || '[]');
    const enquiriesList = document.getElementById('enquiries-list');

    // Update stats
    document.getElementById('total-enquiries').textContent = enquiries.length;
    const unread = enquiries.filter(e => e.status === 'unread').length;
    document.getElementById('unread-enquiries').textContent = unread;
    const adEnquiries = enquiries.filter(e => e.enquiryType === 'Ad Opportunities').length;
    document.getElementById('ad-enquiries').textContent = adEnquiries;
    const generalEnquiries = enquiries.filter(e => e.enquiryType === 'General Enquiry').length;
    document.getElementById('general-enquiries').textContent = generalEnquiries;

    // Update badge
    const badge = document.getElementById('enquiries-badge');
    if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }

    // Display enquiries
    if (enquiries.length === 0) {
        enquiriesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>No enquiries yet</h3>
                <p>Contact form submissions will appear here.</p>
            </div>
        `;
        return;
    }

    enquiriesList.innerHTML = enquiries.map(enq => `
        <div class="enquiry-card ${enq.status === 'unread' ? 'unread' : ''}" data-id="${enq.id}">
            <div class="enquiry-header">
                <div class="enquiry-info">
                    <span class="enquiry-type ${getEnquiryTypeClass(enq.enquiryType)}">${enq.enquiryType}</span>
                    <span class="enquiry-date">${formatEnquiryDate(enq.timestamp)}</span>
                    ${enq.status === 'unread' ? '<span class="unread-badge">NEW</span>' : ''}
                </div>
                <div class="enquiry-actions">
                    <button class="btn-icon" onclick="markEnquiryAsRead('${enq.id}')" title="Mark as read">
                        ${enq.status === 'unread' ? '✓' : '✓✓'}
                    </button>
                    <button class="btn-icon" onclick="deleteEnquiry('${enq.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="enquiry-content">
                <h4>${enq.subject}</h4>
                <div class="enquiry-meta">
                    <span><strong>From:</strong> ${enq.name}</span>
                    <span><strong>Email:</strong> <a href="mailto:${enq.email}">${enq.email}</a></span>
                </div>
                <p class="enquiry-message">${enq.message}</p>
            </div>
        </div>
    `).join('');
}

function getEnquiryTypeClass(type) {
    const classes = {
        'Ad Opportunities': 'type-ad',
        'General Enquiry': 'type-general',
        'Technical Support': 'type-tech',
        'Feedback': 'type-feedback',
        'Bug Report': 'type-bug',
        'Other': 'type-other'
    };
    return classes[type] || 'type-other';
}

function formatEnquiryDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function markEnquiryAsRead(id) {
    const enquiries = JSON.parse(localStorage.getItem('contact_enquiries') || '[]');
    const index = enquiries.findIndex(e => e.id == id);
    if (index !== -1) {
        enquiries[index].status = 'read';
        localStorage.setItem('contact_enquiries', JSON.stringify(enquiries));
        loadEnquiries();
        Dashboard.showNotification('Marked as read', 'success');
    }
}

function markAllEnquiriesAsRead() {
    const enquiries = JSON.parse(localStorage.getItem('contact_enquiries') || '[]');
    enquiries.forEach(e => e.status = 'read');
    localStorage.setItem('contact_enquiries', JSON.stringify(enquiries));
    loadEnquiries();
    Dashboard.showNotification('All enquiries marked as read', 'success');
}

function deleteEnquiry(id) {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    let enquiries = JSON.parse(localStorage.getItem('contact_enquiries') || '[]');
    enquiries = enquiries.filter(e => e.id != id);
    localStorage.setItem('contact_enquiries', JSON.stringify(enquiries));
    loadEnquiries();
    Dashboard.showNotification('Enquiry deleted', 'success');
}

function clearAllEnquiries() {
    if (!confirm('Are you sure you want to delete ALL enquiries? This cannot be undone!')) return;

    localStorage.removeItem('contact_enquiries');
    loadEnquiries();
    Dashboard.showNotification('All enquiries cleared', 'success');
}

// Setup enquiries filter buttons
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.enquiries-filter .filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            filterEnquiries(filter);
        });
    });
});

function filterEnquiries(filter) {
    const enquiries = JSON.parse(localStorage.getItem('contact_enquiries') || '[]');
    let filtered = enquiries;

    if (filter === 'unread') {
        filtered = enquiries.filter(e => e.status === 'unread');
    } else if (filter !== 'all') {
        filtered = enquiries.filter(e => e.enquiryType === filter);
    }

    const enquiriesList = document.getElementById('enquiries-list');
    if (filtered.length === 0) {
        enquiriesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No matching enquiries</h3>
                <p>Try a different filter.</p>
            </div>
        `;
        return;
    }

    enquiriesList.innerHTML = filtered.map(enq => `
        <div class="enquiry-card ${enq.status === 'unread' ? 'unread' : ''}" data-id="${enq.id}">
            <div class="enquiry-header">
                <div class="enquiry-info">
                    <span class="enquiry-type ${getEnquiryTypeClass(enq.enquiryType)}">${enq.enquiryType}</span>
                    <span class="enquiry-date">${formatEnquiryDate(enq.timestamp)}</span>
                    ${enq.status === 'unread' ? '<span class="unread-badge">NEW</span>' : ''}
                </div>
                <div class="enquiry-actions">
                    <button class="btn-icon" onclick="markEnquiryAsRead('${enq.id}')" title="Mark as read">
                        ${enq.status === 'unread' ? '✓' : '✓✓'}
                    </button>
                    <button class="btn-icon" onclick="deleteEnquiry('${enq.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="enquiry-content">
                <h4>${enq.subject}</h4>
                <div class="enquiry-meta">
                    <span><strong>From:</strong> ${enq.name}</span>
                    <span><strong>Email:</strong> <a href="mailto:${enq.email}">${enq.email}</a></span>
                </div>
                <p class="enquiry-message">${enq.message}</p>
            </div>
        </div>
    `).join('');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();

    // Load enquiries when enquiries section is shown
    const enquiriesNav = document.querySelector('[data-section="enquiries"]');
    if (enquiriesNav) {
        enquiriesNav.addEventListener('click', () => {
            setTimeout(() => loadEnquiries(), 100);
        });
    }

    // Load initial enquiries badge count
    const enquiries = JSON.parse(localStorage.getItem('contact_enquiries') || '[]');
    const unread = enquiries.filter(e => e.status === 'unread').length;
    const badge = document.getElementById('enquiries-badge');
    if (unread > 0 && badge) {
        badge.textContent = unread;
        badge.style.display = 'inline-block';
    }
});
