import '../../styles/admin/gallery_create.scss';
import Swal from 'sweetalert2'

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
    }).then(response => {
        submit.removeAttribute('disabled');
        if (response.ok) {
            form.reset();
            Swal.fire({
                icon: 'success',
                title: 'Bravo',
                text: 'Votre galerie a été créée avec success !',
                confirmButtonColor: '#4869ee',
                confirmButtonText: 'Cool'
            })
        }
    })
})
form.addEventListener('reset', () => {
    const thumbnail = form.querySelector('.thumbnail img');
    thumbnail.setAttribute('src', thumbnail.dataset.origin);
})

// Load preview image
const handleChange = (e) => {
    let inputFile = e.currentTarget;
    let imageLabel = inputFile.closest('.target-preview').querySelector('.image_label img');

    if (inputFile.files && inputFile.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            imageLabel.setAttribute('src', e.target.result);
        }
        reader.readAsDataURL(inputFile.files[0]);
    }
}

document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', handleChange)
})