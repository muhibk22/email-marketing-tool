export const HomePage = {
    render: () => {
        return `
            <div class="container" style="max-width: 800px;">
                <h1 class="title">Dashboard</h1>
                <p style="text-align: center; color: #6b7280;">Welcome to the Email Marketing Tool.</p>
                <div style="margin-top: 2rem; text-align: center;">
                    <button class="btn" onclick="window.router.navigate('/')" style="width: auto;">Log Out</button>
                </div>
            </div>
        `;
    },
    afterRender: async () => {
        // Home page logic here
    }
};
