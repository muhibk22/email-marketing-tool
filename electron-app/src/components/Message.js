import { MESSAGE_TYPES } from '../utils/constants.js';

export const Message = (id = 'message') => {
    return `<div id="${id}" class="message" style="display: none;"></div>`;
};

export const showMessage = (messageElement, text, type = MESSAGE_TYPES.ERROR) => {
    if (!messageElement) return;

    messageElement.classList.remove('message-error', 'message-success', 'message-info', 'message-warning');
    messageElement.classList.add(`message-${type}`);
    messageElement.textContent = text;
    messageElement.style.display = 'block';
};

export const hideMessage = (messageElement) => {
    if (!messageElement) return;

    messageElement.style.display = 'none';
    messageElement.textContent = '';
};
