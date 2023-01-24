import '../../styles/admin/gallery_create.scss';
import { imagePreview } from "../components/image_preview";
import Swal from 'sweetalert2'


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

        const response = await this.send(url, 'POST', new FormData(form))
        this.disableSubmit(false);

        if (!response.ok) {
            const errors = await response.json();
            console.log(errors)
            //const transformedErrors = this.transformPropertyErrors(errors.errors)
            //this.displayErrors(transformedErrors)
        } else {
            this.form.reset();
            Swal.fire({
                icon: 'success',
                title: 'Bravo',
                text: 'Votre galerie a été créée avec success !',
                confirmButtonColor: '#4869ee',
                confirmButtonText: 'Cool'
            })
        }
    }

    displayErrors(errors) {
        const UploadCollectionHolder = this.form.querySelector('.uploads-grid');
        const uploadForms = Array.from(UploadCollectionHolder.querySelectorAll('.upload-wrapper'));

        errors.forEach(error => {
            let field;
            if (error?.type === "collection") {
                field = uploadForms[error.position];
            } else {
                field = document.querySelector(`input[name="${error.property}"]`)
            }

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
                    .replace('pictures', 'uploads')
                    .replace(regex, (match, field, child) => {
                        return field ? field : "[" + child.slice(1) + "]"
                    })
                error.property = property + '[file]';
                error.parentClass = 'target-preview'
            }

            // collection
            if (property.startsWith('uploads')) {
                let position = error.property.match(/\d+/)
                error.type = 'collection';
                error.position = position[0]
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
const uploadDropArea = form.querySelector('.upload-drop-area');
const uploadInput = uploadDropArea.querySelector('#uploads');
const uploadBtn = uploadDropArea.querySelector('.upload-drop-area_btn');
const uploadInfo = uploadDropArea.querySelector('.upload-drop-area_info');
const uploadAdd = uploadDropArea.querySelector('.upload-drop-area_btn__add');
let dragCounter = 0;
let files;

uploadBtn.addEventListener('click', () => {
    uploadInput.click();
})

// upload file change
uploadInput.addEventListener('change', (e) => {
    const uploadsField = e.currentTarget;
    const files = uploadsField.files;
    console.log(files);
})

// user drag file enter into area
uploadDropArea.addEventListener('dragenter', (e) => {
    dragCounter++;
    let dropzone = e.currentTarget
    dropzone.classList.add('active')

    uploadBtn.animate([
        {transform: 'scale(1,1)'},
        {transform: 'scale(1.2,1.2)', marginBottom:'12px', marginTop: '12px'},
    ], {
        duration: 300,
        easing: 'ease-in-out',
        fill: 'both'
    })
    uploadAdd.animate([
        {transform: 'rotate(0deg)'},
        {transform: 'rotate(180deg)'},
    ], {
        duration: 400,
        easing: 'ease-in-out',
        fill: 'both'
    })
    
})

uploadDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
})

// user drag file out area
uploadDropArea.addEventListener('dragleave', (e) => {
    dragCounter--;
    if (dragCounter === 0) {
        e.currentTarget.classList.remove('active')
    }
    uploadBtn.animate([
        {transform: 'scale(1.2,1.2)', marginBottom:'12px', marginTop: '12px'},
        {transform: 'scale(1,1)', marginBottom:'0', marginTop: '0'}
    ], {
        duration: 300,
        easing: 'ease-in-out',
        fill: 'both'
    })
})

// user drop file on area
uploadDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadAdd.animate([
        {transform: 'rotate(180deg)'},
        {transform: 'rotate(0deg)'},
    ], {
        duration: 400,
        easing: 'ease-in-out',
        fill: 'both'
    })
    uploadBtn.animate([
        {transform: 'scale(1.2,1.2)', marginBottom:'12px', marginTop: '12px'},
        {transform: 'scale(1,1)', marginBottom:'0', marginTop: '0'}
    ], {
        duration: 300,
        easing: 'ease-in-out',
        fill: 'both'
    })

    files = e.dataTransfer.files
    let filesArray = [...files];
    const fileNumber = filesArray.length;

    // test extension
    let validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    let validResultType = false;

    for (const file of filesArray) {
        const fileType = file.type
        if (!validTypes.includes(fileType)) {
            validResultType = false
            break;
        }
        validResultType = true
    }

    if (!validResultType) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Seuls les fichiers JPG, PNG et GIF sont autorisés.',
            confirmButtonColor: '#DC3545FF',
            confirmButtonText: 'ok'
        })
        uploadInput.value = null;
        resetInfoUpload();
    } else {
        updateInfoUpload(fileNumber);
        uploadInput.files = files
    }
    dragCounter = 0
    e.currentTarget.classList.remove('active')
})

const updateInfoUpload = (fileNumber = null, message = null) => {
    if (fileNumber) {
        uploadInfo.innerText = `Vous avez sélectionné ${fileNumber} fichier${fileNumber > 1 ?'s' : ''}`;
    } else {
        uploadInfo.innerText = message;
    }

}
const resetInfoUpload = () => {
    uploadInfo.innerText = "Glisser et déposer vos fichiers ici"
}

new GalleryForm(form)