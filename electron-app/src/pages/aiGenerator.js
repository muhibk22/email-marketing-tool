import { Sidebar } from '../components/Sidebar.js';
import { FormInput } from '../components/FormInput.js';
import { Button } from '../components/Button.js';
import { authState } from '../utils/authState.js';
import { ROUTES } from '../utils/constants.js';
import { initIcons } from '../utils/icons.js';

export const AIGeneratorPage = {
    render: () => {
        return `
            ${Sidebar.render()}
            <div class="main-content">
                <div class="page-header">
                    <h1 class="page-title">AI Email Generator</h1>
                    <p class="page-subtitle">Generate professional emails with AI assistance</p>
                </div>

                <div class="ai-generator-container">
                <div class="ai-generator-container">
                    <form id="ai-generator-form" class="form">
                        ${FormInput({
            id: 'email-purpose',
            label: 'Email Purpose',
            type: 'text',
            placeholder: 'e.g., Product launch announcement',
            required: true
        })}

                        <div class="form-group">
                            <label class="form-label">Tone</label>
                            <select id="email-tone" class="form-select">
                                <option value="professional">Professional</option>
                                <option value="casual">Casual</option>
                                <option value="friendly">Friendly</option>
                                <option value="formal">Formal</option>
                                <option value="enthusiastic">Enthusiastic</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Sample Text (Optional)</label>
                            <textarea 
                                id="sample-text" 
                                class="form-textarea" 
                                rows="4" 
                                placeholder="Provide any sample text or key points you want to include..."
                            ></textarea>
                        </div>

                        <div class="form-actions">
                            ${Button({
            id: 'generate-btn',
            text: '<i data-lucide="sparkles"></i> Generate Email',
            type: 'submit',
            className: 'btn btn-primary btn-lg'
        })}
                        </div>
                    </form>

                    <div id="generated-result" class="generated-result" style="display: none;">
                        <h3>Generated Email</h3>
                        <div class="generated-content" id="generated-content"></div>
                        <div class="result-actions">
                            ${Button({
            id: 'copy-result-btn',
            text: '<i data-lucide="copy"></i> Copy to Clipboard',
            type: 'button',
            className: 'btn btn-secondary'
        })}
                            ${Button({
            id: 'use-in-bulk-send-btn',
            text: '<i data-lucide="mail"></i> Use in Bulk Send',
            type: 'button',
            className: 'btn btn-primary'
        })}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender: async () => {
        Sidebar.afterRender(() => {
            authState.clearAuth();
            window.router.navigate(ROUTES.LOGIN);
        });

        // Initialize icons
        initIcons();

        // Initialize icons
        initIcons();

        document.getElementById('ai-generator-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('AI Email Generator API is not yet available. Please contact the backend team to implement this feature.');
        });
    }
};
