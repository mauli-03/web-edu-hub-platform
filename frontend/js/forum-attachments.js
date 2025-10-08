/**
 * Forum Attachments Handler
 * Provides functionality for uploading, previewing, and managing attachments in forum posts
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const attachmentInput = document.getElementById('attachment-input');
    const attachPreviewContainer = document.getElementById('attachment-previews');
    const uploadBtn = document.getElementById('upload-attachment-btn');
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedFileTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain'
    ];
    
    // Track uploaded files
    let uploadedFiles = [];
    
    // Initialize functionality if elements exist
    if (attachmentInput && attachPreviewContainer) {
        initializeAttachmentFunctionality();
    }
    
    /**
     * Initialize attachment upload functionality
     */
    function initializeAttachmentFunctionality() {
        // Click handler for the upload button
        if (uploadBtn) {
            uploadBtn.addEventListener('click', function() {
                attachmentInput.click();
            });
        }
        
        // File selection handler
        attachmentInput.addEventListener('change', handleFileSelection);
        
        // Initialize delete functionality for existing attachments
        initializeExistingAttachments();
    }
    
    /**
     * Handle file selection from input
     */
    function handleFileSelection(e) {
        const files = e.target.files;
        
        if (files.length === 0) return;
        
        // Process each selected file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Validate file size and type
            if (!validateFile(file)) continue;
            
            // Add to tracking array
            uploadedFiles.push(file);
            
            // Create preview element
            createAttachmentPreview(file);
        }
        
        // Clear input to allow selecting the same file again
        attachmentInput.value = '';
    }
    
    /**
     * Validate file size and type
     */
    function validateFile(file) {
        // Check file size
        if (file.size > maxFileSize) {
            showErrorMessage(`File ${file.name} exceeds the maximum size of 5MB`);
            return false;
        }
        
        // Check file type
        if (!allowedFileTypes.includes(file.type)) {
            showErrorMessage(`File type ${file.type} is not allowed`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Create attachment preview element
     */
    function createAttachmentPreview(file) {
        const preview = document.createElement('div');
        preview.className = 'attachment-preview';
        preview.dataset.name = file.name;
        
        // Determine icon based on file type
        let iconClass = 'fas fa-file';
        if (file.type === 'application/pdf') {
            iconClass = 'fas fa-file-pdf';
        } else if (file.type.includes('word')) {
            iconClass = 'fas fa-file-word';
        } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
            iconClass = 'fas fa-file-excel';
        } else if (file.type.includes('powerpoint') || file.type.includes('presentation')) {
            iconClass = 'fas fa-file-powerpoint';
        } else if (file.type.includes('image')) {
            iconClass = 'fas fa-file-image';
        } else if (file.type === 'text/plain') {
            iconClass = 'fas fa-file-alt';
        }
        
        // Format file size
        const fileSize = formatFileSize(file.size);
        
        // Create preview HTML
        preview.innerHTML = `
            <div class="attachment-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="attachment-details">
                <div class="attachment-name">${file.name}</div>
                <div class="attachment-meta">${fileSize}</div>
            </div>
            <div class="attachment-actions">
                <button class="attachment-delete" title="Remove attachment">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add to preview container
        attachPreviewContainer.appendChild(preview);
        
        // Add delete event listener
        const deleteBtn = preview.querySelector('.attachment-delete');
        deleteBtn.addEventListener('click', function() {
            removeAttachment(file.name);
            preview.remove();
        });
        
        // Show the previews container if it was hidden
        attachPreviewContainer.classList.remove('d-none');
    }
    
    /**
     * Remove attachment from tracking array
     */
    function removeAttachment(fileName) {
        uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
    }
    
    /**
     * Initialize functionality for existing attachments
     */
    function initializeExistingAttachments() {
        const existingAttachments = document.querySelectorAll('.attachment');
        
        existingAttachments.forEach(attachment => {
            const downloadBtn = attachment.querySelector('.attachment-download');
            const fileName = attachment.querySelector('.attachment-name').textContent;
            
            if (downloadBtn) {
                downloadBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    // In a real application, this would trigger a download
                    // For now, just show a message
                    alert(`Downloading ${fileName}...`);
                });
            }
        });
    }
    
    /**
     * Format file size in KB, MB
     */
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' bytes';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
    }
    
    /**
     * Show error message
     */
    function showErrorMessage(message) {
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'alert alert-danger alert-dismissible fade show';
        errorElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to document
        document.body.appendChild(errorElement);
        
        // Position it at the top
        errorElement.style.position = 'fixed';
        errorElement.style.top = '10px';
        errorElement.style.right = '10px';
        errorElement.style.zIndex = '9999';
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
    
    /**
     * Get all uploaded files (for form submission)
     */
    window.getForumAttachments = function() {
        return uploadedFiles;
    };
}); 