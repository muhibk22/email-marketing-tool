import { Sidebar } from '../components/Sidebar.js';
import { Button } from '../components/Button.js';
import { authState } from '../utils/authState.js';
import { ROUTES } from '../utils/constants.js';
import { initIcons } from '../utils/icons.js';

export const AttachmentsPage = {
    render: () => {
        return `
            ${Sidebar.render()}
            <div class="main-content">
                <div class="page-header">
                    <h1 class="page-title">Attachments & Files</h1>
                    <p class="page-subtitle">Manage files and attachments for your emails</p>
                </div>

                <div class="attachments-container">
                    <div class="api-missing-notice">
                        <div class="notice-icon"><i data-lucide="alert-triangle"></i></div>
                        <h3>Object Storage API Not Available</h3>
                        <p><strong>Backend API endpoints missing:</strong> File upload and storage features require backend API endpoints for:</p>
                        <ul class="notice-list">
                            <li><code>POST /files/upload</code> - Upload files</li>
                            <li><code>GET /files</code> - List uploaded files</li>
                            <li><code>DELETE /files/:id</code> - Delete files</li>
                            <li><code>GET /files/:id/url</code> - Get file URL</li>
                        </ul>
                        <p>Once the backend team implements object storage (e.g., AWS S3, MinIO), this page will be fully functional.</p>
                    </div>

                    <div class="upload-section upload-disabled">
                        <div class="upload-area">
                            <div class="upload-icon"><i data-lucide="paperclip"></i></div>
                            <h3>Drag & Drop Files Here</h3>
                            <p>or click to browse</p>
                            <input type="file" id="file-input" multiple disabled style="display: none;">
                            ${Button({
            id: 'browse-btn',
            text: 'Browse Files',
            type: 'button',
            className: 'btn btn-secondary'
        })}
                        </div>
                    </div>

                    <div class="files-section">
                        <h3>Uploaded Files</h3>
                        <div class="files-grid">
                            <div class="placeholder-file">
                                <div class="file-icon"><i data-lucide="image"></i></div>
                                <p class="file-name">header-image.jpg</p>
                                <div class="file-actions">
                                    <button class="btn btn-sm" disabled>Insert URL</button>
                                    <button class="btn btn-sm btn-danger" disabled>Delete</button>
                                </div>
                            </div>
                            <div class="placeholder-file">
                                <div class="file-icon"><i data-lucide="file-text"></i></div>
                                <p class="file-name">product-catalog.pdf</p>
                                <div class="file-actions">
                                    <button class="btn btn-sm" disabled>Attach</button>
                                    <button class="btn btn-sm btn-danger" disabled>Delete</button>
                                </div>
                            </div>
                            <div class="placeholder-file">
                                <div class="file-icon"><i data-lucide="image"></i></div>
                                <p class="file-name">logo.png</p>
                                <div class="file-actions">
                                    <button class="btn btn-sm" disabled>Insert URL</button>
                                    <button class="btn btn-sm btn-danger" disabled>Delete</button>
                                </div>
                            </div>
                        </div>
                        <p class="placeholder-note">* These are placeholder files for demonstration purposes</p>
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

        // Disable browse button
        document.getElementById('browse-btn')?.addEventListener('click', () => {
            alert('Object Storage API is not yet available. Please contact the backend team to implement file upload functionality.');
        });
    }
};
