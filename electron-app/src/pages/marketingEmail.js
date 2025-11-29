import { Sidebar } from '../components/Sidebar.js';
import { RichTextEditor } from '../components/RichTextEditor.js';
import { FormInput } from '../components/FormInput.js';
import { Button } from '../components/Button.js';
import { groupsApi } from '../api/groups.js';
import { authState } from '../utils/authState.js';
import { ROUTES, API_ENDPOINTS } from '../utils/constants.js';
import { API_BASE_URL } from '../config/config.js';
import { initIcons } from '../utils/icons.js';
import { EMAIL_TEMPLATES } from '../utils/templates.js';

export const MarketingEmailPage = {
    render: () => {
        return `
            ${Sidebar.render()}
            <div class="main-content">
                <div class="page-header">
                    <h1 class="page-title">
                        <i data-lucide="mail"></i>
                        Marketing Email (Newsletter)
                    </h1>
                    <p class="page-subtitle">Send newsletters with inline images to your subscribers</p>
                </div>

                <div class="marketing-email-layout">
                    <div class="marketing-email-editor">
                        <form id="marketing-email-form" class="form">
                            ${FormInput({
            id: 'email-subject',
            label: 'Email Subject',
            type: 'text',
            placeholder: 'Enter newsletter subject',
            required: true
        })}

                        ${FormInput({
            id: 'email-heading',
            label: 'Email Heading (Optional)',
            type: 'text',
            placeholder: 'e.g. 📢 New Update',
            required: false
        })}

                            <div class="form-group">
                                <label class="form-label">Email Template</label>
                                <div class="template-selector">
                                    <select id="email-template" class="form-select">
                                        ${Object.entries(EMAIL_TEMPLATES).map(([key, template]) => `
                                            <option value="${key}">${template.name}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Email Body</label>
                                ${RichTextEditor.render('email-body', 'Compose your newsletter here...')}
                            </div>

                            <div class="form-group">
                                <label class="form-label">Recipients</label>
                                <div class="recipient-options">
                                    <label class="radio-label">
                                        <input type="radio" name="recipient-type" value="campaigns" checked>
                                        <span>Send to Campaigns</span>
                                    </label>
                                    <label class="radio-label">
                                        <input type="radio" name="recipient-type" value="all">
                                        <span>Send to All Subscribers</span>
                                    </label>
                                </div>
                            </div>

                            <div class="form-group" id="campaign-selector-group">
                                <label class="form-label">Select Campaigns</label>
                                <select id="campaign-select" class="form-select" multiple size="5">
                                    <option value="">Loading campaigns...</option>
                                </select>
                                <p class="form-hint">Hold Ctrl/Cmd to select multiple campaigns</p>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Inline Images (Optional)</label>
                                <p class="form-hint">Add images that will be displayed in your newsletter</p>
                                <input type="file" id="inline-images" class="form-input" multiple accept="image/*">
                                <div id="image-preview" class="image-preview-container"></div>
                            </div>

                            <div class="form-actions">
                                ${Button({
            id: 'send-newsletter-btn',
            text: 'Send Newsletter',
            type: 'submit',
            className: 'btn btn-primary btn-lg'
        })}
                            </div>
                        </form>
                    </div>

                    <div class="marketing-email-preview">
                        <div class="preview-header">
                            <h3><i data-lucide="eye"></i> Live Preview</h3>
                        </div>
                        <div class="preview-frame-container">
                            <iframe id="email-preview-frame" title="Email Preview"></iframe>
                        </div>
                    </div>
                </div>

                <div id="send-results" class="send-results" style="display: none;">
                    <h3>Send Results</h3>
                    <div id="results-content"></div>
                </div>
            </div>
        `;
    },

    afterRender: async () => {
        Sidebar.afterRender(() => {
            authState.clearAuth();
            window.router.navigate(ROUTES.LOGIN);
        });

        // Setup rich text editor
        RichTextEditor.setup('email-body');

        // Initialize icons
        initIcons();

        // Load campaigns
        await MarketingEmailPage.loadCampaigns();

        // Setup recipient type toggle
        const radioButtons = document.querySelectorAll('input[name="recipient-type"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                const campaignGroup = document.getElementById('campaign-selector-group');
                if (radio.value === 'campaigns') {
                    campaignGroup.style.display = 'block';
                } else {
                    campaignGroup.style.display = 'none';
                }
            });
        });

        // Setup image preview
        const imageInput = document.getElementById('inline-images');
        imageInput.addEventListener('change', (e) => {
            MarketingEmailPage.previewImages(e.target.files);
        });

        // Setup form submission
        document.getElementById('marketing-email-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await MarketingEmailPage.handleSendNewsletter();
        });

        // Setup live preview listeners
        const editor = document.getElementById('email-body');
        const templateSelect = document.getElementById('email-template');
        const headingInput = document.getElementById('email-heading');
        const imageInputForPreview = document.getElementById('inline-images');

        const updatePreview = () => {
            MarketingEmailPage.updatePreview();
        };

        if (editor) {
            editor.addEventListener('input', updatePreview);
            editor.addEventListener('blur', updatePreview);
        }

        if (templateSelect) {
            templateSelect.addEventListener('change', updatePreview);
        }

        if (headingInput) {
            headingInput.addEventListener('input', updatePreview);
        }

        if (imageInputForPreview) {
            imageInputForPreview.addEventListener('change', updatePreview);
        }

        // Initial preview
        updatePreview();
    },

    async updatePreview() {
        const frame = document.getElementById('email-preview-frame');
        if (!frame) return;

        const editorContent = RichTextEditor.getHTML('email-body');
        const templateKey = document.getElementById('email-template')?.value || 'modern';
        const heading = document.getElementById('email-heading')?.value;

        // Use the selected template to generate HTML
        // If content is empty, show some placeholder text in preview
        const contentToRender = editorContent && editorContent.trim() !== ''
            ? editorContent
            : '<p style="color:#999;text-align:center;font-style:italic;">Start typing to see preview...</p>';

        let fullHtml = EMAIL_TEMPLATES[templateKey].render(contentToRender, heading || undefined);

        // Handle inline images for preview
        const imageInput = document.getElementById('inline-images');
        if (imageInput && imageInput.files && imageInput.files.length > 0) {
            const files = Array.from(imageInput.files);
            let imageRows = '';

            // Process files to Data URIs
            const readFile = (file) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            };

            for (const file of files) {
                const dataUri = await readFile(file);
                imageRows += `
                <tr>
                    <td style="padding: 20px 0;">
                        <img src="${dataUri}" width="100%" style="display:block;border-radius:12px;margin-top:20px;" />
                    </td>
                </tr>
                `;
            }

            // Inject images into placeholder
            if (fullHtml.includes('<!-- INLINE_IMAGES_PLACEHOLDER -->')) {
                fullHtml = fullHtml.replace('<!-- INLINE_IMAGES_PLACEHOLDER -->', imageRows);
            } else {
                fullHtml += imageRows;
            }
        }

        // Write to iframe
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.open();
        doc.write(fullHtml);
        doc.close();
    },

    async loadCampaigns() {
        const select = document.getElementById('campaign-select');
        if (!select) return;

        try {
            const groups = await groupsApi.getGroups();

            if (groups.length === 0) {
                select.innerHTML = '<option value="">No campaigns available</option>';
                return;
            }

            select.innerHTML = groups.map(group => {
                const count = group.contact_ids ? group.contact_ids.length : 0;
                return `<option value="${group.id}">${group.group_name} (${count} subscribers)</option>`;
            }).join('');
        } catch (error) {
            console.error('Error loading campaigns:', error);
            select.innerHTML = '<option value="">Failed to load campaigns</option>';
        }
    },

    previewImages(files) {
        const previewContainer = document.getElementById('image-preview');
        if (!previewContainer) return;

        previewContainer.innerHTML = '';

        if (files.length === 0) return;

        previewContainer.innerHTML = '<p class="form-hint">Selected Images:</p>';

        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview-item';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <p>${file.name} (${(file.size / 1024).toFixed(2)} KB)</p>
                `;
                previewContainer.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    },

    async handleSendNewsletter() {
        const subject = document.getElementById('email-subject').value.trim();
        const editorContent = RichTextEditor.getHTML('email-body');
        const templateKey = document.getElementById('email-template').value;
        const recipientType = document.querySelector('input[name="recipient-type"]:checked').value;
        const campaignSelect = document.getElementById('campaign-select');
        const selectedCampaigns = Array.from(campaignSelect.selectedOptions).map(opt => opt.value);
        const imageFiles = document.getElementById('inline-images').files;

        // Validation
        if (!subject) {
            alert('Please enter an email subject');
            return;
        }

        if (!editorContent || editorContent.trim() === '') {
            alert('Please compose your newsletter');
            return;
        }

        if (recipientType === 'campaigns' && selectedCampaigns.length === 0) {
            alert('Please select at least one campaign');
            return;
        }

        const sendBtn = document.getElementById('send-newsletter-btn');
        const resultsDiv = document.getElementById('send-results');
        const resultsContent = document.getElementById('results-content');

        try {
            sendBtn.disabled = true;
            sendBtn.textContent = '📤 Sending Newsletter...';

            resultsDiv.style.display = 'block';
            resultsContent.innerHTML = '<div class="loading">Sending newsletter...</div>';

            // Build FormData for multipart/form-data
            const formData = new FormData();
            formData.append('subject', subject);

            // Generate full HTML using selected template
            const heading = document.getElementById('email-heading')?.value;
            const fullHtml = EMAIL_TEMPLATES[templateKey].render(editorContent, heading || undefined);
            formData.append('body', fullHtml);

            if (recipientType === 'campaigns') {
                formData.append('group_ids', selectedCampaigns.join(','));
            } else {
                formData.append('send_to_all', 'true');
            }

            // Add inline images
            if (imageFiles.length > 0) {
                Array.from(imageFiles).forEach(file => {
                    formData.append('inline_images', file);
                });
            }

            // Send newsletter using fetch directly since it's FormData
            const authHeader = authState.getAuthHeader();
            const response = await fetch(`${API_BASE_URL}/email/send/newsletter`, {
                method: 'POST',
                headers: authHeader,
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'Failed to send newsletter');
            }

            resultsContent.innerHTML = `
                <div class="success-message">
                    <div class="success-icon"><i data-lucide="check-circle"></i></div>
                    <h4>Newsletter sent successfully!</h4>
                    <p><strong>${result.recipients.length}</strong> subscriber${result.recipients.length !== 1 ? 's' : ''} received your newsletter.</p>
                    ${result.inline_images && result.inline_images.length > 0 ? `
                        <p><i data-lucide="image"></i> Included ${result.inline_images.length} image${result.inline_images.length !== 1 ? 's' : ''}</p>
                    ` : ''}
                    <div class="recipients-list">
                        <details>
                            <summary>View recipients</summary>
                            <ul>
                                ${result.recipients.map(email => `<li>${email}</li>`).join('')}
                            </ul>
                        </details>
                    </div>
                </div>
            `;

            // Re-initialize icons
            initIcons();

            // Clear form
            document.getElementById('marketing-email-form').reset();
            RichTextEditor.clear('email-body');
            document.getElementById('image-preview').innerHTML = '';

        } catch (error) {
            console.error('Error sending newsletter:', error);
            resultsContent.innerHTML = `
                <div class="error-message">
                    <div class="error-icon"><i data-lucide="x-circle"></i></div>
                    <h4>Failed to send newsletter</h4>
                    <p>${error.message}</p>
                </div>
            `;

            // Re-initialize icons
            initIcons();
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = '📬 Send Newsletter';
        }
    }
};
