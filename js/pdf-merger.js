/**
 * PDF Merger Tool
 * Combines multiple PDF files into one
 */

const { PDFDocument } = PDFLib;

let pdfFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const pdfFilesInput = document.getElementById('pdfFiles');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    const addMoreBtn = document.getElementById('addMoreBtn');
    const filesContainer = document.getElementById('filesContainer');
    const filesList = document.getElementById('filesList');
    const mergeBtn = document.getElementById('mergeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const actionButtons = document.getElementById('actionButtons');

    // Click to select files
    selectFilesBtn.addEventListener('click', () => pdfFilesInput.click());
    addMoreBtn.addEventListener('click', () => pdfFilesInput.click());
    uploadArea.addEventListener('click', () => pdfFilesInput.click());

    // Drag and drop on upload area
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

        const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
        if (files.length > 0) {
            addFiles(files);
        } else {
            showNotification('Please upload PDF files only', 'error');
        }
    });

    // File selection
    pdfFilesInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            addFiles(files);
        }
        e.target.value = ''; // Reset input
    });

    // Merge PDFs
    mergeBtn.addEventListener('click', mergePDFs);

    // Clear all
    clearBtn.addEventListener('click', clearAll);
});

/**
 * Add files to the list
 */
function addFiles(files) {
    files.forEach(file => {
        pdfFiles.push({
            file: file,
            id: Date.now() + Math.random()
        });
    });

    renderFilesList();
    updateUI();
}

/**
 * Render files list
 */
function renderFilesList() {
    const filesList = document.getElementById('filesList');
    filesList.innerHTML = '';

    pdfFiles.forEach((item, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.draggable = true;
        fileItem.dataset.index = index;

        fileItem.innerHTML = `
            <div class="drag-handle">⋮⋮</div>
            <div class="file-icon">📄</div>
            <div class="file-info-inline">
                <div class="file-name">${item.file.name}</div>
                <div class="file-size">${formatFileSize(item.file.size)}</div>
            </div>
            <div class="file-order">#${index + 1}</div>
            <button class="remove-file-btn" data-index="${index}">✕</button>
        `;

        // Drag and drop for reordering
        fileItem.addEventListener('dragstart', handleDragStart);
        fileItem.addEventListener('dragover', handleDragOver);
        fileItem.addEventListener('drop', handleDrop);
        fileItem.addEventListener('dragend', handleDragEnd);

        // Remove button
        fileItem.querySelector('.remove-file-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFile(index);
        });

        filesList.appendChild(fileItem);
    });
}

/**
 * Drag and drop handlers
 */
let draggedIndex = null;

function handleDragStart(e) {
    draggedIndex = parseInt(e.target.dataset.index);
    e.target.style.opacity = '0.5';
}

function handleDragOver(e) {
    e.preventDefault();
    return false;
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    const dropIndex = parseInt(e.target.closest('.file-item').dataset.index);

    if (draggedIndex !== dropIndex) {
        const draggedItem = pdfFiles[draggedIndex];
        pdfFiles.splice(draggedIndex, 1);
        pdfFiles.splice(dropIndex, 0, draggedItem);
        renderFilesList();
    }

    return false;
}

function handleDragEnd(e) {
    e.target.style.opacity = '';
    draggedIndex = null;
}

/**
 * Remove file
 */
function removeFile(index) {
    pdfFiles.splice(index, 1);
    renderFilesList();
    updateUI();
}

/**
 * Update UI based on files
 */
function updateUI() {
    const uploadArea = document.getElementById('uploadArea');
    const filesContainer = document.getElementById('filesContainer');
    const actionButtons = document.getElementById('actionButtons');

    if (pdfFiles.length > 0) {
        uploadArea.style.display = 'none';
        filesContainer.style.display = 'block';
        actionButtons.style.display = pdfFiles.length >= 2 ? 'flex' : 'none';
    } else {
        uploadArea.style.display = 'flex';
        filesContainer.style.display = 'none';
        actionButtons.style.display = 'none';
    }
}

/**
 * Merge PDFs
 */
async function mergePDFs() {
    if (pdfFiles.length < 2) {
        showNotification('Please select at least 2 PDF files', 'error');
        return;
    }

    try {
        // Show progress
        document.getElementById('progressSection').style.display = 'block';
        updateProgress(0, 'Starting merge...');

        // Create new PDF document
        const mergedPdf = await PDFDocument.create();

        // Process each PDF
        for (let i = 0; i < pdfFiles.length; i++) {
            updateProgress(((i + 1) / pdfFiles.length) * 100, `Merging file ${i + 1} of ${pdfFiles.length}...`);

            const arrayBuffer = await pdfFiles[i].file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);

            // Copy all pages
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        updateProgress(100, 'Finalizing...');

        // Save merged PDF
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        saveAs(blob, 'merged-document.pdf');

        // Hide progress
        setTimeout(() => {
            document.getElementById('progressSection').style.display = 'none';
        }, 500);

        showNotification('PDFs merged successfully!', 'success');

    } catch (error) {
        console.error('Error merging PDFs:', error);
        showNotification('Error merging PDFs. Please try again.', 'error');
        document.getElementById('progressSection').style.display = 'none';
    }
}

/**
 * Clear all files
 */
function clearAll() {
    pdfFiles = [];
    renderFilesList();
    updateUI();
}

/**
 * Update progress bar
 */
function updateProgress(percent, text) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = text;
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
