import { initIcons } from '../utils/icons.js';

export const RichTextEditor = {
    render: (id, placeholder = 'Enter your email content here...') => {
        return `
            <div class="rich-editor-container">
                <div class="rich-editor-toolbar">
                    <button type="button" class="editor-btn" data-command="bold" title="Bold">
                        <strong>B</strong>
                    </button>
                    <button type="button" class="editor-btn" data-command="italic" title="Italic">
                        <em>I</em>
                    </button>
                    <button type="button" class="editor-btn" data-command="underline" title="Underline">
                        <u>U</u>
                    </button>
                    <div class="editor-divider"></div>
                    <button type="button" class="editor-btn" data-command="insertUnorderedList" title="Bullet List">
                        ≡
                    </button>
                    <button type="button" class="editor-btn" data-command="insertOrderedList" title="Numbered List">
                        #
                    </button>
                    <div class="editor-divider"></div>
                    <button type="button" class="editor-btn" data-command="createLink" title="Insert Link">
                        <i data-lucide="link"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="removeFormat" title="Clear Formatting">
                        <i data-lucide="eraser"></i>
                    </button>
                </div>
                <div 
                    id="${id}"
                    class="rich-editor-content" 
                    contenteditable="true"
                    data-placeholder="${placeholder}">
                </div>
            </div>
        `;
    },

    setup: (id) => {
        const editor = document.getElementById(id);
        if (!editor) return;

        const toolbar = editor.parentElement.querySelector('.rich-editor-toolbar');
        if (!toolbar) return;

        // Handle toolbar buttons
        toolbar.querySelectorAll('.editor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.getAttribute('data-command');

                if (command === 'createLink') {
                    const url = prompt('Enter the URL:');
                    if (url) {
                        document.execCommand(command, false, url);
                    }
                } else {
                    document.execCommand(command, false, null);
                }

                editor.focus();
            });
        });

        // Show/hide placeholder
        const updatePlaceholder = () => {
            if (editor.textContent.trim() === '') {
                editor.classList.add('empty');
            } else {
                editor.classList.remove('empty');
            }
        };

        editor.addEventListener('input', updatePlaceholder);
        editor.addEventListener('blur', updatePlaceholder);
        updatePlaceholder();

        // Initialize Lucide icons in toolbar
        initIcons();
    },

    getHTML: (id) => {
        const editor = document.getElementById(id);
        return editor ? editor.innerHTML : '';
    },

    setHTML: (id, html) => {
        const editor = document.getElementById(id);
        if (editor) {
            editor.innerHTML = html;
            // Trigger placeholder update
            const event = new Event('input');
            editor.dispatchEvent(event);
        }
    },

    clear: (id) => {
        const editor = document.getElementById(id);
        if (editor) {
            editor.innerHTML = '';
            editor.classList.add('empty');
        }
    }
};
