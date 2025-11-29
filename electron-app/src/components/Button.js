export const Button = ({ id = '', text, type = 'submit', className = 'btn' }) => {
    return `
        <button 
            class="${className}" 
            type="${type}"
            ${id ? `id="${id}"` : ''}
        >
            <span class="btn-text">${text}</span>
            <span class="btn-loader" style="display: none;">
                <span class="spinner"></span>
            </span>
        </button>
    `;
};

export const setButtonLoading = (button, loading) => {
    if (!button) return;

    const text = button.querySelector('.btn-text');
    const loader = button.querySelector('.btn-loader');

    if (loading) {
        button.disabled = true;
        button.classList.add('loading');
        if (text) text.style.display = 'none';
        if (loader) loader.style.display = 'inline-block';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        if (text) text.style.display = 'inline';
        if (loader) loader.style.display = 'none';
    }
};
