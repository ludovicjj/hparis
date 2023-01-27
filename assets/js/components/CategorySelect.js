import TomSelect from "tom-select";

async function onLoad(url) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json'
        }
    })
    if (response.status === 204) {
        return null;
    }
    return await response.json();
}

const categoryField = document.querySelector('#categories');
categoryField.classList.remove('form-select');

export const CategorySelect = new TomSelect('#categories', {
    hideSelected: true,
    closeAfterSelect: true,
    valueField: categoryField.dataset.value,
    labelField: categoryField.dataset.label,
    searchField: categoryField.dataset.label,
    placeholder: 'Recherchez une catégorie',
    load: async (query, callback) => {
        const url = `${categoryField.dataset.remote}?s=${encodeURIComponent(query)}`;
        callback(await onLoad(url))
    },
    plugins: {
        remove_button: {title: 'Supprimer cette catégorie'}
    }
})