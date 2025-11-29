export const Modal = {
    render: ({ id, title, children, className = '' }) => {
        return `
            <div class="modal-overlay" id="${id}" style="display: none;">
                <div class="modal ${className}">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" data-modal-close="${id}">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${children}
                    </div>
                </div>
            </div>
        `;
    },

    show: (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },

    hide: (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    setupCloseHandlers: (id) => {
        const modal = document.getElementById(id);
        if (!modal) return;

        // Close button
        const closeBtn = modal.querySelector(`[data-modal-close="${id}"]`);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => Modal.hide(id));
        }

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                Modal.hide(id);
            }
        });

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                Modal.hide(id);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
};
