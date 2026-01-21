/**
 * PDF to Word Converter
 * Extracts text from PDF and converts to DOCX format
 */

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let extractedText = '';
let currentFileName = '';

document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const pdfFile = document.getElementById('pdfFile');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const previewSection = document.getElementById('previewSection');
    const previewContent = document.getElementById('previewContent');
    const actionButtons = document.getElementById('actionButtons');
    const downloadBtn = document.getElementById('downloadBtn');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const newFileBtn = document.getElementById('newFileBtn');

    // Click to select file
    selectFileBtn.addEventListener('click', () => pdfFile.click());
    uploadArea.addEventListener('click', () => pdfFile.click());

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#FF6B6B';
        uploadArea.style.background = '#FFF5F5';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#E1E8ED';
        uploadArea.style.background = '';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#E1E8ED';
        uploadArea.style.background = '';

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handleFile(files[0]);
        } else {
            showNotification('Please upload a PDF file', 'error');
        }
    });

    // File selection
    pdfFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Remove file
    removeFileBtn.addEventListener('click', resetTool);

    // Download as Word
    downloadBtn.addEventListener('click', downloadAsWord);

    // Copy text
    copyTextBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(extractedText);
        showNotification('Text copied to clipboard!', 'success');
    });

    // Convert another file
    newFileBtn.addEventListener('click', resetTool);
});

/**
 * Handle file upload
 */
function handleFile(file) {
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File is too large. Maximum size is 10MB.', 'error');
        return;
    }

    currentFileName = file.name.replace('.pdf', '');

    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'flex';

    // Process PDF
    processPDF(file);
}

/**
 * Process PDF and extract text
 */
async function processPDF(file) {
    try {
        // Show progress
        document.getElementById('progressSection').style.display = 'block';
        updateProgress(0, 'Loading PDF...');

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const totalPages = pdf.numPages;
        extractedText = '';

        // Extract text from each page
        for (let i = 1; i <= totalPages; i++) {
            updateProgress((i / totalPages) * 100, `Processing page ${i} of ${totalPages}...`);

            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Add page text
            const pageText = textContent.items.map(item => item.str).join(' ');
            extractedText += pageText + '\n\n';
        }

        // Show preview
        document.getElementById('previewContent').textContent = extractedText.substring(0, 1000) + '...';
        document.getElementById('previewSection').style.display = 'block';
        document.getElementById('actionButtons').style.display = 'flex';

        // Hide progress
        setTimeout(() => {
            document.getElementById('progressSection').style.display = 'none';
        }, 500);

        showNotification('PDF processed successfully!', 'success');

    } catch (error) {
        console.error('Error processing PDF:', error);
        showNotification('Error processing PDF. Please try another file.', 'error');
        resetTool();
    }
}

/**
 * Download as Word document
 */
async function downloadAsWord() {
    try {
        const doc = new docx.Document({
            sections: [{
                properties: {},
                children: [
                    new docx.Paragraph({
                        text: "Converted from PDF",
                        heading: docx.HeadingLevel.HEADING_1,
                        spacing: { after: 400 }
                    }),
                    ...extractedText.split('\n\n').map(para =>
                        new docx.Paragraph({
                            text: para.trim(),
                            spacing: { after: 200 }
                        })
                    )
                ]
            }]
        });

        const blob = await docx.Packer.toBlob(doc);
        saveAs(blob, `${currentFileName}.docx`);

        showNotification('Word document downloaded!', 'success');

    } catch (error) {
        console.error('Error creating Word document:', error);
        showNotification('Error creating Word document', 'error');
    }
}

/**
 * Update progress bar
 */
function updateProgress(percent, text) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = text;
}

/**
 * Reset tool
 */
function resetTool() {
    document.getElementById('pdfFile').value = '';
    document.getElementById('uploadArea').style.display = 'flex';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('actionButtons').style.display = 'none';
    extractedText = '';
    currentFileName = '';
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
