import { Sidebar } from '../components/Sidebar.js';
import { Table } from '../components/Table.js';
import { FormInput } from '../components/FormInput.js';
import { authState } from '../utils/authState.js';
import { ROUTES } from '../utils/constants.js';
import { initIcons } from '../utils/icons.js';

export const EmailLogsPage = {
    render: () => {
        return `
            ${Sidebar.render()}
            <div class="main-content">
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
                        ${EmailLogsPage.renderPlaceholderTable()}
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

        // Initialize icons
        initIcons();
    },

    renderPlaceholderTable() {
        const placeholderData = [];

        const columns = [
            {
                key: 'date',
                label: 'Date',
                render: (date) => new Date(date).toLocaleDateString()
            },
            { key: 'campaign', label: 'Campaign' },
            { key: 'subject', label: 'Subject' },
            {
                key: 'status',
                label: 'Status',
                render: (status) => `<span class="status-badge status-${status}">${status}</span>`
            },
            {
                key: 'recipients',
                label: 'Recipients',
                render: (count) => `${count} sent`
            }
        ];

        return `
            ${Table({
            columns,
            data: placeholderData,
            emptyMessage: 'No email logs available'
        })}
        `;
    }
};
