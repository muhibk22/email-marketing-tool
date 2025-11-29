import { authState } from '../utils/authState.js';
import { Sidebar } from '../components/Sidebar.js';
import { Card } from '../components/Card.js';
import { ROUTES } from '../utils/constants.js';
import { contactsApi } from '../api/contacts.js';
import { groupsApi } from '../api/groups.js';
import { initIcons } from '../utils/icons.js';

export const HomePage = {
    render: () => {
        const userEmail = authState.getUserEmail() || 'User';

        return `
            ${Sidebar.render()}
            <div class="main-content">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Dashboard</h1>
                        <p class="page-subtitle">Welcome back, ${userEmail}</p>
                    </div>
                </div>

                <div class="dashboard-stats" id="dashboard-stats">
                    <div class="stats-loading">Loading statistics...</div>
                </div>

                <div class="dashboard-actions-section">
                    <h2 class="section-title">Quick Actions</h2>
                    <div class="dashboard-actions">
                        <button class="action-card" data-action="create-campaign">
                            <div class="action-icon"><i data-lucide="megaphone"></i></div>
                            <h3>Create Campaign</h3>
                            <p>Start a new email campaign</p>
                        </button>
                        <button class="action-card" data-action="send-email">
                            <div class="action-icon"><i data-lucide="send"></i></div>
                            <h3>Send Bulk Email</h3>
                            <p>Compose and send emails</p>
                        </button>
                        <button class="action-card" data-action="add-recipient">
                            <div class="action-icon"><i data-lucide="user-plus"></i></div>
                            <h3>Add Recipient</h3>
                            <p>Add new contacts</p>
                        </button>
                        <button class="action-card" data-action="ai-generate">
                            <div class="action-icon"><i data-lucide="sparkles"></i></div>
                            <h3>AI Email Generator</h3>
                            <p>Generate emails with AI</p>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender: async () => {
        // Setup sidebar logout
        Sidebar.afterRender(async () => {
            authState.clearAuth();
            window.router.navigate(ROUTES.LOGIN);
        });

        // Initialize icons
        initIcons();

        // Load statistics
        await HomePage.loadStats();

        // Setup quick action buttons
        const actionButtons = document.querySelectorAll('[data-action]');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                switch (action) {
                    case 'create-campaign':
                        window.router.navigate(ROUTES.CAMPAIGNS);
                        break;
                    case 'send-email':
                        window.router.navigate(ROUTES.BULK_SEND);
                        break;
                    case 'add-recipient':
                        window.router.navigate(ROUTES.RECIPIENTS);
                        break;
                    case 'ai-generate':
                        window.router.navigate(ROUTES.AI_GENERATOR);
                        break;
                }
            });
        });
    },

    async loadStats() {
        const statsContainer = document.getElementById('dashboard-stats');
        if (!statsContainer) return;

        try {
            const [contacts, groups] = await Promise.all([
                contactsApi.getContacts(),
                groupsApi.getGroups()
            ]);

            const totalRecipients = contacts.length;
            const totalCampaigns = groups.length;

            // Calculate total recipients in campaigns
            const totalInCampaigns = groups.reduce((sum, group) => {
                return sum + (group.contact_ids ? group.contact_ids.length : 0);
            }, 0);

            statsContainer.innerHTML = `
                ${Card({
                title: 'Total Recipients',
                value: totalRecipients.toString(),
                icon: 'users',
                className: 'stat-card stat-recipients'
            })}
                ${Card({
                title: 'Total Campaigns',
                value: totalCampaigns.toString(),
                icon: 'megaphone',
                className: 'stat-card stat-campaigns'
            })}
                ${Card({
                title: 'Campaign Members',
                value: totalInCampaigns.toString(),
                icon: 'layout-dashboard',
                className: 'stat-card stat-members'
            })}
                ${Card({
                title: 'Emails Sent',
                subtitle: 'No logs API available',
                value: 'N/A',
                icon: 'mail',
                className: 'stat-card stat-emails'
            })}
            `;

            // Re-initialize icons after dynamically adding content
            initIcons();
        } catch (error) {
            console.error('Error loading stats:', error);
            statsContainer.innerHTML = `
                <div class="error-message">
                    Failed to load statistics. Please try refreshing the page.
                </div>
            `;
        }
    }
};

