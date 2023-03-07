import '../../styles/admin/category_index.scss';
import { sendRequest } from "../components/PaginationHelper";
import Swal from "sweetalert2";

const form = document.getElementById('category-form')
const categoryField = document.getElementById('name')
const categoryHelper = document.getElementById('name_help')
const categoryTemplate = document.getElementById('category-template')
const categoryContainer = document.querySelector('.category-wrapper');

function updateCategory(data) {
    const category = categoryContainer.querySelector(`[data-id="${data.id}"]`)
    category.dataset.name = data.name
    const badge = category.querySelector('.badge')
    category.firstChild.remove()

    const text = document.createTextNode(data.name)
    badge.parentNode.insertBefore(text, badge)
}

async function categoryAction(e) {
    e.preventDefault()
    const categoryBtn = e.currentTarget;
    const { name, url } = e.currentTarget.dataset

    const options = {
        icon: 'question',
        title: `${name}`,
        text: "Quelle action voulez vous apporter à cette catégorie ?",
        confirmButtonColor: '#4869ee',
        confirmButtonText: 'Modifier',
        showDenyButton: true,
        denyButtonText: 'Supprimer',
        showCancelButton: true,
        cancelButtonText: 'Annuler',
    }
    const headers = {'Accept': 'application/json'}

    const resultAlert = await Swal.fire(options)
    if (resultAlert.isDenied) {
        try {
            await sendRequest(url, 'DELETE', {headers})
            const options = {
                icon: 'success',
                title: 'Bravo',
                text: 'La catégorie a été supprimée avec succès.',
                confirmButtonColor: '#4869ee',
                confirmButtonText: 'Cool'
            }
            categoryBtn.parentNode.removeChild(categoryBtn)
            await Swal.fire(options)
        } catch (err) {
            const options = {
                icon: 'error',
                title: 'Oops...',
                text: 'Impossible de supprimer cette catégorie.',
                confirmButtonColor: '#4869ee',
                footer: `<p class="text-danger">${err.message}</p>`
            }
            await Swal.fire(options)
        }
    } else if (resultAlert.isConfirmed) {
        Swal.fire({
            input: 'text',
            inputLabel: 'Nom de la Catégorie',
            inputValue: `${name}`,
            inputAttributes: {
                autocapitalize: 'off',
            },
            showCancelButton: true,
            cancelButtonText: 'Annuler',
            confirmButtonText: 'Sauvegarder',
            confirmButtonColor: '#4869ee',
            showLoaderOnConfirm: true,
            preConfirm: (updatedName) => {
                const body = JSON.stringify({'name': updatedName})
                const headers = {'Accept': 'application/json', "Content-Type": "application/json"}

                return sendRequest(url, 'POST', {headers, body})
                    .then(data => {
                        return data
                    }).catch(err => {
                        if (err.code === 422) {
                            const errorMessages = err.errors.reduce((acc, error) => {
                                acc.push(error.message)
                                return acc
                            }, [])
                            Swal.showValidationMessage(`Erreurs: ${errorMessages.join('<br>')}`)
                        } else {
                            Swal.showValidationMessage(`Request failed: ${err.message}`)
                        }
                    })
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                updateCategory(result.value)
                const options = {
                    icon: 'success',
                    title: 'Bravo',
                    text: 'La catégorie a été modifiée avec succès.',
                    confirmButtonColor: '#4869ee',
                    confirmButtonText: 'Cool'
                }
                Swal.fire(options)
            }
        })
    }
}

categoryContainer.querySelectorAll('.btn-category').forEach(category => {
    category.addEventListener('click', categoryAction)
})

form.addEventListener('submit',  (e) => {
    e.preventDefault();
    const url = form.dataset.url
    const data = Object.fromEntries(new FormData(form).entries());
    const headers = {"Content-Type": "application/json", "Accept": "application/json"}
    const body = JSON.stringify(data)
    resetError()

    sendRequest(url, 'POST', {headers, body}).then(async data => {
        form.reset();
        categoryHelper.style.display = "block"
        createCategory(data)
        const options = {
            icon: 'success',
            title: 'Bravo',
            text: 'Votre catégorie a été créée avec success !',
            confirmButtonColor: '#4869ee',
            confirmButtonText: 'Cool'
        }
        await Swal.fire(options)
    }).catch(err => {
        categoryField.classList.add('is-invalid')
        categoryHelper.style.display = "none"

        err.errors.forEach(error => {
            const feedback = document.createElement('div')
            feedback.classList.add('invalid-feedback')
            feedback.textContent = error.message
            categoryField.parentElement.appendChild(feedback)
        })
    })
})

function resetError() {
    form.querySelectorAll('.invalid-feedback').forEach(feedback => feedback.remove())
    categoryField.classList.remove('is-invalid')
}

function createCategory(data) {
    const fragment = categoryTemplate.content
    const template = fragment.cloneNode(true)

    // Update data attr
    const categoryBtn = template.querySelector('.btn-category')
    categoryBtn.dataset.name = data.name
    categoryBtn.dataset.url = categoryBtn.dataset.url.replace('@id', data.id);
    categoryBtn.dataset.id = categoryBtn.dataset.id.replace('@id', data.id);

    // Event
    categoryBtn.addEventListener('click', categoryAction)

    const badge = template.querySelector('.badge')
    const text = document.createTextNode(data.name)
    badge.parentNode.insertBefore(text, badge)

    categoryContainer.appendChild(template);
}