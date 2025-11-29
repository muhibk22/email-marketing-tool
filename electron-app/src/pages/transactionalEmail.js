import { Sidebar } from '../components/Sidebar.js';
import { RichTextEditor } from '../components/RichTextEditor.js';
import { FormInput } from '../components/FormInput.js';
import { Button } from '../components/Button.js';
import { emailApi } from '../api/email.js';
import { groupsApi } from '../api/groups.js';
import { authState } from '../utils/authState.js';
import { ROUTES } from '../utils/constants.js';
import { initIcons } from '../utils/icons.js';

export const TransactionalEmailPage = {
    render: () => {
        return `
            ${Sidebar.render()}
            <div class="main-content">
                <div class="page-header">
                    <h1 class="page-title">
                        <i data-lucide="zap"></i>
                        Transactional Email
                    </h1>
                    <p class="page-subtitle">Send individual transactional emails</p>
                </div>

                <div class="transactional-email-container">
                    <form id="transactional-email-form" class="form">
                        ${FormInput({
            id: 'email-subject',
            label: 'Email Subject',
            type: 'text',
            placeholder: 'Enter email subject',
            required: true
        })}

                        <div class="form-group">
                            <label class="form-label">Email Body</label>
                            ${RichTextEditor.render('email-body', 'Compose your email here...')}
                        </div>

                        <div class="form-group">
                            <label class="form-label">Recipients</label>
                            <div class="recipient-options">
                                <label class="radio-label">
                                    <input type="radio" name="recipient-type" value="campaigns" checked>
                                    <span>Send to Groups</span>
                                </label>
                                <label class="radio-label">
                                    <input type="radio" name="recipient-type" value="all">
                                    <span>Send to All</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group" id="campaign-selector-group">
                            <label class="form-label">Select Groups</label>
                            <select id="group-select" class="form-select" multiple size="5">
                                <option value="">Loading groups...</option>
                            </select>
                            <p class="form-hint">Hold Ctrl/Cmd to select multiple groups</p>
                        </div>

                        <div class="form-actions">
                            ${Button({
            id: 'send-email-btn',
            text: 'Send Email',
            type: 'submit',
            className: 'btn btn-primary btn-lg'
        })}
                        </div>
                    </form>

                    <div id="send-results" class="send-results" style="display: none;">
                        <h3>Send Results</h3>
                        <div id="results-content"></div>
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

        // Setup rich text editor
        RichTextEditor.setup('email-body');

        // Initialize icons
        initIcons();

        // Load groups
        await TransactionalEmailPage.loadGroups();

        // Setup recipient type toggle
        const radioButtons = document.querySelectorAll('input[name="recipient-type"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                const groupSelectorDiv = document.getElementById('campaign-selector-group');
                if (radio.value === 'campaigns') {
                    groupSelectorDiv.style.display = 'block';
                } else {
                    groupSelectorDiv.style.display = 'none';
                }
            });
        });

        // Setup form submission
        document.getElementById('transactional-email-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await TransactionalEmailPage.handleSendEmail();
        });
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

    async handleSendEmail() {
        const subject = document.getElementById('email-subject').value.trim();
        const body = RichTextEditor.getHTML('email-body');
        const recipientType = document.querySelector('input[name="recipient-type"]:checked').value;
        const groupSelect = document.getElementById('group-select');
        const selectedGroups = Array.from(groupSelect.selectedOptions).map(opt => opt.value);

        // Validation
        if (!subject) {
            alert('Please enter an email subject');
            return;
        }

        if (!body || body.trim() === '') {
            alert('Please compose an email body');
            return;
        }

        if (recipientType === 'campaigns' && selectedGroups.length === 0) {
            alert('Please select at least one group');
            return;
        }

        const sendBtn = document.getElementById('send-email-btn');
        const resultsDiv = document.getElementById('send-results');
        const resultsContent = document.getElementById('results-content');

        try {
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';

            resultsDiv.style.display = 'block';
            resultsContent.innerHTML = '<div class="loading">Sending email...</div>';

            // Build email data using the correct API schema
            let emailData = { subject, body };

            if (recipientType === 'campaigns') {
                emailData.group_ids = selectedGroups;
            } else {
                emailData.send_to_all = true;
            }

            const result = await emailApi.sendEmail(emailData);

            resultsContent.innerHTML = `
                <div class="success-message">
                    <div class="success-icon"><i data-lucide="check-circle"></i></div>
                    <h4>Email sent successfully!</h4>
                    <p><strong>${result.recipients.length}</strong> recipient${result.recipients.length !== 1 ? 's' : ''} received the email.</p>
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
            document.getElementById('transactional-email-form').reset();
            RichTextEditor.clear('email-body');

        } catch (error) {
            console.error('Error sending email:', error);
            resultsContent.innerHTML = `
                <div class="error-message">
                    <div class="error-icon"><i data-lucide="x-circle"></i></div>
                    <h4>Failed to send email</h4>
                    <p>${error.message}</p>
                </div>
            `;

            // Re-initialize icons
            initIcons();
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Email';
        }
    }
};
