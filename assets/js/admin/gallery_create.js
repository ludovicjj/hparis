import '../../styles/admin/gallery_create.scss';
import { CollectionHolder } from "../components/CollectionHolder";
import { imagePreview } from "../components/image_preview";
import Swal from 'sweetalert2'



const collectionHolder = new CollectionHolder({
    formClassName: '.upload-wrapper',
    deleteClassName: '.upload-remove',
    helperClassName: '.upload-help'
});

class GalleryForm {
    constructor(form, addUploadBtn) {
        this.form = form
        this.addUploadBtn = addUploadBtn;

        this.form.querySelectorAll('input[type="file"]').forEach(input => {
            input.addEventListener('change', (e) => {
                imagePreview(e, '.target-preview', '.image_label img')
            })
        })

        this.form.addEventListener('submit', this.handleSubmit.bind(this))
        this.form.addEventListener('reset', this.handleReset.bind(this))
        this.addUploadBtn.addEventListener('click', this.addUploadField)
    }

    async handleSubmit(e) {
        e.preventDefault();
        const url = this.form.getAttribute('action');

        this.removeInvalidFeedback();
        this.removeInvalidStyle();
        this.disableSubmit(true);
        this.clearEmptyCollection();

        const response = await this.send(url, 'POST', new FormData(form))
        this.disableSubmit(false);

        if (!response.ok) {
            const errors = await response.json();
            const transformedErrors = this.transformPropertyErrors(errors.errors)
            this.displayErrors(transformedErrors)
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

        // remove each upload form into collection
        const uploadCollection = this.form.querySelector('.uploads-grid');
        uploadCollection.querySelectorAll('.upload-wrapper').forEach(upload => {
            uploadCollection.removeChild(upload);
        })

        // display upload help
        const helper = uploadCollection.querySelector('.upload-help');
        helper.animate([
            {
                transform: 'translate(170px)',
                opacity: 0
            },
            {
                transform: 'none',
                opacity: 1
            },
        ], {
            duration: 400,
            easing: 'ease-in-out',
            fill: 'both'
        });
        window.setTimeout(_ => {
            helper.classList.remove('hidden');
        }, 400)
    }

    clearEmptyCollection() {
        const uploadCollection = this.form.querySelector('.uploads-grid');

        uploadCollection.querySelectorAll('input[type="file"]').forEach(inputFileUploads => {
            if (!inputFileUploads.files.length) {
                let upload = inputFileUploads.closest('.upload-wrapper');
                upload.parentNode.removeChild(upload);
            }
        })
    }

    addUploadField(e) {
        collectionHolder.addFormToCollection(e)
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
const addUploadBtn = document.querySelector('#new-upload');
new GalleryForm(form, addUploadBtn)