export class Router {
    constructor(routes) {
        this.routes = routes;
        this.appContainer = document.getElementById('app');
    }

    async navigate(path) {
        const route = this.routes[path];
        if (route) {
            this.appContainer.innerHTML = route.render();
            if (route.afterRender) {
                await route.afterRender();
            }
        } else {
            console.error('Route not found:', path);
        }
    }
}
