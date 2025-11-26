export const getElement = (id) => {
    return document.getElementById(id);
};

export const getRequiredElement = (id) => {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Required element not found: ${id}`);
    }
    return element;
};

export const getElements = (ids) => {
    const elements = {};
    ids.forEach(id => {
        elements[id] = getElement(id);
    });
    return elements;
};

export const setVisible = (element, visible) => {
    if (element) {
        element.style.display = visible ? 'block' : 'none';
    }
};

export const addClass = (element, className) => {
    if (element) {
        element.classList.add(className);
    }
};

export const removeClass = (element, className) => {
    if (element) {
        element.classList.remove(className);
    }
};

export const toggleClass = (element, className) => {
    if (element) {
        element.classList.toggle(className);
    }
};

export const setText = (element, text) => {
    if (element) {
        element.textContent = text;
    }
};

export const clearChildren = (element) => {
    if (element) {
        element.innerHTML = '';
    }
};
