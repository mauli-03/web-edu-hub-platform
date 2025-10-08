/**
 * Create Forum Post Page Functionality
 * Handles rich text editing, form validation, and submission
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const createForumForm = document.getElementById('create-forum-form');
    const forumTitleInput = document.getElementById('forum-title');
    const forumDescriptionInput = document.getElementById('forum-description');
    const forumCategorySelect = document.getElementById('forum-category');
    const forumContentEditor = document.getElementById('forum-content-editor');
    const tagsInput = document.getElementById('forum-tags');
    const previewBtn = document.getElementById('preview-post-btn');
    const submitBtn = document.getElementById('submit-post-btn');
    const cancelBtn = document.getElementById('cancel-post-btn');
    const titleCounter = document.getElementById('title-counter');
    const descriptionCounter = document.getElementById('description-counter');
    const contentEditor = document.getElementById('content-editor');
    
    // Character limits
    const TITLE_MAX_LENGTH = 100;
    const DESCRIPTION_MAX_LENGTH = 200;
    
    // Initialize functionality if form exists
    if (createForumForm) {
        initializeFormFunctionality();
    }
    
    /**
     * Initialize form functionality
     */
    function initializeFormFunctionality() {
        // Initialize rich text editor if the element exists
        if (contentEditor) {
            initializeRichTextEditor();
        }
        
        // Initialize character counters
        initializeCharacterCounters();
        
        // Initialize tag input
        initializeTagInput();
        
        // Form submission handler
        createForumForm.addEventListener('submit', handleFormSubmission);
        
        // Preview button handler
        if (previewBtn) {
            previewBtn.addEventListener('click', handlePreview);
        }
        
        // Cancel button handler
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                    window.location.href = 'forums.html';
                }
            });
        }
    }
    
    /**
     * Initialize rich text editor
     */
    function initializeRichTextEditor() {
        // Check if Quill is available (should be included in the page)
        if (typeof Quill === 'undefined') {
            console.error('Quill editor not available. Make sure to include Quill library.');
            return;
        }
        
        // Define toolbar options
        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image']
        ];
        
        // Initialize Quill editor
        const quill = new Quill(contentEditor, {
            modules: {
                toolbar: toolbarOptions
            },
            placeholder: 'Write your post content here...',
            theme: 'snow'
        });
        
        // Store Quill instance for later use
        window.quillEditor = quill;
        
        // Handle image upload
        const toolbar = quill.getModule('toolbar');
        toolbar.addHandler('image', handleImageUpload);
    }
    
    /**
     * Handle image upload in Quill editor
     */
    function handleImageUpload() {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        
        input.onchange = function() {
            const file = input.files[0];
            
            if (file) {
                // In a real application, you would upload the file to a server
                // and insert the URL returned by the server
                // For now, create a local object URL
                const reader = new FileReader();
                reader.onload = function(e) {
                    const range = window.quillEditor.getSelection(true);
                    window.quillEditor.insertEmbed(range.index, 'image', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
    }
    
    /**
     * Initialize character counters for title and description
     */
    function initializeCharacterCounters() {
        if (forumTitleInput && titleCounter) {
            forumTitleInput.maxLength = TITLE_MAX_LENGTH;
            updateCharacterCounter(forumTitleInput, titleCounter, TITLE_MAX_LENGTH);
            
            forumTitleInput.addEventListener('input', function() {
                updateCharacterCounter(this, titleCounter, TITLE_MAX_LENGTH);
            });
        }
        
        if (forumDescriptionInput && descriptionCounter) {
            forumDescriptionInput.maxLength = DESCRIPTION_MAX_LENGTH;
            updateCharacterCounter(forumDescriptionInput, descriptionCounter, DESCRIPTION_MAX_LENGTH);
            
            forumDescriptionInput.addEventListener('input', function() {
                updateCharacterCounter(this, descriptionCounter, DESCRIPTION_MAX_LENGTH);
            });
        }
    }
    
    /**
     * Update character counter display
     */
    function updateCharacterCounter(inputElement, counterElement, maxLength) {
        const currentLength = inputElement.value.length;
        counterElement.textContent = `${currentLength}/${maxLength}`;
        
        // Add warning class when approaching limit
        if (currentLength > maxLength * 0.8) {
            counterElement.classList.add('text-warning');
        } else {
            counterElement.classList.remove('text-warning');
        }
        
        // Add danger class when at limit
        if (currentLength >= maxLength) {
            counterElement.classList.add('text-danger');
        } else {
            counterElement.classList.remove('text-danger');
        }
    }
    
    /**
     * Initialize tag input with suggestions
     */
    function initializeTagInput() {
        if (!tagsInput) return;
        
        // Popular tag suggestions
        const tagSuggestions = [
            'technology', 'education', 'programming', 'career',
            'data science', 'web development', 'AI', 'machine learning', 
            'computer science', 'study tips', 'research', 'academic', 
            'exams', 'university', 'college', 'learning', 'professional development',
            'interview', 'resume', 'networking', 'soft skills'
        ];
        
        // Check if Tagify is available (should be included in the page)
        if (typeof Tagify === 'undefined') {
            console.error('Tagify not available. Make sure to include Tagify library.');
            return;
        }
        
        // Initialize Tagify
        const tagify = new Tagify(tagsInput, {
            whitelist: tagSuggestions,
            maxTags: 5,
            dropdown: {
                maxItems: 10,
                classname: 'tags-dropdown',
                enabled: 0,
                closeOnSelect: false
            }
        });
        
        // Store Tagify instance for later use
        window.tagifyInstance = tagify;
    }
    
    /**
     * Handle form submission
     */
    function handleFormSubmission(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Get content from Quill editor
        const editorContent = window.quillEditor ? window.quillEditor.root.innerHTML : '';
        
        // Get tags from Tagify
        const tags = window.tagifyInstance ? window.tagifyInstance.value.map(tag => tag.value) : [];
        
        // Get attachments
        const attachments = window.getForumAttachments ? window.getForumAttachments() : [];
        
        // Prepare form data
        const formData = {
            title: forumTitleInput.value,
            description: forumDescriptionInput.value,
            category: forumCategorySelect.value,
            content: editorContent,
            tags: tags,
            attachments: attachments
        };
        
        // In a real application, you would submit this to a server
        // For demonstration purposes, show success message and redirect
        showSuccessMessage();
        
        // Simulate server delay
        setTimeout(function() {
            window.location.href = 'forums.html';
        }, 2000);
    }
    
    /**
     * Validate form fields
     */
    function validateForm() {
        let isValid = true;
        
        // Clear previous error messages
        clearErrorMessages();
        
        // Validate title
        if (!forumTitleInput.value.trim()) {
            showFieldError(forumTitleInput, 'Please enter a title for your post');
            isValid = false;
        } else if (forumTitleInput.value.length < 5) {
            showFieldError(forumTitleInput, 'Title must be at least 5 characters');
            isValid = false;
        }
        
        // Validate description
        if (!forumDescriptionInput.value.trim()) {
            showFieldError(forumDescriptionInput, 'Please enter a brief description');
            isValid = false;
        } else if (forumDescriptionInput.value.length < 10) {
            showFieldError(forumDescriptionInput, 'Description must be at least 10 characters');
            isValid = false;
        }
        
        // Validate category
        if (!forumCategorySelect.value) {
            showFieldError(forumCategorySelect, 'Please select a category');
            isValid = false;
        }
        
        // Validate content
        if (window.quillEditor) {
            const content = window.quillEditor.getText().trim();
            if (content.length < 20) {
                showErrorMessage('Please enter more content for your post (minimum 20 characters)');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    /**
     * Show error message for a specific field
     */
    function showFieldError(field, message) {
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        errorElement.textContent = message;
        
        // Add error class to field
        field.classList.add('is-invalid');
        
        // Add error message after field
        field.parentNode.appendChild(errorElement);
    }
    
    /**
     * Clear all error messages
     */
    function clearErrorMessages() {
        // Remove all invalid-feedback elements
        document.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
        
        // Remove is-invalid class from all form elements
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
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
        
        // Add to the top of the form
        createForumForm.prepend(errorElement);
        
        // Scroll to the top of the form
        window.scrollTo({
            top: createForumForm.offsetTop - 100,
            behavior: 'smooth'
        });
    }
    
    /**
     * Show success message
     */
    function showSuccessMessage() {
        // Create success element
        const successElement = document.createElement('div');
        successElement.className = 'alert alert-success alert-dismissible fade show';
        successElement.innerHTML = `
            Your post has been submitted successfully!
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add to the top of the form
        createForumForm.prepend(successElement);
        
        // Scroll to the top of the form
        window.scrollTo({
            top: createForumForm.offsetTop - 100,
            behavior: 'smooth'
        });
        
        // Disable submit button
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    }
    
    /**
     * Handle preview button click
     */
    function handlePreview(e) {
        e.preventDefault();
        
        // Get content from Quill editor
        const editorContent = window.quillEditor ? window.quillEditor.root.innerHTML : '';
        
        // Create preview modal
        const previewModal = document.createElement('div');
        previewModal.className = 'modal fade';
        previewModal.id = 'previewModal';
        previewModal.setAttribute('tabindex', '-1');
        previewModal.setAttribute('aria-labelledby', 'previewModalLabel');
        previewModal.setAttribute('aria-hidden', 'true');
        
        // Get form data
        const title = forumTitleInput.value || 'Your Post Title';
        const description = forumDescriptionInput.value || 'Your post description will appear here.';
        const category = forumCategorySelect.options[forumCategorySelect.selectedIndex]?.text || 'Category';
        
        // Modal content
        previewModal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="previewModalLabel">Preview Your Post</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="preview-container">
                            <div class="preview-header">
                                <div class="category-badge">${category}</div>
                                <h2 class="preview-title">${title}</h2>
                                <p class="preview-description">${description}</p>
                                <div class="preview-meta">
                                    <div class="preview-author">
                                        <img src="../assets/images/avatars/user1.jpg" alt="Author" class="preview-author-avatar">
                                        <div>
                                            <div class="preview-author-name">Your Name</div>
                                            <div class="preview-post-date">Posted on: ${new Date().toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div class="preview-stats">
                                        <div class="preview-stat">
                                            <i class="far fa-eye"></i> 0 views
                                        </div>
                                        <div class="preview-stat">
                                            <i class="far fa-comment"></i> 0 comments
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="preview-content">
                                ${editorContent || '<p>Your post content will appear here.</p>'}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to document body
        document.body.appendChild(previewModal);
        
        // Initialize Bootstrap modal
        const modal = new bootstrap.Modal(previewModal);
        modal.show();
        
        // Remove from DOM when hidden
        previewModal.addEventListener('hidden.bs.modal', function() {
            previewModal.remove();
        });
    }
}); 