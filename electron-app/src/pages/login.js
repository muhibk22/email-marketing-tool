import { authApi } from '../api/auth.js';

export const LoginPage = {
    render: () => {
        return `
            <div class="container">
                <h1 class="title">FES Email Marketing</h1>
                <form id="login-form">
                    <div class="form-group">
                        <label class="label" for="email">Email</label>
                        <input class="input" type="email" id="email" required placeholder="abc@fes.com">
                    </div>
                    <div class="form-group">
                        <label class="label" for="password">Password</label>
                        <input class="input" type="password" id="password" required placeholder="••••••••">
                    </div>
                    <button class="btn" type="submit">Sign In</button>
                    <div id="error-msg" class="error-message"></div>
                </form>
            </div>
        `;
    },
    afterRender: async () => {
        const form = document.getElementById('login-form');
        const errorMsg = document.getElementById('error-msg');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                errorMsg.style.display = 'none';
                const response = await authApi.login(email, password);
                console.log('Login successful:', response);
                // Store token if needed: localStorage.setItem('token', response.token);
                window.router.navigate('/home');
            } catch (error) {
                errorMsg.textContent = error.message;
                errorMsg.style.display = 'block';
            }
        });
    }
};
