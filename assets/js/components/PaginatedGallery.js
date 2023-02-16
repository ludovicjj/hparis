import { getPaginationLinks, getPaginationHTML, sendRequest } from "./PaginationHelper";
import { Tooltip } from 'bootstrap';

class PaginatedGallery
{
    /**
     *
     * @param {HTMLElement} galleryContainer
     * @param {HTMLElement} paginationContainer
     */
    constructor(galleryContainer, paginationContainer) {
        this.galleryContainer = galleryContainer
        this.paginationContainer = paginationContainer
        this.itemPerPage = parseInt(this.galleryContainer.dataset.perPage)
        this.url = this.galleryContainer.dataset.url

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
        this.loadGallery(page)
    }

    loadGallery(page) {
        const url = this.url + `?page=${page}`
        const options = {headers: { "Accept": "application/json"} }
        const fragment = document.getElementById('gallery-card-template').content

        sendRequest(url, 'GET', options).then(galleries => {
            this.galleryContainer.replaceChildren();
            galleries.forEach(gallery => {
                const cardTemplate = fragment.cloneNode(true)
                cardTemplate.querySelector('.gallery-thumbnail').setAttribute('src', `/uploads/thumbnails/${gallery.thumbnail.imageName}`)

                const updatePath = cardTemplate.querySelector('.gallery-update').getAttribute('href');
                cardTemplate.querySelector('.gallery-update').setAttribute('href', updatePath.replace("@id", gallery.id))

                this.galleryContainer.appendChild(cardTemplate);
            })
        }).catch(err => {

        }).finally(_ => {
            this.galleryContainer.removeAttribute('style')
            this.galleryContainer.classList.remove('loading')

            this.galleryContainer.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => {
                new Tooltip(tooltipTriggerEl)
            })
        })
    }
}

export default PaginatedGallery;