import { Router } from './utils/router.js';
import { LoginPage } from './pages/login.js';
import { RegisterPage } from './pages/register.js';
import { HomePage } from './pages/home.js';
import { RecipientsPage } from './pages/recipients.js';
import { CampaignsPage } from './pages/campaigns.js';
import { MarketingEmailPage } from './pages/marketingEmail.js';
import { TransactionalEmailPage } from './pages/transactionalEmail.js';
import { AIGeneratorPage } from './pages/aiGenerator.js';
import { EmailLogsPage } from './pages/emailLogs.js';
import { ROUTES } from './utils/constants.js';

const routes = {
    [ROUTES.HOME]: LoginPage,
    [ROUTES.LOGIN]: LoginPage,
    [ROUTES.REGISTER]: RegisterPage,
    [ROUTES.DASHBOARD]: HomePage,
    [ROUTES.RECIPIENTS]: RecipientsPage,
    [ROUTES.CAMPAIGNS]: CampaignsPage,
    [ROUTES.MARKETING_EMAIL]: MarketingEmailPage,
    [ROUTES.TRANSACTIONAL_EMAIL]: TransactionalEmailPage,
    [ROUTES.AI_GENERATOR]: AIGeneratorPage,
    [ROUTES.EMAIL_LOGS]: EmailLogsPage
};

// Initialize router
const router = new Router(routes);

// Setup authentication guards
router.setupAuthGuards();

// Add guards for all protected routes
import { authState } from './utils/authState.js';

const protectedRoutes = [
    ROUTES.RECIPIENTS,
    ROUTES.CAMPAIGNS,
    ROUTES.MARKETING_EMAIL,
    ROUTES.TRANSACTIONAL_EMAIL,
    ROUTES.AI_GENERATOR,
    ROUTES.EMAIL_LOGS
];

protectedRoutes.forEach(route => {
    router.addGuard(route, () => {
        if (!authState.isAuthenticated()) {
            router._inGuardRedirect = true;
            router.navigate(ROUTES.LOGIN);
            router._inGuardRedirect = false;
            return false;
        }
        return true;
    });
});

// Make router globally available for navigation
window.router = router;
