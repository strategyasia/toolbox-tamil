/**
 * ToolBox Tamil - Main JavaScript
 * Handles language switching and tool navigation
 */

// Current language state
let currentLang = localStorage.getItem('toolbox-lang') || 'en';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();
    initializeToolCards();
    initializeLanguageSwitcher();
});

/**
 * Initialize language based on saved preference
 */
function initializeLanguage() {
    setLanguage(currentLang);
}

/**
 * Set up language switcher buttons
 */
function initializeLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');

    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);

            // Update button states
            langButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Save preference
            localStorage.setItem('toolbox-lang', lang);
        });
    });
}

/**
 * Set language for all translatable elements
 */
function setLanguage(lang) {
    currentLang = lang;

    // Update all elements with data-en and data-ta attributes
    const translatableElements = document.querySelectorAll('[data-en][data-ta]');

    translatableElements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });

    // Update lang button active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang === 'ta' ? 'ta' : 'en');
}

/**
 * Initialize tool card click handlers
 */
function initializeToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');

    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const toolId = this.getAttribute('data-tool');
            if (toolId) {
                openTool(toolId);
            }
        });

        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Open tool page
 */
function openTool(toolId) {
    // For now, show an alert. Later we'll navigate to individual tool pages
    const toolNames = {
        'pdf-to-word': { en: 'PDF to Word Converter', ta: 'PDF இலிருந்து Word மாற்றி' },
        'pdf-merger': { en: 'PDF Merger', ta: 'PDF இணைப்பு' },
        'pdf-splitter': { en: 'PDF Splitter', ta: 'PDF பிரிப்பான்' },
        'pdf-compressor': { en: 'PDF Compressor', ta: 'PDF சுருக்கி' },
        'pdf-to-images': { en: 'PDF to Images', ta: 'PDF இலிருந்து படங்கள்' },
        'images-to-pdf': { en: 'Images to PDF', ta: 'படங்கள் இலிருந்து PDF' },
        'image-compressor': { en: 'Image Compressor', ta: 'படம் சுருக்கி' },
        'image-resizer': { en: 'Image Resizer', ta: 'படம் மறுஅளவு' },
        'image-converter': { en: 'Image Converter', ta: 'படம் மாற்றி' },
        'image-cropper': { en: 'Image Cropper', ta: 'படம் வெட்டி' },
        'tamil-typing': { en: 'Tamil Typing Tool', ta: 'தமிழ் தட்டச்சு கருவி' },
        'tamil-unicode': { en: 'Tamil Unicode Converter', ta: 'தமிழ் யூனிகோட் மாற்றி' },
        'tamil-transliteration': { en: 'Tamil Transliteration', ta: 'தமிழ் ஒலிபெயர்ப்பு' },
        'tamil-word-counter': { en: 'Tamil Word Counter', ta: 'தமிழ் சொல் கணக்கி' },
        'tamil-calendar': { en: 'Tamil Calendar Converter', ta: 'தமிழ் நாட்காட்டி மாற்றி' },
        'tamil-numerals': { en: 'Tamil Numeral Converter', ta: 'தமிழ் எண் மாற்றி' },
        'text-to-speech': { en: 'Text to Speech', ta: 'உரை முதல் பேச்சு வரை' },
        'word-counter': { en: 'Word Counter', ta: 'சொல் கணக்கி' },
        'case-converter': { en: 'Case Converter', ta: 'வழக்கு மாற்றி' },
        'text-diff': { en: 'Text Diff Checker', ta: 'உரை வேறுபாடு சரிபார்ப்பு' },
        'qr-generator': { en: 'QR Code Generator', ta: 'QR குறியீடு உருவாக்கி' },
        'barcode-generator': { en: 'Barcode Generator', ta: 'பார்கோடு உருவாக்கி' },
        'color-picker': { en: 'Color Picker', ta: 'வண்ண தேர்வாளர்' },
        'password-generator': { en: 'Password Generator', ta: 'கடவுச்சொல் உருவாக்கி' }
    };

    const toolName = toolNames[toolId]?.[currentLang] || toolId;

    // For now, just show a message. Later we'll navigate to the tool page
    showNotification(`Opening ${toolName}...`, 'info');

    // Navigate to tool page after a brief delay
    setTimeout(() => {
        window.location.href = `tools/${toolId}.html`;
    }, 500);
}

/**
 * Show notification (simple implementation)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'info' ? '#FF6B6B' : '#4CAF50'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
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

/**
 * Smooth scroll to section
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Toggle mobile menu (if needed)
 */
function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Export functions for use in other scripts
window.ToolBoxTamil = {
    setLanguage,
    openTool,
    showNotification,
    scrollToSection
};
