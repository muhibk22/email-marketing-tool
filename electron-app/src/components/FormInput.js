export const FormInput = ({ id, label, type = 'text', placeholder = '', required = true }) => {
    return `
        <div class="form-group">
            <label class="label" for="${id}">${label}</label>
            <input 
                class="input" 
                type="${type}" 
                id="${id}" 
                ${required ? 'required' : ''}
                placeholder="${placeholder}"
            >
        </div>
    `;
};
