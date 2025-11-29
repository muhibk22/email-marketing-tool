import { authApi } from '../api/auth.js';
import { validateEmail, validatePassword, validatePasswordMatch } from '../utils/validators.js';
import { getElement } from '../utils/dom.js';
import { Message, showMessage, hideMessage } from '../components/Message.js';
import { Button, setButtonLoading } from '../components/Button.js';
import { FormInput } from '../components/FormInput.js';
import { ROUTES, MESSAGE_TYPES, UI } from '../utils/constants.js';

export const RegisterPage = {
    render: () => {
        return `
            <div class="container">
                <h1 class="title">Create Account</h1>
                <form id="register-form">
                    ${FormInput({
            id: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'Enter your email'
        })}
                    ${FormInput({
            id: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Create a password'
        })}
                    ${FormInput({
            id: 'confirm-password',
            label: 'Confirm Password',
            type: 'password',
            placeholder: 'Confirm your password'
        })}
                    ${Button({
            id: 'register-btn',
            text: 'Sign Up',
            type: 'submit'
        })}
                    <div class="auth-links">
                        <p>Already have an account? <a href="#${ROUTES.LOGIN}" class="link">Sign In</a></p>
                    </div>
                    ${Message('register-message')}
                </form>
            </div>
        `;
    },

    afterRender: async () => {
        const form = getElement('register-form');
        const messageEl = getElement('register-message');
        const submitBtn = getElement('register-btn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = getElement('email').value.trim();
            const password = getElement('password').value;
            const confirmPassword = getElement('confirm-password').value;

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

            const matchValidation = validatePasswordMatch(password, confirmPassword);
            if (!matchValidation.valid) {
                showMessage(messageEl, matchValidation.message, MESSAGE_TYPES.ERROR);
                return;
            }

            setButtonLoading(submitBtn, true);

            try {
                const response = await authApi.register(email, password);
                console.log('Registration successful:', response);

                showMessage(
                    messageEl,
                    'Registration successful! Redirecting to login...',
                    MESSAGE_TYPES.SUCCESS
                );

                setTimeout(() => {
                    window.router.navigate(ROUTES.LOGIN);
                }, UI.SUCCESS_REDIRECT_DELAY);
            } catch (error) {
                console.error('Registration error:', error);
                showMessage(
                    messageEl,
                    error.message || 'Registration failed. Please try again.',
                    MESSAGE_TYPES.ERROR
                );
                setButtonLoading(submitBtn, false);
            }
        });
    }
};
