import { Sidebar } from '../components/Sidebar.js';
import { Card } from '../components/Card.js';
import { Modal } from '../components/Modal.js';
import { FormInput } from '../components/FormInput.js';
import { Button } from '../components/Button.js';
import { groupsApi } from '../api/groups.js';
import { contactsApi } from '../api/contacts.js';
import { authState } from '../utils/authState.js';
import { ROUTES } from '../utils/constants.js';
import { initIcons } from '../utils/icons.js';

export const CampaignsPage = {
    render: () => {
        return `
            ${Sidebar.render()}
            <div class="main-content">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Campaigns</h1>
                        <p class="page-subtitle">Manage your email campaigns</p>
                    </div>
                    <button class="btn btn-primary" id="create-campaign-btn">
                        <i data-lucide="plus"></i> Create Campaign
                    </button>
                </div>

                <div id="campaigns-container">
                    <div class="loading">Loading campaigns...</div>
                </div>

                ${Modal.render({
            id: 'create-campaign-modal',
            title: 'Create New Campaign',
            children: `
                        <form id="create-campaign-form" class="form">
                            ${FormInput({
                id: 'campaign-name',
                label: 'Campaign Name',
                type: 'text',
                placeholder: 'Enter campaign name',
                required: true
            })}
                            <div class="form-group">
                                <label class="form-label">Select Recipients</label>
                                <div id="recipients-checklist" class="checklist">
                                    <div class="loading">Loading recipients...</div>
                                </div>
                            </div>
                            <div class="form-actions">
                                ${Button({
                id: 'cancel-create-campaign',
                text: 'Cancel',
                type: 'button',
                className: 'btn btn-secondary'
            })}
                                ${Button({
                id: 'submit-create-campaign',
                text: 'Create Campaign',
                type: 'submit',
                className: 'btn btn-primary'
            })}
                            </div>
                        </form>
                    `
        })}

                ${Modal.render({
            id: 'edit-campaign-modal',
            title: 'Edit Campaign',
            children: `
                        <form id="edit-campaign-form" class="form">
                            <input type="hidden" id="edit-campaign-id">
                            ${FormInput({
                id: 'edit-campaign-name',
                label: 'Campaign Name',
                type: 'text',
                placeholder: 'Enter campaign name',
                required: true
            })}
                            <div class="form-group">
                                <label class="form-label">Select Recipients</label>
                                <div id="edit-recipients-checklist" class="checklist">
                                    <div class="loading">Loading recipients...</div>
                                </div>
                            </div>
                            <div class="form-actions">
                                ${Button({
                id: 'cancel-edit-campaign',
                text: 'Cancel',
                type: 'button',
                className: 'btn btn-secondary'
            })}
                                ${Button({
                id: 'submit-edit-campaign',
                text: 'Update Campaign',
                type: 'submit',
                className: 'btn btn-primary'
            })}
                            </div>
                        </form>
                    `
        })}
            </div>
        `;
    },

    afterRender: async () => {
        Sidebar.afterRender(() => {
            authState.clearAuth();
            window.router.navigate(ROUTES.LOGIN);
        });

        Modal.setupCloseHandlers('create-campaign-modal');
        Modal.setupCloseHandlers('edit-campaign-modal');

        // Initialize icons
        initIcons();

        await CampaignsPage.loadCampaigns();

        document.getElementById('create-campaign-btn')?.addEventListener('click', async () => {
            await CampaignsPage.showCreateModal();
        });

        document.getElementById('cancel-create-campaign')?.addEventListener('click', () => {
            Modal.hide('create-campaign-modal');
        });

        document.getElementById('cancel-edit-campaign')?.addEventListener('click', () => {
            Modal.hide('edit-campaign-modal');
        });

        document.getElementById('create-campaign-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await CampaignsPage.handleCreateCampaign();
        });

        document.getElementById('edit-campaign-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await CampaignsPage.handleEditCampaign();
        });
    },

    campaigns: [],
    contacts: [],

    async loadCampaigns() {
        const container = document.getElementById('campaigns-container');
        if (!container) return;

        try {
            [CampaignsPage.campaigns, CampaignsPage.contacts] = await Promise.all([
                groupsApi.getGroups(),
                contactsApi.getContacts()
            ]);

            if (CampaignsPage.campaigns.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon"><i data-lucide="megaphone"></i></div>
                        <h3>No campaigns yet</h3>
                        <p>Create your first campaign to get started</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="campaigns-grid">
                    ${CampaignsPage.campaigns.map(campaign => {
                const recipientCount = campaign.contact_ids ? campaign.contact_ids.length : 0;
                return Card({
                    title: campaign.group_name,
                    subtitle: `${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`,
                    icon: 'megaphone',
                    className: 'campaign-card',
                    children: `
                                <div class="campaign-actions">
                                    <button class="btn btn-sm btn-secondary" data-edit-campaign="${campaign.id}">
                                        <i data-lucide="edit"></i> Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger" data-delete-campaign="${campaign.id}">
                                        <i data-lucide="trash-2"></i> Delete
                                    </button>
                                </div>
                            `
                });
            }).join('')}
                </div>
            `;

            // Re-initialize icons after adding campaigns
            initIcons();

            // Setup action buttons
            container.querySelectorAll('[data-edit-campaign]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-edit-campaign');
                    await CampaignsPage.showEditModal(id);
                });
            });

            container.querySelectorAll('[data-delete-campaign]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-delete-campaign');
                    await CampaignsPage.handleDeleteCampaign(id);
                });
            });
        } catch (error) {
            console.error('Error loading campaigns:', error);
            container.innerHTML = `
                <div class="error-message">Failed to load campaigns: ${error.message}</div>
            `;
        }
    },

    async showCreateModal() {
        const checklist = document.getElementById('recipients-checklist');
        if (checklist) {
            checklist.innerHTML = CampaignsPage.contacts.map(contact => `
                <label class="checkbox-label">
                    <input type="checkbox" name="campaign-recipients" value="${contact.id}">
                    <span>${contact.name} (${contact.email})</span>
                </label>
            `).join('');
        }
        Modal.show('create-campaign-modal');
    },

    async showEditModal(id) {
        const campaign = CampaignsPage.campaigns.find(c => c.id === id);
        if (!campaign) return;

        document.getElementById('edit-campaign-id').value = id;
        document.getElementById('edit-campaign-name').value = campaign.group_name;

        const checklist = document.getElementById('edit-recipients-checklist');
        if (checklist) {
            const selectedIds = campaign.contact_ids || [];
            checklist.innerHTML = CampaignsPage.contacts.map(contact => {
                const isChecked = selectedIds.includes(contact.id);
                return `
                    <label class="checkbox-label">
                        <input type="checkbox" name="edit-campaign-recipients" value="${contact.id}" ${isChecked ? 'checked' : ''}>
                        <span>${contact.name} (${contact.email})</span>
                    </label>
                `;
            }).join('');
        }

        Modal.show('edit-campaign-modal');
    },

    async handleCreateCampaign() {
        const name = document.getElementById('campaign-name').value.trim();
        const checkboxes = document.querySelectorAll('input[name="campaign-recipients"]:checked');
        const contactIds = Array.from(checkboxes).map(cb => cb.value);

        if (!name) {
            alert('Please enter a campaign name');
            return;
        }

        if (contactIds.length === 0) {
            alert('Please select at least one recipient');
            return;
        }

        try {
            await groupsApi.createGroup({
                group_name: name,
                contact_ids: contactIds
            });
            Modal.hide('create-campaign-modal');
            document.getElementById('create-campaign-form').reset();
            await CampaignsPage.loadCampaigns();
        } catch (error) {
            alert('Failed to create campaign: ' + error.message);
        }
    },

    async handleEditCampaign() {
        const id = document.getElementById('edit-campaign-id').value;
        const name = document.getElementById('edit-campaign-name').value.trim();
        const checkboxes = document.querySelectorAll('input[name="edit-campaign-recipients"]:checked');
        const contactIds = Array.from(checkboxes).map(cb => cb.value);

        if (!name) {
            alert('Please enter a campaign name');
            return;
        }

        if (contactIds.length === 0) {
            alert('Please select at least one recipient');
            return;
        }

        try {
            await groupsApi.updateGroup(id, {
                group_name: name,
                contact_ids: contactIds
            });
            Modal.hide('edit-campaign-modal');
            await CampaignsPage.loadCampaigns();
        } catch (error) {
            alert('Failed to update campaign: ' + error.message);
        }
    },

    async handleDeleteCampaign(id) {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            await groupsApi.deleteGroup(id);
            await CampaignsPage.loadCampaigns();
        } catch (error) {
            alert('Failed to delete campaign: ' + error.message);
        }
    }
};
