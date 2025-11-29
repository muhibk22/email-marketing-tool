export const Card = ({
    title = '',
    subtitle = '',
    value = '',
    icon = '',
    className = '',
    children = ''
}) => {
    return `
        <div class="card ${className}">
            <div class="card-header">
                ${icon ? `<div class="card-icon"><i data-lucide="${icon}"></i></div>` : ''}
                <div class="card-header-text">
                    ${title ? `<h3 class="card-title">${title}</h3>` : ''}
                    ${subtitle ? `<p class="card-subtitle">${subtitle}</p>` : ''}
                </div>
            </div>
            ${value ? `<div class="card-value">${value}</div>` : ''}
            ${children ? `<div class="card-body">${children}</div>` : ''}
        </div>
    `;
};
