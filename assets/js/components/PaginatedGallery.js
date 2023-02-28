import { getPaginationLinks, getPaginationHTML, sendRequest } from "./PaginationHelper";
import { Tooltip } from 'bootstrap';
import Swal from "sweetalert2";

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

        this.galleryContainer.querySelectorAll('.gallery-delete').forEach(deleteBtn => {
            deleteBtn.addEventListener('click', this.handleDelete.bind(this))
        })

        this.itemPerPage = parseInt(this.galleryContainer.dataset.perPage)
        this.url = this.galleryContainer.dataset.url;

        this.filterContainer.querySelectorAll('a.category').forEach(category => {
            category.addEventListener('click', this.handleFilter.bind(this))
        })

        this.buildPagination()
    }

    handleDelete(e) {
        e.preventDefault();
        const deleteLink = e.currentTarget;
        const url = deleteLink.href
        const page = this.galleryContainer.dataset.page
        const count = this.galleryContainer.childElementCount;

        Swal.fire({
            icon: 'question',
            title: 'Supprimer ?',
            text: 'Êtes-vous sûr de supprimez cette galerie ?',
            showCancelButton: true,
            confirmButtonColor: '#4869ee',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non'
        }).then(result => {
            if (result.isConfirmed) {
                const body = JSON.stringify({page, count, category: this.category});
                const headers = { "Accept": "application/json", "Content-Type": "application/json"}

                return sendRequest(url, 'DELETE', {headers, body}).then(({gallery, total}) => {
                    if (total === null) {
                        total = 0
                    }
                    // remove tooltip
                    Tooltip.getInstance(deleteLink).dispose()
                    // remove gallery
                    deleteLink.closest('.gallery-card').parentElement.remove()
                    // display gallery on next page
                    if (gallery.length > 0) {
                        this.createGallery(gallery)
                    }
                    // update total
                    this.galleryContainer.dataset.total = (total).toString()
                    this.buildPagination();
                })
            }
        }).catch(err => {
            console.error(err)
        }).finally(_ => {
            if (this.galleryContainer.dataset.total < 1) {
                const alert = this.createAlert("Il n'y a aucune galerie associée à cette catégorie.")
                this.galleryContainer.appendChild(alert);
            }
        })
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

        sendRequest(url, 'GET', options).then(({galleries, total}) => {
            if (total === null) {
                total = 0
            }
            this.galleryContainer.replaceChildren();
            if (galleries.length === 0) {
                const alert = this.createAlert("Il n'y a aucune galerie associée à cette catégorie.")
                this.galleryContainer.appendChild(alert);

            }
            this.createGallery(galleries)

            this.galleryContainer.dataset.total = (total).toString()
            this.buildPagination()
        }).catch(err => {
            console.error(err)
        }).finally(_ => {
            this.galleryContainer.removeAttribute('style')
            this.galleryContainer.classList.remove('loading')
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

    /**
     * @param {Object[]} galleries
     */
    createGallery(galleries) {
        const fragment = document.getElementById('gallery-card-template').content
        galleries.forEach(gallery => {
            const cardTemplate = fragment.cloneNode(true)

            // update links
            cardTemplate.querySelectorAll('a').forEach(link => {
                link.setAttribute(
                    'href',
                    link.getAttribute('href').replace("@id", gallery.id)
                )
            })

            // update thumbnail
            cardTemplate.querySelector('.gallery-thumbnail').setAttribute('src', `/uploads/thumbnails/${gallery.thumbnail.imageName}`)

            // add delete event
            cardTemplate.querySelectorAll('.gallery-delete').forEach(link => {
                link.addEventListener('click', this.handleDelete.bind(this))
            })

            // tooltips
            cardTemplate.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => {
                new Tooltip(tooltipTriggerEl, {trigger: 'hover'})
            })

            this.galleryContainer.appendChild(cardTemplate);
        })
    }
}

export default PaginatedGallery;