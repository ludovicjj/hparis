import { image_preview } from "./image_preview";
import  { CategorySelect }  from "./CategorySelect"
import Swal from "sweetalert2";

class GalleryForm {
    /**
     * @param {HTMLFormElement} form
     * @param {boolean} isUpdate
     */
    constructor(form, isUpdate= false) {
        this.form = form
        this.isUpdate = isUpdate

        this.form.querySelector('#thumbnail_imageFile').addEventListener('change', (e) => {
            image_preview(e, '.target-preview', '.image_label img')
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

        const formData = new FormData(this.form)

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
            const options = {
                icon: 'success',
                title: 'Bravo',
                text: 'Votre galerie a été créée avec success !',
                confirmButtonColor: '#4869ee',
                confirmButtonText: 'Cool'
            }

            if (!this.isUpdate) {
                Swal.fire(options).then(_ => {
                    this.form.reset();
                })
            } else {
                options.text = 'Votre galerie a été modifiée avec success !'
                Swal.fire(options).then(_ => {
                    location.assign(this.form.dataset.redirect)
                })
            }
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
     * Transform property name to match with field name
     * @param {Object[]} errors
     * @return {Object[]}
     */
    transformPropertyErrors(errors) {
        const regex = /(^\w+)|(\.\w+)/g;

        return errors.map(error => {
            let property = error.property;

            error.parentClass = property

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

        // clear category
        CategorySelect.clear();
    }

    /**
     * Create error message with bootstrap style
     * @param {string} message
     * @return {HTMLElement}
     */
    createInvalidFeedback(message) {
        const invalidFeedBack = document.createElement('div');
        invalidFeedBack.classList.add('invalid-feedback');
        invalidFeedBack.innerText = message;
        return invalidFeedBack;
    }

    /**
     * Remove all error message
     */
    removeInvalidFeedback() {
        this.form.querySelectorAll('.invalid-feedback').forEach(feedback => {
            feedback.remove();
        })
    }

    /**
     * Remove invalid style
     */
    removeInvalidStyle() {
        this.form.querySelectorAll('.is-invalid').forEach(element => {
            element.classList.remove('is-invalid');
        })
    }

    /**
     * Enable or diable submit button
     * @param {boolean} state
     */
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

export default GalleryForm;