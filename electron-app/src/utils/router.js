import { authState } from './authState.js';
import { ROUTES } from './constants.js';

export class Router {
    constructor(routes) {
        this.routes = routes;
        this.appContainer = document.getElementById('app');
        this.guards = {};

        this.navigate = this.navigate.bind(this);
        this.handleHashChange = this.handleHashChange.bind(this);

        window.addEventListener('hashchange', this.handleHashChange);

        this.handleHashChange();
    }

    addGuard(path, guardFunction) {
        this.guards[path] = guardFunction;
    }

    handleHashChange() {
        const path = window.location.hash.slice(1) || '/';
        this.navigate(path, false);
    }

    async navigate(path, updateHash = true) {
        const cleanPath = path.startsWith('/') ? path : `/${path}`;

        const route = this.routes[cleanPath] || this.routes[ROUTES.HOME];

        if (!route) {
            console.error('Route not found:', path);
            this.navigate(ROUTES.HOME);
            return;
        }

        if (this.guards[cleanPath]) {
            const canActivate = await this.guards[cleanPath]();
            if (!canActivate) {
                return;
            }
        }

        if (updateHash) {
            window.location.hash = cleanPath;
        }

        try {
            this.appContainer.innerHTML = route.render();
            if (route.afterRender) {
                await route.afterRender();
            }
        } catch (error) {
            console.error('Error rendering route:', error);
            this.showError('Failed to load page');
        }
    }

    showError(message) {
        this.appContainer.innerHTML = `
            <div class="container">
                <h1 class="title">Error</h1>
                <p style="text-align: center; color: var(--error-color);">${message}</p>
            </div>
        `;
    }

    setupAuthGuards() {
        this.addGuard(ROUTES.DASHBOARD, () => {
            if (!authState.isAuthenticated()) {
                console.log('Not authenticated, redirecting to login');
                this.navigate(ROUTES.LOGIN);
                return false;
            }
            return true;
        });

        this.addGuard(ROUTES.LOGIN, () => {
            if (authState.isAuthenticated()) {
                console.log('Already authenticated, redirecting to dashboard');
                this.navigate(ROUTES.DASHBOARD);
                return false;
            }
            return true;
        });

        this.addGuard(ROUTES.REGISTER, () => {
            if (authState.isAuthenticated()) {
                console.log('Already authenticated, redirecting to dashboard');
                this.navigate(ROUTES.DASHBOARD);
                return false;
            }
            return true;
        });
    }
}
