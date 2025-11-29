import { Sidebar } from '../components/Sidebar.js';
import { Table } from '../components/Table.js';
import { FormInput } from '../components/FormInput.js';
import { authState } from '../utils/authState.js';
import { ROUTES } from '../utils/constants.js';
import { initIcons } from '../utils/icons.js';
import { emailApi } from '../api/email.js';

export const EmailLogsPage = {
    logs: [],

    render: () => {
        return `
            ${Sidebar.render()}
            <div class="main-content">
                <div class="page-header">
                    <h1 class="page-title">
                        <i data-lucide="file-text"></i>
                        Sent Email Logs
                    </h1>
                    <p class="page-subtitle">View history of sent emails</p>
                </div>

                <div class="email-logs-container">
                    <div class="filters-section">
                        <h3>Filters</h3>
                        <div class="filters-grid">
                            <div class="form-group">
                                <label class="form-label">Campaign</label>
                                <select id="filter-campaign" class="form-select">
                                    <option value="">All Campaigns</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select id="filter-status" class="form-select">
                                    <option value="">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            <div class="form-group">
                                ${FormInput({
            id: 'filter-date-from',
            label: 'Date From',
            type: 'date'
        })}
                            </div>
                            <div class="form-group">
                                ${FormInput({
            id: 'filter-date-to',
            label: 'Date To',
            type: 'date'
        })}
                            </div>
                        </div>
                    </div>

                    <div id="logs-table">
                        <div class="loading">Loading email logs...</div>
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

        // Initialize icons
        initIcons();

        // Load logs
        await EmailLogsPage.loadLogs();

        // Setup filters (placeholder for now)
        document.getElementById('filter-status')?.addEventListener('change', () => {
            EmailLogsPage.renderTable();
        });
    },

    async loadLogs() {
        const tableContainer = document.getElementById('logs-table');
        if (!tableContainer) return;

        try {
            EmailLogsPage.logs = await emailApi.getEmailLogs();
            EmailLogsPage.renderTable();
        } catch (error) {
            console.error('Error loading logs:', error);
            tableContainer.innerHTML = `
                <div class="error-message">
                    <div class="error-icon"><i data-lucide="alert-triangle"></i></div>
                    <h4>Failed to load email logs</h4>
                    <p>${error.message}</p>
                </div>
            `;
            initIcons();
        }
    },

    renderTable() {
        const tableContainer = document.getElementById('logs-table');
        if (!tableContainer) return;

        // Simple client-side filtering (can be expanded)
        const statusFilter = document.getElementById('filter-status')?.value;
        let filteredLogs = EmailLogsPage.logs;

        if (statusFilter) {
            filteredLogs = filteredLogs.filter(log => log.status === statusFilter);
        }

        const columns = [
            {
                key: 'created_at',
                label: 'Date',
                render: (date) => date ? new Date(date).toLocaleString() : '-'
            },
            {
                key: 'subject',
                label: 'Subject',
                render: (subject) => `<span class="fw-medium">${subject}</span>`
            },
            {
                key: 'status',
                label: 'Status',
                render: (status) => {
                    const statusClass = status === 'success' ? 'success' : 'danger';
                    const icon = status === 'success' ? 'check-circle' : 'x-circle';
                    return `
                        <span class="status-badge status-${statusClass}">
                            <i data-lucide="${icon}" style="width:14px;height:14px;margin-right:4px;"></i>
                            ${status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    `;
                }
            },
            {
                key: 'sent_to',
                label: 'Recipients',
                render: (recipients) => {
                    const count = Array.isArray(recipients) ? recipients.length : 0;
                    return `<span class="badge badge-neutral">${count} recipient${count !== 1 ? 's' : ''}</span>`;
                }
            }
        ];

        tableContainer.innerHTML = Table({
            columns,
            data: filteredLogs,
            emptyMessage: 'No email logs found.'
        });

        // Re-initialize icons for status badges
        initIcons();
    }
};
