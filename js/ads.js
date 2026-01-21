/**
 * ToolBox Tamil - Advertisement Integration
 *
 * This file manages advertisement loading and display.
 * Currently shows placeholders - replace with Google AdSense when ready.
 */

// Ad Configuration
const AD_CONFIG = {
    // Set to true when you're ready to enable real ads
    enabled: false,

    // Your Google AdSense Publisher ID (replace with your own)
    // Get this from: https://www.google.com/adsense
    publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',

    // Ad slots configuration
    slots: {
        'top-leaderboard': {
            id: 'XXXXXXXXXX', // Replace with your Ad Unit ID
            format: 'horizontal',
            responsive: true
        },
        'after-hero': {
            id: 'XXXXXXXXXX',
            format: 'horizontal',
            responsive: true
        },
        'mid-section-1': {
            id: 'XXXXXXXXXX',
            format: 'rectangle',
            responsive: true
        },
        'mid-section-2': {
            id: 'XXXXXXXXXX',
            format: 'rectangle',
            responsive: true
        },
        'before-footer': {
            id: 'XXXXXXXXXX',
            format: 'horizontal',
            responsive: true
        },
        'tool-top': {
            id: 'XXXXXXXXXX',
            format: 'horizontal',
            responsive: true
        },
        'tool-bottom': {
            id: 'XXXXXXXXXX',
            format: 'horizontal',
            responsive: true
        }
    }
};

/**
 * Initialize Advertisements
 * Call this function when DOM is loaded
 */
function initializeAds() {
    if (!AD_CONFIG.enabled) {
        console.log('📢 Ads are currently disabled. Set AD_CONFIG.enabled = true to enable.');
        // Keep showing placeholders
        return;
    }

    // Load Google AdSense script
    loadAdSenseScript();

    // Initialize all ad slots
    const adBanners = document.querySelectorAll('.ad-banner[data-ad-slot]');
    adBanners.forEach(banner => {
        const slotName = banner.getAttribute('data-ad-slot');
        const slotConfig = AD_CONFIG.slots[slotName];

        if (slotConfig) {
            createAdSenseAd(banner, slotName, slotConfig);
        }
    });
}

/**
 * Load Google AdSense Script
 */
function loadAdSenseScript() {
    // Check if script is already loaded
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.publisherId}`;
    script.crossOrigin = 'anonymous';

    script.onerror = () => {
        console.error('Failed to load AdSense script');
    };

    document.head.appendChild(script);
}

/**
 * Create Google AdSense Ad Element
 */
function createAdSenseAd(container, slotName, config) {
    // Remove placeholder
    const placeholder = container.querySelector('.ad-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    // Create AdSense ins element
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', AD_CONFIG.publisherId);
    ins.setAttribute('data-ad-slot', config.id);

    if (config.format) {
        ins.setAttribute('data-ad-format', config.format);
    }

    if (config.responsive) {
        ins.setAttribute('data-full-width-responsive', 'true');
    }

    container.appendChild(ins);

    // Mark container as loaded
    container.classList.add('ad-loaded');

    // Push ad to AdSense
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error('AdSense push error:', e);
    }
}

/**
 * Track Ad Impressions (Optional Analytics)
 */
function trackAdImpression(slotName) {
    // You can add Google Analytics or other tracking here
    console.log(`Ad impression: ${slotName}`);
}

/**
 * Alternative: Direct Ad Network Integration
 * If you want to use a different ad network (not AdSense)
 */
function loadCustomAds() {
    const adBanners = document.querySelectorAll('.ad-banner[data-ad-slot]');

    adBanners.forEach(banner => {
        const slotName = banner.getAttribute('data-ad-slot');

        // Example: Load ads from your custom ad server or network
        fetch(`/api/ads/${slotName}`)
            .then(response => response.json())
            .then(data => {
                banner.innerHTML = data.html;
                banner.classList.add('ad-loaded');
            })
            .catch(error => {
                console.error('Failed to load custom ad:', error);
            });
    });
}

/**
 * Refresh Ads (useful for single-page apps)
 */
function refreshAds() {
    if (!AD_CONFIG.enabled) return;

    const adBanners = document.querySelectorAll('.ad-banner.ad-loaded');
    adBanners.forEach(banner => {
        // Clear existing ad
        banner.innerHTML = '';
        banner.classList.remove('ad-loaded');

        // Reload ad
        const slotName = banner.getAttribute('data-ad-slot');
        const slotConfig = AD_CONFIG.slots[slotName];
        if (slotConfig) {
            createAdSenseAd(banner, slotName, slotConfig);
        }
    });
}

// Initialize ads when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeAds();
});

// Export functions for external use
window.ToolBoxAds = {
    init: initializeAds,
    refresh: refreshAds,
    config: AD_CONFIG
};
