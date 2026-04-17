(function () {
    var STATS_KEY = 'tb_stats';

    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    function getStats() {
        try { return JSON.parse(localStorage.getItem(STATS_KEY)) || {}; } catch { return {}; }
    }

    function saveStats(s) {
        try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
    }

    function toolKey() {
        var path = window.location.pathname;
        var match = path.match(/\/tools\/([^/]+)\.html/);
        return match ? match[1] : null;
    }

    function deviceType() {
        var ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
        if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
        return 'desktop';
    }

    function referrerCategory() {
        var ref = document.referrer;
        if (!ref) return 'direct';
        if (/google|bing|yahoo|duckduckgo|baidu|yandex/i.test(ref)) return 'search';
        if (/facebook|twitter|instagram|linkedin|youtube|tiktok|pinterest|reddit/i.test(ref)) return 'social';
        return 'referral';
    }

    function track() {
        var s = getStats();
        var d = today();
        var tool = toolKey();

        s.totalViews = (s.totalViews || 0) + 1;

        // daily views
        if (!s.dailyViews) s.dailyViews = {};
        s.dailyViews[d] = (s.dailyViews[d] || 0) + 1;

        // keep only last 90 days
        var cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        Object.keys(s.dailyViews).forEach(function (k) {
            if (new Date(k) < cutoff) delete s.dailyViews[k];
        });

        // per-tool views
        if (tool) {
            if (!s.toolViews) s.toolViews = {};
            s.toolViews[tool] = (s.toolViews[tool] || 0) + 1;
        }

        // device tracking
        if (!s.deviceViews) s.deviceViews = {};
        var dev = deviceType();
        s.deviceViews[dev] = (s.deviceViews[dev] || 0) + 1;

        // referrer / traffic source tracking
        if (!s.referrerViews) s.referrerViews = {};
        var ref = referrerCategory();
        s.referrerViews[ref] = (s.referrerViews[ref] || 0) + 1;

        saveStats(s);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', track);
    } else {
        track();
    }
})();
