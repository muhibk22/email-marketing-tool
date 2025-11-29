import { VALIDATION } from './constants.js';

export const validateEmail = (email) => {
    if (!email) {
        return { valid: false, message: 'Email is required' };
    }

    if (!VALIDATION.EMAIL_REGEX.test(email)) {
        return { valid: false, message: 'Please enter a valid email address' };
    }

    return { valid: true, message: '' };
};

export const validatePassword = (password) => {
    if (!password) {
        return { valid: false, message: 'Password is required' };
    }

    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
        return {
            valid: false,
            message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`
        };
    }

    const byteLength = new TextEncoder().encode(password).length;
    if (byteLength > VALIDATION.PASSWORD_MAX_BYTES) {
        return {
            valid: false,
            message: `Password is too long (maximum ${VALIDATION.PASSWORD_MAX_BYTES} bytes)`
        };
    }

    return { valid: true, message: '' };
};

export const validatePasswordMatch = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        return { valid: false, message: 'Passwords do not match' };
    }

    return { valid: true, message: '' };
};

export const validateForm = (fields, requiredFields) => {
    const errors = {};
    let valid = true;

    requiredFields.forEach(field => {
        if (!fields[field] || fields[field].trim() === '') {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            valid = false;
        }
    });

    return { valid, errors };
};
