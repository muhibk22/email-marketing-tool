import { authApi } from '../api/auth.js';
import { authState } from '../utils/authState.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { getElement } from '../utils/dom.js';
import { Message, showMessage, hideMessage } from '../components/Message.js';
import { Button, setButtonLoading } from '../components/Button.js';
import { FormInput } from '../components/FormInput.js';
import { ROUTES, MESSAGE_TYPES } from '../utils/constants.js';

export const LoginPage = {
    render: () => {
        return `
            <div class="container">
                <h1 class="title">FES Email Marketing</h1>
                <form id="login-form">
                    ${FormInput({
            id: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'abc@fes.com'
        })}
                    ${FormInput({
            id: 'password',
            label: 'Password',
            type: 'password',
            placeholder: '••••••••'
        })}
                    ${Button({
            id: 'login-btn',
            text: 'Sign In',
            type: 'submit'
        })}
                    <div class="auth-links">
                        <p>Don't have an account? <a href="#${ROUTES.REGISTER}" class="link">Sign Up</a></p>
                    </div>
                    ${Message('login-message')}
                </form>
            </div>
        `;
    },

    afterRender: async () => {
        const form = getElement('login-form');
        const messageEl = getElement('login-message');
        const submitBtn = getElement('login-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = getElement('email').value.trim();
            const password = getElement('password').value;

            hideMessage(messageEl);

            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                showMessage(messageEl, emailValidation.message, MESSAGE_TYPES.ERROR);
                return;
            }

            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                showMessage(messageEl, passwordValidation.message, MESSAGE_TYPES.ERROR);
                return;
            }

            setButtonLoading(submitBtn, true);

            try {
                const response = await authApi.login(email, password);
                console.log('Login successful:', response);

                if (response.token) {
                    authState.setToken(response.token);
                    authState.setUserEmail(email);
                    window.router.navigate(ROUTES.DASHBOARD);
                } else {
                    throw new Error('No token received from server');
                }
            } catch (error) {
                console.error('Login error:', error);
                showMessage(messageEl, error.message || 'Login failed. Please try again.', MESSAGE_TYPES.ERROR);
            } finally {
                setButtonLoading(submitBtn, false);
            }
        });
    }
};
