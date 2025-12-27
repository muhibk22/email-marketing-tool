import { Sidebar } from '../components/Sidebar.js';
import { FormInput } from '../components/FormInput.js';
import { Button } from '../components/Button.js';
import { aiEmailApi } from '../api/aiEmail.js';
import { emailApi } from '../api/email.js';
import { groupsApi } from '../api/groups.js';
import { authState } from '../utils/authState.js';
import { ROUTES, API_ENDPOINTS } from '../utils/constants.js';
import { API_BASE_URL } from '../config/config.js';

export const AIGeneratorPage = {
    render: () => {
        return `
            ${Sidebar.render()}
            <div class="main-content">
                <div class="page-header">
                    <h1 class="page-title">🤖 AI Email Generator</h1>
                    <p class="page-subtitle">Generate professional emails instantly using AI</p>
                </div>

                <div class="ai-generator-layout">
                    <!-- Left Column: Input Form -->
                    <div class="ai-input-column">
                        <div class="card">
                            <h2 class="section-title">Generation Settings</h2>
                            <form id="ai-generator-form" class="form">
                                ${FormInput({
            id: 'subject-hint',
            label: 'Subject Hint',
            type: 'text',
            placeholder: 'e.g., Monthly Newsletter, Product Launch'
        })}

                                <div class="form-group">
                                    <label class="form-label">Tone</label>
                                    <select id="email-tone" class="form-select">
                                        <option value="professional" selected>Professional</option>
                                        <option value="friendly">Friendly</option>
                                        <option value="witty">Witty</option>
                                        <option value="persuasive">Persuasive</option>
                                    </select>
                                </div>

                                ${FormInput({
            id: 'target-audience',
            label: 'Target Audience',
            type: 'text',
            placeholder: 'e.g., Existing customers, New leads'
        })}

                                <div class="form-group">
                                    <label class="form-label">Key Points (Optional)</label>
                                    <textarea id="key-points" class="form-input" rows="6" placeholder="Enter key points to cover, one per line"></textarea>
                                </div>

                                <div class="form-actions">
                                    ${Button({
            id: 'generate-btn',
            text: '✨ Generate Email',
            type: 'submit',
            className: 'btn btn-primary btn-lg btn-block'
        })}
                                </div>
                            </form>
                        </div>
                        
                        <!-- Send Options Card -->
                        <div class="card" id="send-options-card" style="margin-top: var(--spacing-lg); display: none;">
                            <h2 class="section-title">Send Email</h2>
                            <form id="send-email-form" class="form">
                                <div class="form-group">
                                    <label class="form-label">Email Type</label>
                                    <select id="email-type" class="form-select">
                                        <option value="marketing">Marketing Email (Newsletter)</option>
                                        <option value="transactional">Transactional Email</option>
                                    </select>
                                </div>

                                <div class="form-group" id="image-upload-group">
                                    <label class="form-label">Inline Images (Drag into email)</label>
                                    <input type="file" id="inline-images" class="form-input" multiple accept="image/*">
                                    <div id="image-preview" class="image-preview-container"></div>
                                </div>

                                <div class="form-group" id="attachment-upload-group" style="display: none;">
                                    <label class="form-label">Attachments</label>
                                    <input type="file" id="email-attachments" class="form-input" multiple>
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Recipients</label>
                                    <div class="recipient-options">
                                        <label class="radio-label">
                                            <input type="radio" name="recipient-type" value="groups" checked>
                                            <span>Send to Groups</span>
                                        </label>
                                        <label class="radio-label">
                                            <input type="radio" name="recipient-type" value="all">
                                            <span>Send to All</span>
                                        </label>
                                    </div>
                                </div>

                                <div class="form-group" id="group-selector-group">
                                    <label class="form-label">Select Groups</label>
                                    <select id="group-select" class="form-select" multiple size="4">
                                        <option value="">Loading...</option>
                                    </select>
                                    <p class="form-hint">Hold Ctrl/Cmd to select multiple</p>
                                </div>

                                <div class="form-actions">
                                    ${Button({
            id: 'send-email-btn',
            text: '📤 Send Email',
            type: 'submit',
            className: 'btn btn-primary btn-lg btn-block'
        })}
                                </div>
                            </form>
                            
                            <div id="send-results" class="send-results" style="display: none; margin-top: var(--spacing-md);">
                                <div id="results-content"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Live Preview -->
                    <div class="ai-preview-column">
                        <div id="generation-result" class="generation-result">
                            <h2 class="section-title">Live Preview & Edit</h2>
                            
                            <div class="preview-card">
                                <div class="preview-header">
                                    <span class="preview-label">Subject:</span>
                                    <div id="preview-subject" class="preview-subject-text editable-field" contenteditable="true" spellcheck="false">Click "Generate Email" to create your email</div>
                                </div>
                                <div class="preview-body">
                                    <span class="preview-label">Body:</span>
                                    <div id="preview-content" class="email-content-preview editable-field" contenteditable="true">
                                        <p style="color: #999; font-style: italic;">Your generated email will appear here. You can edit it after generation.</p>
                                    </div>
                                </div>
                                <div class="preview-actions">
                                    <button id="copy-btn" class="btn btn-secondary btn-sm">📋 Copy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender: async () => {
        Sidebar.afterRender(() => {
            authState.clearAuth();
            window.router.navigate(ROUTES.LOGIN);
        });

        // Initialize Event Listeners
        AIGeneratorPage.initFormListeners();
        AIGeneratorPage.initCopyButton();
        AIGeneratorPage.initEmailTypeListeners();
        AIGeneratorPage.initImageUploadListeners();

        // Load initial data
        await AIGeneratorPage.loadGroups();
    },

    initFormListeners() {
        const form = document.getElementById('ai-generator-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AIGeneratorPage.handleGenerate();
            });
        }

        const sendForm = document.getElementById('send-email-form');
        if (sendForm) {
            sendForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await AIGeneratorPage.handleSendEmail();
            });
        }
    },

    initCopyButton() {
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const subject = document.getElementById('preview-subject').innerText;
                const body = document.getElementById('preview-content').innerHTML;

                const fullEmail = `Subject: ${subject}\n\n${body}`;
                navigator.clipboard.writeText(fullEmail).then(() => {
                    const originalText = copyBtn.innerText;
                    copyBtn.innerText = '✅ Copied!';
                    setTimeout(() => copyBtn.innerText = originalText, 2000);
                });
            });
        }
    },

    initEmailTypeListeners() {
        // Email type change handler
        const emailType = document.getElementById('email-type');
        const imageUploadGroup = document.getElementById('image-upload-group');
        const attachmentUploadGroup = document.getElementById('attachment-upload-group');

        if (emailType && imageUploadGroup && attachmentUploadGroup) {
            emailType.addEventListener('change', () => {
                if (emailType.value === 'marketing') {
                    imageUploadGroup.style.display = 'block';
                    attachmentUploadGroup.style.display = 'none';
                } else {
                    imageUploadGroup.style.display = 'none';
                    attachmentUploadGroup.style.display = 'block';
                }
            });
        }

        // Recipient type toggle
        const radioButtons = document.querySelectorAll('input[name="recipient-type"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                const groupSelectorDiv = document.getElementById('group-selector-group');
                if (radio.value === 'groups') {
                    groupSelectorDiv.style.display = 'block';
                } else {
                    groupSelectorDiv.style.display = 'none';
                }
            });
        });
    },

    initImageUploadListeners() {
        const imageInput = document.getElementById('inline-images');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                AIGeneratorPage.previewImages(e.target.files);
            });
        }

        // Initialize drop zone once
        AIGeneratorPage.setupDropZone();
    },

    async loadGroups() {
        const select = document.getElementById('group-select');
        if (!select) return;

        try {
            const groups = await groupsApi.getGroups();

            if (groups.length === 0) {
                select.innerHTML = '<option value="">No groups available</option>';
                return;
            }

            select.innerHTML = groups.map(group => {
                const count = group.contact_ids ? group.contact_ids.length : 0;
                return `<option value="${group.id}">${group.group_name} (${count} recipients)</option>`;
            }).join('');
        } catch (error) {
            console.error('Error loading groups:', error);
            select.innerHTML = '<option value="">Failed to load groups</option>';
        }
    },

    previewImages(files) {
        const previewContainer = document.getElementById('image-preview');
        if (!previewContainer) return;

        previewContainer.innerHTML = '';
        if (files.length === 0) return;

        previewContainer.innerHTML = '<p class="form-hint">📌 Drag images below into the email body:</p>';

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview-item draggable-image';
                preview.draggable = true;
                preview.dataset.imageUrl = e.target.result;
                preview.dataset.fileName = file.name;

                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <p>${file.name}</p>
                `;

                // Add drag event handlers
                preview.addEventListener('dragstart', (evt) => {
                    // We use a special attribute data-filename to identify the image later
                    const imgHtml = `<img src="${e.target.result}" alt="${file.name}" data-filename="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;">`;
                    evt.dataTransfer.setData('text/html', imgHtml);
                    evt.dataTransfer.effectAllowed = 'copy';
                    preview.style.opacity = '0.5';
                });

                preview.addEventListener('dragend', (evt) => {
                    preview.style.opacity = '1';
                });

                previewContainer.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    },

    setupDropZone() {
        const previewContent = document.getElementById('preview-content');
        if (!previewContent) return;

        // Remove existing listeners to prevent duplicates (cloning replaces the element)
        const newPreviewContent = previewContent.cloneNode(true);
        previewContent.parentNode.replaceChild(newPreviewContent, previewContent);

        // Re-assign for clarity
        const contentDiv = newPreviewContent;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            contentDiv.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Add visual feedback
        contentDiv.addEventListener('dragenter', () => {
            contentDiv.classList.add('drag-over');
        });

        contentDiv.addEventListener('dragleave', (e) => {
            if (e.target === contentDiv) {
                contentDiv.classList.remove('drag-over');
            }
        });

        contentDiv.addEventListener('drop', (e) => {
            contentDiv.classList.remove('drag-over');

            const htmlData = e.dataTransfer.getData('text/html');
            if (!htmlData) return;

            // Get the drop position from the mouse coordinates
            let range;

            // Use caretRangeFromPoint for precise positioning
            if (document.caretRangeFromPoint) {
                range = document.caretRangeFromPoint(e.clientX, e.clientY);
            } else if (document.caretPositionFromPoint) {
                // Firefox support
                const position = document.caretPositionFromPoint(e.clientX, e.clientY);
                range = document.createRange();
                range.setStart(position.offsetNode, position.offset);
            }

            if (range && contentDiv.contains(range.commonAncestorContainer)) {
                // Insert image at the exact drop position
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlData;
                const img = tempDiv.firstChild;

                // Insert at the drop position
                range.insertNode(img);

                // Add a space after the image for easier editing
                const space = document.createTextNode(' ');
                range.setStartAfter(img);
                range.insertNode(space);

                // Move cursor after the space
                range.setStartAfter(space);
                range.collapse(true);

                // Update selection
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                // Fallback: append at end if drop position couldn't be determined
                contentDiv.insertAdjacentHTML('beforeend', htmlData);
            }
        });
    },

    async handleGenerate() {
        const subjectHint = document.getElementById('subject-hint').value.trim();
        const tone = document.getElementById('email-tone').value;
        const audience = document.getElementById('target-audience').value.trim();
        const keyPointsText = document.getElementById('key-points').value.trim();

        const keyPoints = keyPointsText ? keyPointsText.split('\n').filter(line => line.trim() !== '') : [];

        const generateBtn = document.getElementById('generate-btn');
        const sendOptionsCard = document.getElementById('send-options-card');
        const previewSubject = document.getElementById('preview-subject');
        const previewContent = document.getElementById('preview-content');

        try {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<span class="spinner"></span> Generating...';

            const response = await aiEmailApi.generateEmail({
                subject_hint: subjectHint || null,
                tone: tone,
                audience: audience || null,
                key_points: keyPoints
            });

            // Backend returns clean JSON
            const cleanSubject = response.subject.trim();
            const cleanBody = response.body.trim();

            // Update preview
            previewSubject.innerText = cleanSubject;
            previewContent.innerHTML = cleanBody;

            // Show send options
            sendOptionsCard.style.display = 'block';

            // Re-initialize drop zone for new content
            AIGeneratorPage.setupDropZone();

        } catch (error) {
            console.error('Generation error:', error);
            alert('Failed to generate email: ' + error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = '✨ Generate Email';
        }
    },

    async handleSendEmail() {
        const emailType = document.getElementById('email-type').value;
        const subject = document.getElementById('preview-subject').innerText.trim();
        let body = document.getElementById('preview-content').innerHTML.trim();
        const recipientType = document.querySelector('input[name="recipient-type"]:checked').value;
        const groupSelect = document.getElementById('group-select');
        const selectedGroups = Array.from(groupSelect.selectedOptions).map(opt => opt.value);
        const imageFiles = document.getElementById('inline-images').files;

        // Validation
        if (!subject || subject === 'Click "Generate Email" to create your email') {
            alert('Please generate an email first');
            return;
        }

        if (recipientType === 'groups' && selectedGroups.length === 0) {
            alert('Please select at least one group');
            return;
        }

        const sendBtn = document.getElementById('send-email-btn');
        const resultsDiv = document.getElementById('send-results');
        const resultsContent = document.getElementById('results-content');

        try {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<span class="spinner"></span> Sending...';

            resultsDiv.style.display = 'block';
            resultsContent.innerHTML = '<div class="loading">Sending email...</div>';

            let result;

            if (emailType === 'marketing') {
                // Use marketing endpoint with FormData
                const formData = new FormData();
                formData.append('subject', subject);

                // Process body to replace base64 images with CID references
                if (imageFiles.length > 0) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = body;
                    const images = tempDiv.getElementsByTagName('img');

                    Array.from(images).forEach(img => {
                        const filename = img.getAttribute('data-filename') || img.alt;
                        if (filename) {
                            // Backend replaces spaces with underscores for CID
                            const cid = filename.replace(/ /g, '_');
                            img.src = `cid:${cid}`;
                            // Remove base64 data to reduce size
                            img.removeAttribute('data-filename');
                        }
                    });
                    body = tempDiv.innerHTML;
                }

                formData.append('body', body);

                if (recipientType === 'groups') {
                    formData.append('group_ids', selectedGroups.join(','));
                } else {
                    formData.append('send_to_all', 'true');
                }

                // Add images
                if (imageFiles.length > 0) {
                    Array.from(imageFiles).forEach(file => {
                        formData.append('inline_images', file);
                    });
                }

                const authHeader = authState.getAuthHeader();
                const response = await fetch(`${API_BASE_URL}/email/send/newsletter`, {
                    method: 'POST',
                    headers: authHeader,
                    body: formData
                });

                result = await response.json();
                if (!response.ok) throw new Error(result.detail || 'Failed to send');

            } else {
                // Use transactional endpoint
                const formData = new FormData();
                formData.append('subject', subject);
                formData.append('body', body);

                if (recipientType === 'groups') {
                    formData.append('group_ids', selectedGroups.join(','));
                } else {
                    formData.append('send_to_all', 'true');
                }

                // Add attachments
                const attachmentFiles = document.getElementById('email-attachments').files;
                if (attachmentFiles.length > 0) {
                    Array.from(attachmentFiles).forEach(file => {
                        formData.append('attachments', file);
                    });
                }

                result = await emailApi.sendTransactionalEmail(formData);
            }

            resultsContent.innerHTML = `
                <div class="success-message">
                    <div class="success-icon">✅</div>
                    <h4>Email sent successfully!</h4>
                    <p><strong>${result.recipients.length}</strong> recipient${result.recipients.length !== 1 ? 's' : ''}</p>
                </div>
            `;

        } catch (error) {
            console.error('Send error:', error);
            resultsContent.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">❌</div>
                    <h4>Failed to send email</h4>
                    <p>${error.message}</p>
                </div>
            `;
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = '📤 Send Email';
        }
    }
};
