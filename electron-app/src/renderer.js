import { Router } from './utils/router.js';
import { LoginPage } from './pages/login.js';
import { HomePage } from './pages/home.js';

const routes = {
    '/': LoginPage,
    '/home': HomePage,
};

const router = new Router(routes);
window.router = router; // Make router globally available for navigation

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    router.navigate('/');
});
