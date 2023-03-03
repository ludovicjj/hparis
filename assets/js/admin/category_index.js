import '../../styles/admin/category_index.scss';
import { sendRequest } from "../components/PaginationHelper";

const form = document.getElementById('category-form')
const categoryField = document.getElementById('name')
const categoryHelper = document.getElementById('name_help')
const categoryTemplate = document.getElementById('category-template')
const categoryContainer = document.querySelector('.category-wrapper');

form.addEventListener('submit',  (e) => {
    e.preventDefault();
    const url = form.dataset.url
    const data = Object.fromEntries(new FormData(form).entries());
    const headers = {"Content-Type": "application/json", "Accept": "application/json"}
    const body = JSON.stringify(data)
    resetError()

    sendRequest(url, 'POST', {headers, body}).then(data => {
        form.reset();
        categoryHelper.style.display = "block"

        createCategory(data)
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

    const badge = template.querySelector('.badge')
    const text = document.createTextNode(data.name)
    badge.parentNode.insertBefore(text, badge)

    categoryContainer.appendChild(template);
}