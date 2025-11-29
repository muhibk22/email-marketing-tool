import { authApi } from '../api/auth.js';
import { authState } from '../utils/authState.js';
import { Button } from '../components/Button.js';
import { ROUTES } from '../utils/constants.js';

export const HomePage = {
    render: () => {
        const userEmail = authState.getUserEmail() || 'User';

        return `
            <div class="container dashboard-container">
                <h1 class="title">Dashboard</h1>
                <p class="welcome-text">Welcome, ${userEmail}</p>
                <p class="subtitle">Welcome to the Email Marketing Tool.</p>
                <div class="dashboard-actions">
                    ${Button({
            id: 'logout-btn',
            text: 'Log Out',
            type: 'button',
            className: 'btn btn-logout'
        })}
                </div>
            </div>
        `;
    },

    afterRender: async () => {
        const logoutBtn = document.getElementById('logout-btn');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await authApi.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    authState.clearAuth();
                    window.router.navigate(ROUTES.LOGIN);
                }
            });
        }
    }
};
