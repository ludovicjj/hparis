import TomSelect from "tom-select/dist/js/tom-select.complete.min";
import '../../styles/admin/gallery_create.scss';
import { imagePreview } from "../components/image_preview";
import Swal from 'sweetalert2';

//categories
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
categoryField.classList.remove('form-select')
new TomSelect('#categories', {
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


class GalleryForm {
    constructor(form) {
        this.form = form

        this.form.querySelector('#thumbnail_imageFile').addEventListener('change', (e) => {
            imagePreview(e, '.target-preview', '.image_label img')
        })

        this.form.addEventListener('submit', this.handleSubmit.bind(this))
        this.form.addEventListener('reset', this.handleReset.bind(this))
    }

    async handleSubmit(e) {
        e.preventDefault();
        const url = this.form.getAttribute('action');

        this.removeInvalidFeedback();
        this.removeInvalidStyle();
        this.disableSubmit(true);

        const formData = new FormData(form)

        // fetch all uploaded pictures from dropbox
        Array.from(this.form.querySelectorAll('.upload-info-item')).forEach(uploadedItem => {
            if (uploadedItem.dataset.pictureId) {
                formData.append('uploads[]', uploadedItem.dataset.pictureId);
            }
        });
        const response = await this.send(url, 'POST', formData);

        this.disableSubmit(false);

        if (!response.ok) {
            const errors = await response.json();
            const transformedErrors = this.transformPropertyErrors(errors.errors)
            this.displayErrors(transformedErrors)
        } else {
            this.form.reset();
            await Swal.fire({
                icon: 'success',
                title: 'Bravo',
                text: 'Votre galerie a été créée avec success !',
                confirmButtonColor: '#4869ee',
                confirmButtonText: 'Cool'
            })
        }
    }

    displayErrors(errors) {

        errors.forEach(error => {
            let field = document.querySelector(`input[name="${error.property}"]`)

            if (field) {
                field.classList.add('is-invalid');

                const invalidFeedback = this.createInvalidFeedback(error.message);

                const parentField = field.closest(`.${error.parentClass}`);
                parentField.appendChild(invalidFeedback);
                parentField.classList.add('is-invalid');
            }
        })
    }

    /**
     * @param {Object[]} errors
     * @return {Object[]}
     */
    transformPropertyErrors(errors) {
        const regex = /(^\w+)|(\.\w+)/g;

        return errors.map(error => {
            let property = error.property;

            error.parentClass = property
            // transform property to match with field name
            if (property.includes('.')) {
                property = property
                    .replace(regex, (match, field, child) => {
                        return field ? field : "[" + child.slice(1) + "]"
                    })
                error.property = property + '[file]';
                error.parentClass = 'target-preview'
            }

            return error;
        })

    }

    /**
     * Reset form when success
     */
    handleReset() {
        // Reset thumbnail
        const thumbnail = this.form.querySelector('.thumbnail img');
        thumbnail.setAttribute('src', thumbnail.dataset.origin);

        // clear Uploaded files area
        const uploadPictureFiles = this.form.querySelector('.upload-info-items');
        uploadPictureFiles.replaceChildren();
    }

    /**
     * @param {string} message
     * @return {HTMLElement}
     */
    createInvalidFeedback(message) {
        const invalidFeedBack = document.createElement('div');
        invalidFeedBack.classList.add('invalid-feedback');
        invalidFeedBack.innerText = message;
        return invalidFeedBack;
    }

    removeInvalidFeedback() {
        this.form.querySelectorAll('.invalid-feedback').forEach(feedback => {
            feedback.remove();
        })
    }

    removeInvalidStyle() {
        this.form.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        })
    }

    disableSubmit(state) {
        const submit = this.form.querySelector('button[type="submit"]');
        if (state) {
            submit.setAttribute('disabled', 'disabled')
        } else {
            submit.removeAttribute('disabled');
        }
    }

    /**
     * @param url
     * @param method
     * @param body
     * @return {Promise<Response>}
     */
    send(url, method, body) {
        return fetch(url, {
            method,
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            body
        })
    }
}

const form = document.querySelector('#form-gallery');
new GalleryForm(form);


const uploadDropArea = form.querySelector('.upload-drop-area');
const uploadItemArea = form.querySelector('.upload-info-items');
const uploadInput = uploadDropArea.querySelector('#uploads');
const uploadBtn = form.querySelector('.upload-drop_add')
let dragCounter = 0;

uploadBtn.addEventListener('click', () => {
    uploadInput.click();
})

// upload file change
uploadInput.addEventListener('change', function () {
    let [...files] = this.files;
    let index = 0;
    let nbItemLoaded = uploadItemArea.childElementCount;

    uploadDom(files, uploadItemArea)
    upload(files, index, uploadItemArea, nbItemLoaded)

    // reset input file
    this.value = null;
})

// user drag file enter into area
uploadDropArea.addEventListener('dragenter', function () {
    dragCounter++;
    this.classList.add('active')
})

uploadDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
})

// user drag file out area
uploadDropArea.addEventListener('dragleave', function ()  {
    dragCounter--;
    if (dragCounter === 0) {
        this.classList.remove('active')
    }
})

function uploadDom(files, area) {
    files.forEach(file => {
        let fileName = file.name;
        let size = (file.size / 1000).toFixed(1); // getting file size in KB from bytes
        let fileSize = (size < 1000) ? `${size} KB` : `${(size/1000).toFixed(1)} MB`

        // make fragment
        let html = `<li class="upload-info-item">
                        <div class="icon-file">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="upload-item-content">
                            <div class="file-name">${fileName}</div>
                            <div class="d-flex">
                                <div class="file-size form-text">${fileSize}</div>
                                <div class="file-error flex-grow-1 form-text">
                                    <p class="mb-0 text-end"></p>
                                </div>
                            </div>
                            <div class="progress-bar">
                                <div class="progress"></div>
                            </div>
                        </div>
                        <div class="icon-state loading"></div>
                        <div class="icon-remove">
                            <i class="fa-solid fa-xmark"></i>
                        </div>
                    </li>`
        area.innerHTML += html
    })
}
function upload(files, index, area, nbItemLoaded) {
    let file = files[index];
    let position = index + nbItemLoaded;
    const url = area.dataset.url

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('upload', file);

    const items = Array.from(area.querySelectorAll('.upload-info-item'));

    const currentItem = items[position];
    const itemProgress = currentItem.querySelector('.progress');
    const itemState = currentItem.querySelector('.icon-state');

    // request progress
    xhr.upload.addEventListener("progress", ({loaded, total}) => {
        let fileProgress = Math.floor((loaded / total) * 100);
        itemProgress.style.width = fileProgress + '%';
    })

    // request completed
    xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            itemState.classList.remove('loading');
            itemState.classList.add('success');
            let data = JSON.parse(xhr.responseText);
            currentItem.dataset.pictureId = data.id;
            currentItem.classList.add('valid-file')

        } else {
            let data = JSON.parse(xhr.responseText);
            let errors = data.errors;

            const itemErrorContainer = currentItem.querySelector('.file-error > p')
            for (const error of errors) {
                itemErrorContainer.innerText = error.message;
            }

            itemState.classList.remove('loading');
            itemState.classList.add('failed');
            currentItem.classList.add('invalid-file')
        }

        if (index < files.length - 1) {
            upload(files, index+1, area, nbItemLoaded)
        }
    })

    xhr.open("POST", url, true)
    xhr.withCredentials = true;
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
    xhr.send(formData)
}
// user drop file on area
uploadDropArea.addEventListener('drop', function (e) {
    e.preventDefault();
    dragCounter = 0;
    let [...files] = e.dataTransfer.files;
    let index = 0;
    let nbItemLoaded = uploadItemArea.childElementCount;

    uploadDom(files, uploadItemArea)
    upload(files, index, uploadItemArea, nbItemLoaded)
    this.classList.remove('active')
})