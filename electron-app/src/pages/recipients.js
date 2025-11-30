import { Sidebar } from '../components/Sidebar.js';
import { Table } from '../components/Table.js';
import { Modal } from '../components/Modal.js';
import { FormInput } from '../components/FormInput.js';
import { Button } from '../components/Button.js';
import { contactsApi } from '../api/contacts.js';
import { groupsApi } from '../api/groups.js';
import { authState } from '../utils/authState.js';
import { ROUTES } from '../utils/constants.js';
import { initIcons } from '../utils/icons.js';

export const RecipientsPage = {
    render: () => {
        return `
            ${Sidebar.render()}
            <div class="main-content">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Recipients</h1>
                        <p class="page-subtitle">Manage your email contacts</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-secondary" id="import-recipient-btn" style="margin-right: 10px;">
                            <i data-lucide="upload"></i> Import CSV/TXT
                        </button>
                        <button class="btn btn-primary" id="add-recipient-btn">
                            <i data-lucide="plus"></i> Add Recipient
                        </button>
                    </div>
                </div>

                <div class="search-bar">
                    <input type="text" id="search-recipients" class="search-input" placeholder="Search recipients...">
                </div>

                <div id="recipients-table">
                    <div class="loading">Loading recipients...</div>
                </div>

                ${Modal.render({
            id: 'add-recipient-modal',
            title: 'Add New Recipient',
            children: `
                        <form id="add-recipient-form" class="form">
                            ${FormInput({
                id: 'recipient-name',
                label: 'Name',
                type: 'text',
                placeholder: 'Enter recipient name',
                required: true
            })}
                            ${FormInput({
                id: 'recipient-email',
                label: 'Email',
                type: 'email',
                placeholder: 'Enter email address',
                required: true
            })}
                            <div class="form-actions">
                                ${Button({
                id: 'cancel-add-recipient',
                text: 'Cancel',
                type: 'button',
                className: 'btn btn-secondary'
            })}
                                ${Button({
                id: 'submit-add-recipient',
                text: 'Add Recipient',
                type: 'submit',
                className: 'btn btn-primary'
            })}
                            </div>
                        </form>
                    `
        })}

                ${Modal.render({
            id: 'edit-recipient-modal',
            title: 'Edit Recipient',
            children: `
                        <form id="edit-recipient-form" class="form">
                            <input type="hidden" id="edit-recipient-id">
                            ${FormInput({
                id: 'edit-recipient-name',
                label: 'Name',
                type: 'text',
                placeholder: 'Enter recipient name',
                required: true
            })}
                            ${FormInput({
                id: 'edit-recipient-email',
                label: 'Email',
                type: 'email',
                placeholder: 'Enter email address',
                required: true
            })}
                            <div class="form-actions">
                                ${Button({
                id: 'cancel-edit-recipient',
                text: 'Cancel',
                type: 'button',
                className: 'btn btn-secondary'
            })}
                                ${Button({
                id: 'submit-edit-recipient',
                text: 'Update Recipient',
                type: 'submit',
                className: 'btn btn-primary'
            })}
                            </div>
                        </form>
                    `
        })}

                ${Modal.render({
            id: 'import-recipient-modal',
            title: 'Import Recipients',
            children: `
                        <form id="import-recipient-form" class="form">
                            <div class="form-group">
                                <label class="form-label">Select File (CSV or TXT)</label>
                                <input type="file" id="import-file" class="form-input" accept=".csv,.txt" required>
                                <p class="form-hint">CSV format: email,name OR just email column. TXT: one email per line.</p>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Add to Campaign (Optional)</label>
                                <select id="import-campaign-select" class="form-select">
                                    <option value="">Select a campaign...</option>
                                </select>
                            </div>

                            <div class="form-actions">
                                ${Button({
                id: 'cancel-import-recipient',
                text: 'Cancel',
                type: 'button',
                className: 'btn btn-secondary'
            })}
                                ${Button({
                id: 'submit-import-recipient',
                text: 'Import',
                type: 'submit',
                className: 'btn btn-primary'
            })}
                            </div>
                        </form>
                    `
        })}

                ${Modal.render({
            id: 'import-preview-modal',
            title: 'Confirm Import',
            children: `
                        <div id="import-preview-content">
                            <p class="mb-4">Found <strong id="preview-count">0</strong> contacts. Here is a preview:</p>
                            <div class="table-container" style="max-height: 300px; overflow-y: auto; margin-bottom: 1rem;">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody id="preview-table-body">
                                        <!-- Preview rows -->
                                    </tbody>
                                </table>
                            </div>
                            <div class="form-actions">
                                ${Button({
                id: 'cancel-preview-import',
                text: 'Cancel',
                type: 'button',
                className: 'btn btn-secondary'
            })}
                                ${Button({
                id: 'confirm-import-btn',
                text: 'Proceed & Import',
                type: 'button',
                className: 'btn btn-primary'
            })}
                            </div>
                        </div>
                    `
        })}
            </div>
    `;
    },

    afterRender: async () => {
        // Setup sidebar
        Sidebar.afterRender(() => {
            authState.clearAuth();
            window.router.navigate(ROUTES.LOGIN);
        });

        // Setup modals
        Modal.setupCloseHandlers('add-recipient-modal');
        Modal.setupCloseHandlers('edit-recipient-modal');
        Modal.setupCloseHandlers('import-recipient-modal');
        Modal.setupCloseHandlers('import-preview-modal');

        // Initialize icons
        initIcons();

        // Load recipients
        await RecipientsPage.loadRecipients();

        // Setup add button
        document.getElementById('add-recipient-btn')?.addEventListener('click', () => {
            Modal.show('add-recipient-modal');
        });

        document.getElementById('import-recipient-btn')?.addEventListener('click', async () => {
            Modal.show('import-recipient-modal');
            await RecipientsPage.loadCampaignsForImport();
        });

        // Setup cancel buttons
        document.getElementById('cancel-add-recipient')?.addEventListener('click', () => {
            Modal.hide('add-recipient-modal');
        });
        document.getElementById('cancel-edit-recipient')?.addEventListener('click', () => {
            Modal.hide('edit-recipient-modal');
        });
        document.getElementById('cancel-import-recipient')?.addEventListener('click', () => {
            Modal.hide('import-recipient-modal');
        });
        document.getElementById('cancel-preview-import')?.addEventListener('click', () => {
            Modal.hide('import-preview-modal');
            Modal.show('import-recipient-modal'); // Go back to selection
        });

        // Setup add form
        document.getElementById('add-recipient-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await RecipientsPage.handleAddRecipient();
        });

        // Setup edit form
        document.getElementById('edit-recipient-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await RecipientsPage.handleEditRecipient();
        });

        // Setup import form
        document.getElementById('import-recipient-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await RecipientsPage.handleParseImport();
        });

        // Setup confirm import
        document.getElementById('confirm-import-btn')?.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent any default form submission
            await RecipientsPage.handleConfirmImport();
        });

        // Setup search
        document.getElementById('search-recipients')?.addEventListener('input', (e) => {
            RecipientsPage.filterRecipients(e.target.value);
        });
    },

    recipients: [],
    parsedContacts: [],
    selectedGroupId: null,

    async loadRecipients() {
        const tableContainer = document.getElementById('recipients-table');
        if (!tableContainer) return;

        try {
            RecipientsPage.recipients = await contactsApi.getContacts();
            RecipientsPage.renderTable();
        } catch (error) {
            console.error('Error loading recipients:', error);
            tableContainer.innerHTML = `<div class="error-message">Failed to load recipients: ${error.message}</div>`;
        }
    },

    renderTable() {
        const tableContainer = document.getElementById('recipients-table');
        if (!tableContainer) return;

        const columns = [
            { key: 'name', label: 'Name' },
            {
                key: 'email',
                label: 'Email',
                render: (email) => `<a href="mailto:${email}" class="email-link">${email}</a>`
            },
            {
                key: 'created_at',
                label: 'Added On',
                render: (date) => date ? new Date(date).toLocaleDateString() : '-'
            }
        ];

        const actions = (recipient) => `
            <button class="btn-icon" data-edit-recipient="${recipient.id}" title="Edit"><i data-lucide="edit"></i></button>
            <button class="btn-icon btn-danger" data-delete-recipient="${recipient.id}" title="Delete"><i data-lucide="trash-2"></i></button>
        `;

        tableContainer.innerHTML = Table({
            columns,
            data: RecipientsPage.recipients,
            actions,
            emptyMessage: 'No recipients found. Click "Add Recipient" to get started.'
        });

        // Re-initialize icons after table render
        initIcons();

        // Setup action buttons
        tableContainer.querySelectorAll('[data-edit-recipient]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-edit-recipient');
                RecipientsPage.showEditModal(id);
            });
        });

        tableContainer.querySelectorAll('[data-delete-recipient]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-delete-recipient');
                await RecipientsPage.handleDeleteRecipient(id);
            });
        });
    },

    filterRecipients(search) {
        const searchLower = search.toLowerCase();
        const filtered = RecipientsPage.recipients.filter(r =>
            r.name.toLowerCase().includes(searchLower) ||
            r.email.toLowerCase().includes(searchLower)
        );

        const tableContainer = document.getElementById('recipients-table');
        if (!tableContainer) return;

        const columns = [
            { key: 'name', label: 'Name' },
            {
                key: 'email',
                label: 'Email',
                render: (email) => `<a href="mailto:${email}" class="email-link">${email}</a>`
            },
            {
                key: 'created_at',
                label: 'Added On',
                render: (date) => date ? new Date(date).toLocaleDateString() : '-'
            }
        ];

        const actions = (recipient) => `
            <button class="btn-icon" data-edit-recipient="${recipient.id}" title="Edit"><i data-lucide="edit"></i></button>
            <button class="btn-icon btn-danger" data-delete-recipient="${recipient.id}" title="Delete"><i data-lucide="trash-2"></i></button>
        `;

        tableContainer.innerHTML = Table({
            columns,
            data: filtered,
            actions,
            emptyMessage: 'No recipients match your search.'
        });

        // Re-initialize icons
        initIcons();

        // Re-setup action buttons
        tableContainer.querySelectorAll('[data-edit-recipient]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-edit-recipient');
                RecipientsPage.showEditModal(id);
            });
        });

        tableContainer.querySelectorAll('[data-delete-recipient]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-delete-recipient');
                await RecipientsPage.handleDeleteRecipient(id);
            });
        });
    },

    async handleAddRecipient() {
        const name = document.getElementById('recipient-name').value.trim();
        const email = document.getElementById('recipient-email').value.trim();

        if (!name || !email) return;

        try {
            await contactsApi.createContact({ name, email });
            Modal.hide('add-recipient-modal');
            document.getElementById('add-recipient-form').reset();
            await RecipientsPage.loadRecipients();
        } catch (error) {
            alert('Failed to add recipient: ' + error.message);
        }
    },

    showEditModal(id) {
        const recipient = RecipientsPage.recipients.find(r => r.id === id);
        if (!recipient) return;

        document.getElementById('edit-recipient-id').value = id;
        document.getElementById('edit-recipient-name').value = recipient.name;
        document.getElementById('edit-recipient-email').value = recipient.email;

        Modal.show('edit-recipient-modal');
    },

    async handleEditRecipient() {
        const id = document.getElementById('edit-recipient-id').value;
        const name = document.getElementById('edit-recipient-name').value.trim();
        const email = document.getElementById('edit-recipient-email').value.trim();

        if (!name || !email) return;

        try {
            await contactsApi.updateContact(id, { name, email });
            Modal.hide('edit-recipient-modal');
            await RecipientsPage.loadRecipients();
        } catch (error) {
            alert('Failed to update recipient: ' + error.message);
        }
    },

    async handleDeleteRecipient(id) {
        if (!confirm('Are you sure you want to delete this recipient?')) return;

        try {
            await contactsApi.deleteContact(id);
            await RecipientsPage.loadRecipients();
        } catch (error) {
            alert('Failed to delete recipient: ' + error.message);
        }
    },

    async loadCampaignsForImport() {
        const select = document.getElementById('import-campaign-select');
        if (!select) return;

        try {
            const campaigns = await groupsApi.getGroups();
            select.innerHTML = '<option value="">Select a campaign...</option>' +
                campaigns.map(c => `<option value="${c.id}">${c.group_name}</option>`).join('');
        } catch (error) {
            console.error('Failed to load campaigns:', error);
            select.innerHTML = '<option value="">Error loading campaigns</option>';
        }
    },

    async handleParseImport() {
        const fileInput = document.getElementById('import-file');
        const campaignSelect = document.getElementById('import-campaign-select');

        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select a file');
            return;
        }

        const file = fileInput.files[0];
        RecipientsPage.selectedGroupId = campaignSelect.value;
        const submitBtn = document.getElementById('submit-import-recipient');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Parsing...';

            const formData = new FormData();
            formData.append('file', file);

            const result = await contactsApi.parseImportContacts(formData);

            RecipientsPage.parsedContacts = result.contacts;

            // Show preview
            Modal.hide('import-recipient-modal');
            RecipientsPage.showPreviewModal();

        } catch (error) {
            alert('Parse failed: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Import';
        }
    },

    showPreviewModal() {
        const contacts = RecipientsPage.parsedContacts;
        document.getElementById('preview-count').textContent = contacts.length;

        const tbody = document.getElementById('preview-table-body');
        tbody.innerHTML = contacts.slice(0, 10).map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.email}</td>
            </tr>
        `).join('') + (contacts.length > 10 ? `<tr><td colspan="2" style="text-align: center; color: var(--text-muted);">...and ${contacts.length - 10} more</td></tr>` : '');

        Modal.show('import-preview-modal');
    },

    async handleConfirmImport() {
        const btn = document.getElementById('confirm-import-btn');

        try {
            btn.disabled = true;
            btn.textContent = 'Importing...';

            const result = await contactsApi.bulkCreateContacts({
                contacts: RecipientsPage.parsedContacts,
                group_id: RecipientsPage.selectedGroupId
            });

            alert(`Import successful!\nAdded: ${result.added_count}\nTotal Processed: ${result.total_processed}`);

            Modal.hide('import-preview-modal');
            document.getElementById('import-recipient-form').reset();
            RecipientsPage.parsedContacts = [];
            RecipientsPage.selectedGroupId = null;

            await RecipientsPage.loadRecipients();

        } catch (error) {
            alert('Import failed: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Proceed & Import';
        }
    }
};
