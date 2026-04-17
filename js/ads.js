/**
 * ToolBox Tamil - Advertisement Integration
 * Uses Google AdSense Auto Ads (publisher ID only — no slot IDs required).
 * Manual slot placement is also supported when slot IDs are configured in Admin.
 */

(function () {
    var PUBLISHER_ID = 'ca-pub-6827825619861169';
    var IS_LOCALHOST = ['localhost', '127.0.0.1', ''].indexOf(location.hostname) !== -1;

    var DEFAULT_SLOT_ID = '3481278726';

    function getConfig() {
        try {
            var saved = JSON.parse(localStorage.getItem('ad_settings'));
            if (saved) return saved;
        } catch {}
        // Default: enabled with real publisher + slot IDs
        var slots = {};
        ['top-leaderboard','after-hero','mid-section-1','mid-section-2','before-footer','tool-top','tool-bottom'].forEach(function(s) {
            slots[s] = { id: DEFAULT_SLOT_ID, enabled: true };
        });
        return { enabled: true, publisherId: PUBLISHER_ID, slots: slots };
    }

    var cfg = getConfig();
    var pubId = cfg.publisherId || PUBLISHER_ID;

    // --- Localhost: show placeholder boxes so you can see ad positions ---
    if (IS_LOCALHOST) {
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('.ad-banner[data-ad-slot]').forEach(function (el) {
                var slot = el.getAttribute('data-ad-slot');
                el.style.cssText = 'display:block;background:#f0f4ff;border:2px dashed #aac;text-align:center;padding:18px;color:#668;font-size:13px;margin:8px auto;max-width:728px;border-radius:6px;';
                el.innerHTML = '<span style="display:block;font-weight:600;margin-bottom:4px;">📢 Ad Slot: ' + slot + '</span><span style="font-size:11px;color:#99a;">Real ads appear here on live domain · Publisher: ' + pubId + '</span>';
            });
        });
        return; // Don't load AdSense on localhost
    }

    // --- Live domain: ads disabled in admin ---
    if (!cfg.enabled) {
        document.querySelectorAll('.ad-banner').forEach(function (el) {
            el.style.display = 'none';
        });
        return;
    }

    // --- Load AdSense Auto Ads script (works with publisher ID alone) ---
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + pubId;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);

        // Enable Auto Ads — Google automatically places ads on the page
        (window.adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: pubId,
            enable_page_level_ads: true
        });
    }

    // --- Manual slot injection (only when slot IDs are configured in Admin) ---
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.ad-banner[data-ad-slot]').forEach(function (container) {
            var slotName = container.getAttribute('data-ad-slot');
            var slotCfg = (cfg.slots || {})[slotName];

            // Skip slots with no ID or explicitly disabled
            if (!slotCfg || slotCfg.enabled === false || !slotCfg.id) return;

            container.innerHTML = '';

            var label = document.createElement('div');
            label.className = 'ad-label';
            label.textContent = 'Advertisement';
            container.appendChild(label);

            var ins = document.createElement('ins');
            ins.className = 'adsbygoogle';
            ins.style.display = 'block';
            ins.setAttribute('data-ad-client', pubId);
            ins.setAttribute('data-ad-slot', slotCfg.id);
            ins.setAttribute('data-ad-format', 'auto');
            ins.setAttribute('data-full-width-responsive', 'true');
            container.appendChild(ins);
            container.classList.add('ad-loaded');

            try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
        });
    });
})();
