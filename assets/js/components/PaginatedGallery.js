import { getPaginationLinks, getPaginationHTML, sendRequest } from "./PaginationHelper";
import { Tooltip } from 'bootstrap';

class PaginatedGallery
{
    /**
     *
     * @param {HTMLElement} galleryContainer
     * @param {HTMLElement} paginationContainer
     * @param {HTMLElement} filterContainer
     */
    constructor(galleryContainer, paginationContainer, filterContainer) {
        this.galleryContainer = galleryContainer
        this.paginationContainer = paginationContainer
        this.filterContainer = filterContainer
        this.category = null;

        this.itemPerPage = parseInt(this.galleryContainer.dataset.perPage)
        this.url = this.galleryContainer.dataset.url;

        this.filterContainer.querySelectorAll('a.category').forEach(category => {
            category.addEventListener('click', this.handleFilter.bind(this))
        })

        this.buildPagination()
    }

    buildPagination () {
        const currentPage = parseInt(this.galleryContainer.dataset.page);
        this.totalItems = parseInt(this.galleryContainer.dataset.total)
        this.totalPage = Math.ceil(this.totalItems / this.itemPerPage);
        let paginationLinks = getPaginationLinks(currentPage, this.totalPage);
        this.paginationContainer.replaceChildren();

        const links = paginationLinks.map(link => {
            return getPaginationHTML(link, currentPage)
        })

        links.forEach(link => {
            if (!link.classList.contains('disabled')) {
                link.addEventListener('click', this.changePage.bind(this))
            }
            this.paginationContainer.appendChild(link)
        })
    }

    /**
     * @param {PointerEvent} e
     */
    handleFilter(e) {
        e.preventDefault()
        this.filterContainer.querySelector('a.category.active')?.classList.remove('active')
        this.galleryContainer.dataset.page = '1'

        e.currentTarget.classList.add('active');
        this.category = e.currentTarget.dataset.category

        this.loadGallery('1', this.category)
    }

    /**
     * Handle change page
     * @param {PointerEvent} e
     */
    changePage(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page

        if (page > this.totalPage) {
            console.error('Page not Found');
            return
        }

        this.galleryContainer.dataset.page = page
        this.galleryContainer.classList.add('loading')
        this.buildPagination()
        this.loadGallery(page, this.category)
    }

    /**
     * @param {string} page
     * @param {string|null} category
     */
    loadGallery(page, category = null) {
        let url = this.url + `?page=${page}` + (category ? `&c=${encodeURIComponent(category)}` : '')
        const options = {headers: { "Accept": "application/json"} }
        const fragment = document.getElementById('gallery-card-template').content

        sendRequest(url, 'GET', options).then(({galleries, total}) => {
            this.galleryContainer.replaceChildren();
            if (galleries.length === 0) {
                const alert = this.createAlert("Il n'y a aucune galerie associée à cette catégorie.")
                this.galleryContainer.appendChild(alert);

            }
            galleries.forEach(gallery => {
                const cardTemplate = fragment.cloneNode(true)
                cardTemplate.querySelector('.gallery-thumbnail').setAttribute('src', `/uploads/thumbnails/${gallery.thumbnail.imageName}`)

                const updatePath = cardTemplate.querySelector('.gallery-update').getAttribute('href');
                cardTemplate.querySelector('.gallery-update').setAttribute('href', updatePath.replace("@id", gallery.id))

                this.galleryContainer.appendChild(cardTemplate);
            })

            this.galleryContainer.dataset.total = (total).toString()
            this.buildPagination()
        }).catch(err => {
            console.error(err)
        }).finally(_ => {
            this.galleryContainer.removeAttribute('style')
            this.galleryContainer.classList.remove('loading')

            this.galleryContainer.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => {
                new Tooltip(tooltipTriggerEl)
            })
        })
    }

    /**
     *
     * @param message
     * @return {HTMLDivElement}
     */
    createAlert(message) {
        const alert = document.createElement('div')
        alert.classList.add('alert', 'alert-primary')
        alert.setAttribute('role', 'alert')
        alert.innerText = message;

        return alert
    }
}

export default PaginatedGallery;