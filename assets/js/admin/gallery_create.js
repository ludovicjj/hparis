import '../../styles/admin/gallery_create.scss';
import { addFormToCollection } from "../components/collection_holder";
import { imagePreview } from "../components/image_preview";
import Swal from 'sweetalert2'


//let result = originalProperty.split('.').map((prop, index) => index > 0 ? `[${prop}]` : prop).join('');

const form = document.querySelector('#form-gallery');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    submit.setAttribute('disabled', 'disabled')

    const url = form.getAttribute('action');
    fetch(url, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: new FormData(form)
    }).then(async response => {
        submit.removeAttribute('disabled');
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        // clear invalid-feedback
        removeInvalidFeedback();
        // clear invalid style
        removeInvalidStyle();

        if (response.ok) {
            form.reset();
            Swal.fire({
                icon: 'success',
                title: 'Bravo',
                text: 'Votre galerie a été créée avec success !',
                confirmButtonColor: '#4869ee',
                confirmButtonText: 'Cool'
            })
        } else {
            return Promise.reject(data.errors);
        }
    }).catch(errors => {
        const transformedErrors = transformProperty(errors);
        transformedErrors.forEach(error => {
            const field = document.querySelector(`input[name="${error.property}"]`)
            field.classList.add('is-invalid');

            const invalidFeedBack = document.createElement('div');
            invalidFeedBack.classList.add('invalid-feedback');
            invalidFeedBack.innerHTML = error.message;

            const parentField = field.closest(`.${error.parentClass}`);
            parentField.appendChild(invalidFeedBack);
            parentField.classList.add('is-invalid');
        })
        // errors.forEach((error) => {
        //     let parentClass = error.property;
        //     if (error.property.includes('.')) {
        //         let transformedProperty = error.property.replace(/(^\w+)|(\.\w+)/g, (match, p1, p2) => {
        //             if (p1) {
        //                 parentClass = p1;
        //             }
        //             return p1 ? p1 : "[" + p2.slice(1) + "]"
        //         });
        //         error.property = `${transformedProperty}[file]`;
        //         parentClass = 'target-preview';
        //     }
        //
        //     const field = document.querySelector(`input[name="${error.property}"]`)
        //     field.classList.add('is-invalid');
        //     const invalidFeedBack = document.createElement('div');
        //     invalidFeedBack.classList.add('invalid-feedback');
        //     invalidFeedBack.innerHTML = error.message;
        //     const parentField = field.closest(`.${parentClass}`);
        //     parentField.appendChild(invalidFeedBack);
        //     parentField.classList.add('is-invalid');
        // })
    })
})

const removeInvalidFeedback = () => {
    form.querySelectorAll('.invalid-feedback').forEach(feedback => {
        feedback.remove();
    })
}
const removeInvalidStyle = () => {
    form.querySelectorAll('.is-invalid').forEach(element => {
        element.classList.remove('is-invalid');
    })
}
const transformProperty = (errors) => {
    errors.forEach(error => {
        if (error.property.includes('.')) {
            const regex = /(^\w+)|(\.\w+)/g;

            const transformedProperty = error.property.replace(regex, (match, field, child) => {
                return field ? field : "[" + child.slice(1) + "]"
            }).replace('pictures', 'uploads');

            error.property = `${transformedProperty}[file]`
            error.parentClass = 'target-preview'
        } else {
            error.parentClass = error.property
        }
    })
    return errors
}

// Reset form
form.addEventListener('reset', () => {
    // clear thumbnail
    const thumbnail = form.querySelector('.thumbnail img');
    thumbnail.setAttribute('src', thumbnail.dataset.origin);
})

// Load preview image
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', (e) => {
        imagePreview(e, '.target-preview', '.image_label img')
    })
})

// Add upload field
document.querySelector('#new-upload').addEventListener('click', (e) => {
    addFormToCollection(e, '.upload-wrapper', '.upload-remove')
});
