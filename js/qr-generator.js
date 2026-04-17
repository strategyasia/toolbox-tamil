/**
 * QR Code Generator
 * Generate QR codes for various data types
 */

let currentQRCode = null;
let currentType = 'url';

document.addEventListener('DOMContentLoaded', function() {
    const typeButtons = document.querySelectorAll('.type-btn');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');

    // Type selection
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            typeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding input
            currentType = this.dataset.type;
            showInputForType(currentType);
        });
    });

    // Generate QR code
    generateBtn.addEventListener('click', generateQRCode);

    // Download PNG
    downloadBtn.addEventListener('click', downloadQRAsPNG);

    // Clear and start over
    clearBtn.addEventListener('click', clearQRCode);

    // Enter key to generate
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && document.getElementById('outputSection').style.display === 'none') {
            generateQRCode();
        }
    });
});

/**
 * Show input fields for selected type
 */
function showInputForType(type) {
    // Hide all inputs
    document.querySelectorAll('.input-container').forEach(container => {
        container.style.display = 'none';
    });

    // Show selected input
    const inputMap = {
        'url': 'urlInput',
        'text': 'textInput',
        'phone': 'phoneInput',
        'email': 'emailInput',
        'wifi': 'wifiInput'
    };

    const containerId = inputMap[type];
    if (containerId) {
        document.getElementById(containerId).style.display = 'block';
    }
}

/**
 * Get data based on current type
 */
function getData() {
    let data = '';

    switch (currentType) {
        case 'url':
            data = document.getElementById('urlField').value.trim();
            if (data && !data.startsWith('http')) {
                data = 'https://' + data;
            }
            break;

        case 'text':
            data = document.getElementById('textField').value.trim();
            break;

        case 'phone':
            const phone = document.getElementById('phoneField').value.trim();
            data = phone ? 'tel:' + phone : '';
            break;

        case 'email':
            const email = document.getElementById('emailField').value.trim();
            data = email ? 'mailto:' + email : '';
            break;

        case 'wifi':
            const ssid = document.getElementById('wifiSSID').value.trim();
            const password = document.getElementById('wifiPassword').value.trim();
            const security = document.getElementById('wifiSecurity').value;

            if (ssid) {
                data = `WIFI:T:${security};S:${ssid};P:${password};;`;
            }
            break;
    }

    return data;
}

/**
 * Generate QR Code
 */
function generateQRCode() {
    const data = getData();

    if (!data) {
        showNotification('Please enter some data to generate QR code', 'error');
        return;
    }

    // Clear previous QR code
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = '';

    // Get options
    const size = parseInt(document.getElementById('qrSize').value);
    const color = document.getElementById('qrColor').value;

    // Generate new QR code
    try {
        currentQRCode = new QRCode(qrcodeContainer, {
            text: data,
            width: size,
            height: size,
            colorDark: color,
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        // Show output section
        document.getElementById('outputSection').style.display = 'block';

        // Scroll to QR code
        setTimeout(() => {
            qrcodeContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        showNotification('QR Code generated successfully!', 'success');

    } catch (error) {
        console.error('Error generating QR code:', error);
        showNotification('Error generating QR code', 'error');
    }
}

/**
 * Download QR Code as PNG
 */
function downloadQRAsPNG() {
    const canvas = document.querySelector('#qrcode canvas');

    if (canvas) {
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'qrcode.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showNotification('QR Code downloaded!', 'success');
        });
    } else {
        showNotification('No QR code to download', 'error');
    }
}

/**
 * Clear QR Code
 */
function clearQRCode() {
    document.getElementById('qrcode').innerHTML = '';
    document.getElementById('outputSection').style.display = 'none';
    currentQRCode = null;

    // Clear inputs
    document.getElementById('urlField').value = '';
    document.getElementById('textField').value = '';
    document.getElementById('phoneField').value = '';
    document.getElementById('emailField').value = '';
    document.getElementById('wifiSSID').value = '';
    document.getElementById('wifiPassword').value = '';

    // Focus on current input
    const inputMap = {
        'url': 'urlField',
        'text': 'textField',
        'phone': 'phoneField',
        'email': 'emailField',
        'wifi': 'wifiSSID'
    };

    const fieldId = inputMap[currentType];
    if (fieldId) {
        document.getElementById(fieldId).focus();
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else {
        notification.style.background = '#FF6B6B';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
