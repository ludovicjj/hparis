import { imagePreview } from "./image_preview";
let timer = null;
const removeFormToCollection = (e, formClassName) => {
    let form = e.currentTarget.closest(formClassName);
    let collectionHolder = e.currentTarget.closest('.uploads-grid')
    form.remove();


    if (!collectionHolder.querySelectorAll(formClassName).length) {
        let helper = collectionHolder.querySelector('.upload-help')
        helper.style.display = 'block';
        helper.style.opacity = '0';
        helper.style.transform = "translateX(170px)"
        helper.classList.remove('hidden');
        clearTimeout(timer);
        timer = setTimeout(_ => {
            helper.style = "";
        }, 10);
    }
}

const addFormToCollection = (e, formClassName, removeBtnClassName) => {
    const collectionHolder = document.querySelector('.' + e.currentTarget.dataset.collectionHolderClass);

    let parser = new DOMParser();
    let formHtmlText = collectionHolder.dataset.prototype.replace(
        /__name__/g,
        collectionHolder.dataset.index
    );
    let htmlDocument = parser.parseFromString(formHtmlText, 'text/html');
    let form = htmlDocument.querySelector(formClassName)

    // Remove
    form.querySelector(removeBtnClassName).addEventListener('click', (e) => {
        removeFormToCollection(e, formClassName)
    })

    // Image preview
    form.querySelector('input[type="file"]').addEventListener('change', (e) => {
        imagePreview(e, '.target-preview', '.image_label img')
    })

    // helper
    collectionHolder.querySelector('.upload-help').classList.add('hidden');

    collectionHolder.appendChild(form)
    collectionHolder.dataset.index++;
}

export { addFormToCollection };