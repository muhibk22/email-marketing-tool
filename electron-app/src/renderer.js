import { Router } from './utils/router.js';
import { LoginPage } from './pages/login.js';
import { RegisterPage } from './pages/register.js';
import { HomePage } from './pages/home.js';
import { ROUTES } from './utils/constants.js';

const routes = {
    [ROUTES.HOME]: LoginPage,
    [ROUTES.LOGIN]: LoginPage,
    [ROUTES.REGISTER]: RegisterPage,
    [ROUTES.DASHBOARD]: HomePage,
};

// Initialize router
const router = new Router(routes);

// Setup authentication guards
router.setupAuthGuards();

// Make router globally available for navigation
window.router = router;
