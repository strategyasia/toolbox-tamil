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
        this.setupSidebarToggle();
        this.loadUserInfo();
        this.setupLogout();
        this.loadOverviewData();
        this.initializeCharts();
        this.setupAdManagement();
        this.setupSettings();
        this.setupActivityLogs();
        this.setupRefresh();
        this.loadToolsTable();
    },

    setupSidebarToggle() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (!toggle || !sidebar || !overlay) return;

        const open = () => { sidebar.classList.add('open'); overlay.classList.add('active'); };
        const close = () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); };

        toggle.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
        overlay.addEventListener('click', close);

        // Close sidebar when a nav item is clicked on mobile
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => { if (window.innerWidth <= 1024) close(); });
        });
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
            leads: {
                title: 'User Leads',
                subtitle: 'View and manage registered users who accessed your tools.'
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
        const analytics = this.getAnalyticsData();

        this.setEl('totalVisitors', this.formatNumber(analytics.totalVisitors));
        this.setEl('adRevenue', '$' + analytics.adRevenue.toFixed(2));
        this.setEl('totalClicks', this.formatNumber(analytics.totalClicks));
        this.setEl('todayVisitorsBadge', 'Today: ' + this.formatNumber(analytics.todayVisitors));
        this.setEl('monthClicksBadge', 'This month: ' + this.formatNumber(analytics.monthVisitors));

        this.loadRecentActivity();
    },

    setEl(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    /**
     * Load recent activity from admin logs
     */
    loadRecentActivity() {
        const list = document.getElementById('activityList');
        if (!list) return;
        const logs = AdminAuth.getActivityLogs().slice(0, 8);
        if (!logs.length) {
            list.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">No activity yet.</p>';
            return;
        }
        const icons = { login: '🔑', logout: '🚪', login_failed: '⚠️', ads_update: '💰', settings_update: '⚙️' };
        list.innerHTML = logs.map(log => `
            <div class="activity-item">
                <span class="activity-icon">${icons[log.type] || '📋'}</span>
                <div class="activity-content">
                    <p>${log.description}</p>
                    <span class="activity-time">${this.timeAgo(log.timestamp)}</span>
                </div>
            </div>
        `).join('');
    },

    timeAgo(ts) {
        const diff = Date.now() - new Date(ts).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'Just now';
        if (m < 60) return m + 'm ago';
        const h = Math.floor(m / 60);
        if (h < 24) return h + 'h ago';
        return Math.floor(h / 24) + 'd ago';
    },

    /**
     * Load analytics section — device & referrer breakdowns
     */
    loadAnalytics() {
        let s = {};
        try { s = JSON.parse(localStorage.getItem('tb_stats')) || {}; } catch {}

        // Device breakdown
        const dv = s.deviceViews || {};
        const dvTotal = (dv.desktop || 0) + (dv.mobile || 0) + (dv.tablet || 0) || 1;
        const pct = (n) => Math.round((n / dvTotal) * 100);
        this.setBar('desktop', pct(dv.desktop || 0));
        this.setBar('mobile', pct(dv.mobile || 0));
        this.setBar('tablet', pct(dv.tablet || 0));

        // Traffic sources
        const rv = s.referrerViews || {};
        const rvTotal = (rv.direct || 0) + (rv.search || 0) + (rv.social || 0) + (rv.referral || 0) || 1;
        this.setBar('direct', Math.round(((rv.direct || 0) / rvTotal) * 100));
        this.setBar('search', Math.round(((rv.search || 0) / rvTotal) * 100));
        this.setBar('social', Math.round(((rv.social || 0) / rvTotal) * 100));
        this.setBar('referral', Math.round(((rv.referral || 0) / rvTotal) * 100));
    },

    setBar(key, pct) {
        const bar = document.getElementById(key + 'Bar');
        const label = document.getElementById(key + 'Pct');
        if (bar) bar.style.width = pct + '%';
        if (label) label.textContent = pct + '%';
    },

    /**
     * Load tools table from real localStorage data
     */
    loadToolsTable() {
        const tbody = document.getElementById('toolsTableBody');
        if (!tbody) return;
        let s = {};
        try { s = JSON.parse(localStorage.getItem('tb_stats')) || {}; } catch {}
        const toolViews = s.toolViews || {};

        const tools = [
            { key: 'pdf-to-word', name: 'PDF to Word', cat: 'PDF Tools' },
            { key: 'pdf-merger', name: 'PDF Merger', cat: 'PDF Tools' },
            { key: 'pdf-splitter', name: 'PDF Splitter', cat: 'PDF Tools' },
            { key: 'pdf-compressor', name: 'PDF Compressor', cat: 'PDF Tools' },
            { key: 'pdf-to-images', name: 'PDF to Images', cat: 'PDF Tools' },
            { key: 'images-to-pdf', name: 'Images to PDF', cat: 'PDF Tools' },
            { key: 'image-compressor', name: 'Image Compressor', cat: 'Image Tools' },
            { key: 'image-resizer', name: 'Image Resizer', cat: 'Image Tools' },
            { key: 'image-cropper', name: 'Image Cropper', cat: 'Image Tools' },
            { key: 'image-converter', name: 'Image Converter', cat: 'Image Tools' },
            { key: 'tamil-typing', name: 'Tamil Typing', cat: 'Tamil Tools' },
            { key: 'tamil-transliteration', name: 'Tamil Transliteration', cat: 'Tamil Tools' },
            { key: 'tamil-unicode', name: 'Tamil Unicode', cat: 'Tamil Tools' },
            { key: 'tamil-calendar', name: 'Tamil Calendar', cat: 'Tamil Tools' },
            { key: 'tamil-numerals', name: 'Tamil Numerals', cat: 'Tamil Tools' },
            { key: 'tamil-word-counter', name: 'Tamil Word Counter', cat: 'Tamil Tools' },
            { key: 'password-generator', name: 'Password Generator', cat: 'Utility Tools' },
            { key: 'qr-generator', name: 'QR Generator', cat: 'Utility Tools' },
            { key: 'barcode-generator', name: 'Barcode Generator', cat: 'Utility Tools' },
            { key: 'word-counter', name: 'Word Counter', cat: 'Utility Tools' },
            { key: 'color-picker', name: 'Color Picker', cat: 'Utility Tools' },
            { key: 'case-converter', name: 'Case Converter', cat: 'Text Tools' },
            { key: 'text-diff', name: 'Text Diff', cat: 'Text Tools' },
            { key: 'text-to-speech', name: 'Text to Speech', cat: 'Text Tools' }
        ];

        tools.sort((a, b) => (toolViews[b.key] || 0) - (toolViews[a.key] || 0));

        tbody.innerHTML = tools.map(t => `
            <tr>
                <td><strong>${t.name}</strong></td>
                <td>${t.cat}</td>
                <td>${this.formatNumber(toolViews[t.key] || 0)} uses</td>
                <td><span class="badge badge-success">Active</span></td>
            </tr>
        `).join('');
    },

    /**
     * Load Google GeoChart with visitor country data
     */
    loadVisitorMap() {
        if (typeof google === 'undefined' || !google.charts) return;

        let s = {};
        try { s = JSON.parse(localStorage.getItem('tb_stats')) || {}; } catch {}
        const countryViews = s.countryViews || {};
        const countryNames = s.countryNames || {};
        const entries = Object.keys(countryViews);

        const mapDiv = document.getElementById('visitorMapChart');
        const note   = document.getElementById('visitorMapNote');
        if (!mapDiv) return;

        if (!entries.length) {
            mapDiv.style.height = '0';
            if (note) note.style.display = 'block';
            return;
        }
        mapDiv.style.height = '420px';
        if (note) note.style.display = 'none';

        google.charts.load('current', { packages: ['geochart'] });
        google.charts.setOnLoadCallback(() => {
            const rows = entries.map(code => [
                countryNames[code] || code,
                countryViews[code]
            ]);
            const data = google.visualization.arrayToDataTable([
                ['Country', 'Visitors'],
                ...rows
            ]);
            const chart = new google.visualization.GeoChart(mapDiv);
            chart.draw(data, {
                colorAxis: { colors: ['#FFD5C8', '#FF6B6B'] },
                backgroundColor: '#f8f9fa',
                datalessRegionColor: '#e9ecef',
                defaultColor: '#e9ecef',
                legend: { textStyle: { color: '#555', fontSize: 12 } }
            });
        });
    },

    /**
     * Initialize charts
     */
    initializeCharts() {
        this.createTrafficChart();
        this.createToolsChart();
        this.createVisitorsChart();
        this.createSourcesChart();
        this.loadVisitorMap();
    },

    /**
     * Get last N days of daily view data from localStorage
     */
    getDailyViewsData(days) {
        let s = {};
        try { s = JSON.parse(localStorage.getItem('tb_stats')) || {}; } catch {}
        const dailyViews = s.dailyViews || {};
        const labels = [];
        const data = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            labels.push(d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }).split(',')[0] || key);
            data.push(dailyViews[key] || 0);
        }
        return { labels, data };
    },

    /**
     * Get top N tools by usage
     */
    getTopToolsData(n) {
        let s = {};
        try { s = JSON.parse(localStorage.getItem('tb_stats')) || {}; } catch {}
        const toolViews = s.toolViews || {};
        const toolNames = {
            'pdf-to-word': 'PDF to Word',
            'tamil-typing': 'Tamil Typing',
            'password-generator': 'Password Gen',
            'qr-generator': 'QR Code',
            'pdf-merger': 'PDF Merger',
            'image-compressor': 'Img Compress',
            'image-resizer': 'Img Resizer',
            'word-counter': 'Word Counter',
            'pdf-splitter': 'PDF Splitter',
            'tamil-transliteration': 'Transliterate',
            'color-picker': 'Color Picker',
            'case-converter': 'Case Convert',
            'text-diff': 'Text Diff',
            'barcode-generator': 'Barcode Gen',
            'tamil-unicode': 'Tamil Unicode',
            'tamil-calendar': 'Tamil Cal',
            'tamil-numerals': 'Tamil Nums',
            'tamil-word-counter': 'Tamil Words',
            'pdf-compressor': 'PDF Compress',
            'pdf-to-images': 'PDF to Img',
            'image-cropper': 'Img Cropper',
            'image-converter': 'Img Convert',
            'images-to-pdf': 'Imgs to PDF',
            'text-to-speech': 'Text Speech'
        };
        const sorted = Object.entries(toolViews)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n);
        return {
            labels: sorted.map(([k]) => toolNames[k] || k),
            data: sorted.map(([, v]) => v)
        };
    },

    /**
     * Create traffic overview chart (last 7 days — real data)
     */
    createTrafficChart() {
        const ctx = document.getElementById('trafficChart');
        if (!ctx) return;

        const { labels, data } = this.getDailyViewsData(7);
        this.charts.traffic = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Page Views',
                    data,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    /**
     * Create tools usage chart (real top-5 tools)
     */
    createToolsChart() {
        const ctx = document.getElementById('toolsChart');
        if (!ctx) return;

        const { labels, data } = this.getTopToolsData(5);
        const colors = [
            'rgba(255, 107, 107, 0.8)',
            'rgba(255, 142, 83, 0.8)',
            'rgba(81, 207, 102, 0.8)',
            'rgba(77, 171, 247, 0.8)',
            'rgba(255, 193, 7, 0.8)'
        ];
        this.charts.tools = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No data yet'],
                datasets: [{
                    label: 'Uses',
                    data: data.length ? data : [0],
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    },

    /**
     * Create visitors analytics chart (last 4 weeks — real data)
     */
    createVisitorsChart() {
        const ctx = document.getElementById('visitorsChart');
        if (!ctx) return;

        let s = {};
        try { s = JSON.parse(localStorage.getItem('tb_stats')) || {}; } catch {}
        const dailyViews = s.dailyViews || {};

        const weekLabels = ['4 wks ago', '3 wks ago', '2 wks ago', 'This week'];
        const pageViews = [0, 0, 0, 0];
        Object.entries(dailyViews).forEach(([dateStr, count]) => {
            const daysAgo = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
            if (daysAgo < 7) pageViews[3] += count;
            else if (daysAgo < 14) pageViews[2] += count;
            else if (daysAgo < 21) pageViews[1] += count;
            else if (daysAgo < 28) pageViews[0] += count;
        });

        this.charts.visitors = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weekLabels,
                datasets: [{
                    label: 'Page Views',
                    data: pageViews,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    /**
     * Create traffic sources chart (real referrer data from tracker)
     */
    createSourcesChart() {
        const ctx = document.getElementById('sourcesChart');
        if (!ctx) return;

        let s = {};
        try { s = JSON.parse(localStorage.getItem('tb_stats')) || {}; } catch {}
        const rv = s.referrerViews || {};
        const data = [rv.direct || 0, rv.search || 0, rv.social || 0, rv.referral || 0];

        this.charts.sources = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Direct', 'Search', 'Social', 'Referral'],
                datasets: [{
                    data,
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
                plugins: { legend: { position: 'bottom' } }
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
            publisherId: 'ca-pub-6827825619861169',
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

        // Password update button
        const updatePasswordBtn = document.getElementById('updatePasswordBtn');
        if (updatePasswordBtn) {
            updatePasswordBtn.addEventListener('click', async () => {
                const current = document.getElementById('currentPassword').value;
                const newPass = document.getElementById('newPassword').value;
                const confirm = document.getElementById('confirmPassword').value;
                const msg = document.getElementById('passwordMsg');

                if (!current || !newPass || !confirm) {
                    msg.style.display = 'block';
                    msg.style.color = '#e74c3c';
                    msg.textContent = 'Please fill in all password fields.';
                    return;
                }
                if (newPass !== confirm) {
                    msg.style.display = 'block';
                    msg.style.color = '#e74c3c';
                    msg.textContent = 'New passwords do not match.';
                    return;
                }
                const result = await AdminAuth.updatePassword(current, newPass);
                msg.style.display = 'block';
                if (result.success) {
                    msg.style.color = '#27ae60';
                    msg.textContent = 'Password updated successfully!';
                    document.getElementById('currentPassword').value = '';
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                } else {
                    msg.style.color = '#e74c3c';
                    msg.textContent = result.error;
                }
            });
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
    loadActivityLogs(typeFilter = 'all', dateFrom = '', dateTo = '') {
        let logs = AdminAuth.getActivityLogs();
        const tbody = document.getElementById('logsTableBody');
        if (!tbody) return;

        if (typeFilter !== 'all') {
            logs = logs.filter(l => l.type.includes(typeFilter));
        }
        if (dateFrom) {
            logs = logs.filter(l => new Date(l.timestamp) >= new Date(dateFrom));
        }
        if (dateTo) {
            logs = logs.filter(l => new Date(l.timestamp) <= new Date(dateTo + 'T23:59:59'));
        }

        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;">No activity logs found.</td></tr>';
            return;
        }

        tbody.innerHTML = logs.slice(0, 50).map(log => `
            <tr>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td><span class="badge badge-${this.getLogBadgeType(log.type)}">${log.type}</span></td>
                <td>${log.description}</td>
                <td>${log.ip}</td>
                <td><span class="badge badge-${log.status === 'success' ? 'success' : 'danger'}">${log.status}</span></td>
            </tr>
        `).join('');

        // Wire filter button (idempotent)
        const filterBtn = document.getElementById('filterLogsBtn');
        if (filterBtn && !filterBtn._wired) {
            filterBtn._wired = true;
            filterBtn.addEventListener('click', () => {
                const type = document.getElementById('logType').value;
                const from = document.getElementById('logDateFrom').value;
                const to = document.getElementById('logDateTo').value;
                this.loadActivityLogs(type, from, to);
            });
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
     * Redraw all charts with fresh localStorage data
     */
    refreshCharts() {
        Object.values(this.charts).forEach(c => { try { c.destroy(); } catch {} });
        this.charts = {};
        this.initializeCharts();
    },

    /**
     * Setup refresh button + auto-refresh every 60 seconds
     */
    setupRefresh() {
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });
        // Auto-refresh stats and charts every 60 seconds
        setInterval(() => this.refreshData(), 60000);
    },

    /**
     * Refresh data
     */
    refreshData() {
        this.loadSectionData(this.currentSection);
        if (this.currentSection === 'overview' || this.currentSection === 'analytics') {
            this.refreshCharts();
        }
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
            case 'leads':
                this.loadLeads();
                break;
            case 'logs':
                this.loadActivityLogs();
                break;
            case 'enquiries':
                loadEnquiries();
                break;
            case 'analytics':
                this.refreshCharts();
                this.loadAnalytics();
                break;
            case 'tools':
                this.loadToolsTable();
                break;
        }
    },

    /**
     * Get analytics data from localStorage tracking
     */
    getAnalyticsData() {
        let s = {};
        try { s = JSON.parse(localStorage.getItem('tb_stats')) || {}; } catch {}

        const today = new Date().toISOString().slice(0, 10);
        const dailyViews = s.dailyViews || {};

        // Today's views
        const todayVisitors = dailyViews[today] || 0;

        // This month's views
        const monthPrefix = today.slice(0, 7); // 'YYYY-MM'
        const monthVisitors = Object.keys(dailyViews)
            .filter(d => d.startsWith(monthPrefix))
            .reduce((sum, d) => sum + dailyViews[d], 0);

        // Total tool clicks (sum of all tool-specific views)
        const toolViews = s.toolViews || {};
        const totalClicks = Object.values(toolViews).reduce((a, b) => a + b, 0);

        return {
            totalVisitors: s.totalViews || 0,
            todayVisitors,
            monthVisitors,
            adRevenue: 0,
            totalClicks
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

/* ══════════════════════════════════════════
   LEADS MANAGEMENT
══════════════════════════════════════════ */
const LeadsManager = {
    LEADS_KEY: 'toolbox_leads',
    PAGE_SIZE: 20,
    currentPage: 1,
    filteredLeads: [],

    getLeads() {
        const d = localStorage.getItem(this.LEADS_KEY);
        return d ? JSON.parse(d) : [];
    },

    toolLabel(id) {
        const map = {
            'pdf-to-word': 'PDF to Word', 'pdf-merger': 'PDF Merger',
            'pdf-splitter': 'PDF Splitter', 'pdf-compressor': 'PDF Compressor',
            'pdf-to-images': 'PDF to Images', 'images-to-pdf': 'Images to PDF',
            'image-compressor': 'Image Compressor', 'image-resizer': 'Image Resizer',
            'image-converter': 'Image Converter', 'image-cropper': 'Image Cropper',
            'tamil-typing': 'Tamil Typing', 'tamil-unicode': 'Tamil Unicode',
            'tamil-transliteration': 'Tamil Transliteration', 'tamil-word-counter': 'Tamil Word Counter',
            'tamil-calendar': 'Tamil Calendar', 'tamil-numerals': 'Tamil Numerals',
            'text-to-speech': 'Text to Speech', 'word-counter': 'Word Counter',
            'case-converter': 'Case Converter', 'text-diff': 'Text Diff',
            'qr-generator': 'QR Generator', 'barcode-generator': 'Barcode Generator',
            'color-picker': 'Color Picker', 'password-generator': 'Password Generator'
        };
        return map[id] || id;
    },

    init() {
        this.loadLeads();
        this.bindControls();
    },

    loadLeads(leads) {
        const all = leads || this.getLeads();
        this.filteredLeads = all;
        this.currentPage = 1;

        /* ── stats ── */
        const now   = new Date();
        const today = now.toDateString();
        const week  = new Date(now - 7 * 86400000);

        /* unique users */
        const uniqueEmails = new Set(all.map(l => l.email));
        document.getElementById('leadsTotal').textContent     = uniqueEmails.size;
        document.getElementById('leadsAccesses').textContent  = Dashboard.formatNumber(all.length);

        const todayCount = all.filter(l => new Date(l.date).toDateString() === today).length;
        const weekCount  = all.filter(l => new Date(l.date) >= week).length;
        document.getElementById('leadsToday').textContent = todayCount;
        document.getElementById('leadsWeek').textContent  = weekCount;

        this.renderTable();
        this.renderPagination();
    },

    renderTable() {
        const tbody = document.getElementById('leadsTableBody');
        const start = (this.currentPage - 1) * this.PAGE_SIZE;
        const page  = this.filteredLeads.slice(start, start + this.PAGE_SIZE);

        if (page.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#aaa;padding:2rem;">
                No leads found.</td></tr>`;
            return;
        }

        tbody.innerHTML = page.map((lead, i) => {
            const dt   = new Date(lead.date);
            const dateStr = dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
            const timeStr = dt.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
            const rowNum  = start + i + 1;
            return `
            <tr>
                <td style="color:#aaa;font-size:.8rem;">${rowNum}</td>
                <td><strong>${this.esc(lead.name)}</strong></td>
                <td>${this.esc(lead.email)}</td>
                <td>${this.esc(lead.phone)}</td>
                <td><span class="badge badge-info">${this.toolLabel(lead.toolId)}</span></td>
                <td style="font-size:.82rem;color:#636e72;">${dateStr} &nbsp;${timeStr}</td>
            </tr>`;
        }).join('');
    },

    renderPagination() {
        const container = document.getElementById('leadsPagination');
        const total = Math.ceil(this.filteredLeads.length / this.PAGE_SIZE);
        if (total <= 1) { container.innerHTML = ''; return; }

        let html = '';
        for (let p = 1; p <= total; p++) {
            const active = p === this.currentPage ? 'btn-primary' : 'btn-secondary';
            html += `<button class="btn ${active}" data-page="${p}">${p}</button>`;
        }
        container.innerHTML = html;

        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentPage = parseInt(btn.dataset.page);
                this.renderTable();
                this.renderPagination();
            });
        });
    },

    applyFilters() {
        const search   = document.getElementById('leadsSearch').value.toLowerCase();
        const tool     = document.getElementById('leadsToolFilter').value;
        const dateFrom = document.getElementById('leadsDateFrom').value;
        const dateTo   = document.getElementById('leadsDateTo').value;
        const all      = this.getLeads();

        const filtered = all.filter(l => {
            const matchSearch = !search ||
                l.name.toLowerCase().includes(search) ||
                l.email.toLowerCase().includes(search) ||
                l.phone.toLowerCase().includes(search);
            const matchTool = !tool || l.toolId === tool;
            const d = new Date(l.date);
            const matchFrom = !dateFrom || d >= new Date(dateFrom);
            const matchTo   = !dateTo   || d <= new Date(dateTo + 'T23:59:59');
            return matchSearch && matchTool && matchFrom && matchTo;
        });

        this.filteredLeads = filtered;
        this.currentPage = 1;
        this.renderTable();
        this.renderPagination();
    },

    exportCSV() {
        const leads = this.filteredLeads;
        if (!leads.length) { alert('No leads to export.'); return; }

        const headers = ['#', 'Name', 'Email', 'Phone', 'Tool', 'Date', 'Time'];
        const rows = leads.map((l, i) => {
            const dt = new Date(l.date);
            return [
                i + 1,
                `"${l.name.replace(/"/g, '""')}"`,
                `"${l.email.replace(/"/g, '""')}"`,
                `"${l.phone.replace(/"/g, '""')}"`,
                `"${this.toolLabel(l.toolId)}"`,
                dt.toLocaleDateString('en-IN'),
                dt.toLocaleTimeString('en-IN')
            ].join(',');
        });

        const csv  = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `toolbox-tamil-leads-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },

    bindControls() {
        document.getElementById('exportLeadsBtn')?.addEventListener('click', () => this.exportCSV());
        document.getElementById('leadsFilterBtn')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('leadsClearBtn')?.addEventListener('click', () => {
            document.getElementById('leadsSearch').value = '';
            document.getElementById('leadsToolFilter').value = '';
            document.getElementById('leadsDateFrom').value = '';
            document.getElementById('leadsDateTo').value = '';
            this.loadLeads();
        });
        document.getElementById('leadsSearch')?.addEventListener('input', () => this.applyFilters());
    },

    esc(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
};

// Wire leads into dashboard navigation
const _origLoadSectionData = Dashboard.loadSectionData.bind(Dashboard);
Dashboard.loadLeads = function() { LeadsManager.loadLeads(); };

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
    LeadsManager.bindControls();

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
