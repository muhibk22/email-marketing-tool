export const Table = ({
    columns = [],
    data = [],
    actions = null,
    emptyMessage = 'No data available'
}) => {
    if (!data || data.length === 0) {
        return `
            <div class="table-container">
                <div class="table-empty">${emptyMessage}</div>
            </div>
        `;
    }

    return `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${col.label}</th>`).join('')}
                        ${actions ? '<th>Actions</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${columns.map(col => `
                                <td data-label="${col.label}">
                                    ${col.render ? col.render(row[col.key], row) : row[col.key] || '-'}
                                </td>
                            `).join('')}
                            ${actions ? `<td class="table-actions" data-label="Actions">${actions(row)}</td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};
