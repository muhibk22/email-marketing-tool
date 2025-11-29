import { ROUTES } from '../utils/constants.js';
import { initIcons } from '../utils/icons.js';

export const Sidebar = {
    render: () => {
        const currentPath = window.location.hash.slice(1) || '/';

        const menuItems = [
            { route: ROUTES.DASHBOARD, icon: 'layout-dashboard', label: 'Dashboard' },
            { route: ROUTES.RECIPIENTS, icon: 'users', label: 'Recipients' },
            { route: ROUTES.CAMPAIGNS, icon: 'megaphone', label: 'Campaigns' },
            { route: ROUTES.MARKETING_EMAIL, icon: 'mail', label: 'Marketing Email' },
            { route: ROUTES.TRANSACTIONAL_EMAIL, icon: 'zap', label: 'Transactional Email' },
            { route: ROUTES.AI_GENERATOR, icon: 'sparkles', label: 'AI Generator' },
            { route: ROUTES.EMAIL_LOGS, icon: 'file-text', label: 'Email Logs' }
        ];

        return `
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h2 class="sidebar-logo">
                        <i data-lucide="mail-open"></i>
                        EmailHub
                    </h2>
                </div>
                <nav class="sidebar-nav">
                    ${menuItems.map(item => `
                        <a href="#${item.route}" 
                           class="sidebar-item ${currentPath === item.route ? 'active' : ''}"
                           data-route="${item.route}">
                            <span class="sidebar-icon"><i data-lucide="${item.icon}"></i></span>
                            <span class="sidebar-label">${item.label}</span>
                            ${item.badge ? `<span class="sidebar-badge">${item.badge}</span>` : ''}
                        </a>
                    `).join('')}
                </nav>
                <div class="sidebar-footer">
                    <button class="sidebar-item sidebar-logout" id="sidebar-logout-btn">
                        <span class="sidebar-icon"><i data-lucide="log-out"></i></span>
                        <span class="sidebar-label">Logout</span>
                    </button>
                </div>
            </aside>
        `;
    },

    afterRender: (onLogout) => {
        // Initialize Lucide icons
        initIcons();

        const logoutBtn = document.getElementById('sidebar-logout-btn');
        if (logoutBtn && onLogout) {
            logoutBtn.addEventListener('click', onLogout);
        }
    }
};
