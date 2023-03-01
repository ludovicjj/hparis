import { getPaginationLinks, getPaginationHTML, sendRequest } from "./PaginationHelper";
import { Tooltip } from 'bootstrap';
import Swal from "sweetalert2";

class PaginatedGallery
{
    /**
     * @param {HTMLElement} galleryContainer
     * @param {HTMLElement} paginationContainer
     * @param {HTMLElement} filterContainer
     */
    constructor(galleryContainer, paginationContainer, filterContainer) {
        this.galleryContainer = galleryContainer
        this.paginationContainer = paginationContainer
        this.filterContainer = filterContainer

        this.currentPage = parseInt(galleryContainer.dataset.page)
        this.itemPerPage = parseInt(this.galleryContainer.dataset.perPage)
        this.totalItems = parseInt(this.galleryContainer.dataset.total)
        this.category = null;
        this.url = this.galleryContainer.dataset.url;

        // delete
        this.galleryContainer.querySelectorAll('.gallery-delete').forEach(deleteBtn => {
            deleteBtn.addEventListener('click', this.handleDelete.bind(this))
        })

        // filter gallery
        this.filterContainer.querySelectorAll('a.category').forEach(category => {
            category.addEventListener('click', this.handleCategoryChange.bind(this))
        })

        this.buildPagination()
    }

    /**
     * Make HTML Links for pagination
     * Needed variables :
     * - totalItems(dynamique)
     * - ItemsPerPage(fixe)
     * - currentPage(dynamique)
     */
    buildPagination () {
        this.paginationContainer.replaceChildren();
        this.totalPage = Math.ceil(this.totalItems / this.itemPerPage);
        let paginationLinks = getPaginationLinks(this.currentPage, this.totalPage);

        const links = paginationLinks.map(link => {
            return getPaginationHTML(link, this.currentPage)
        })


        links.forEach(link => {
            if (!link.classList.contains('disabled')) {
                link.addEventListener('click', this.handlePageChange.bind(this))
            }
            this.paginationContainer.appendChild(link)
        })
    }

    /**
     * Handle change page
     * @param {PointerEvent} e
     */
    handlePageChange (e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page
        this.updateCurrentPage(page)

        this.loadGallery(this.currentPage, this.category)
    }

    /**
     * @param {PointerEvent} e
     */
    handleCategoryChange (e) {
        e.preventDefault()
        this.filterContainer.querySelector('a.category.active')?.classList.remove('active')
        e.currentTarget.classList.add('active');

        this.updateCurrentPage('1')
        console.log(this.currentPage);

        this.category = e.currentTarget.dataset.category
        this.loadGallery(this.currentPage, this.category)
    }

    handleDelete (e) {
        e.preventDefault();
        const deleteLink = e.currentTarget;
        const url = deleteLink.href
        const count = this.galleryContainer.childElementCount;
        let refresh = false
        const tooltip = Tooltip.getInstance(deleteLink)
        tooltip.disable()

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
                const body = JSON.stringify({page: this.currentPage, count, category: this.category});
                const headers = { "Accept": "application/json", "Content-Type": "application/json"}
                deleteLink.closest('.gallery-card').classList.add('remove')

                if (count === 1 && this.totalPage > 1) {
                    refresh = true
                    this.updateCurrentPage((this.currentPage - 1).toString())
                }

                return sendRequest(url, 'DELETE', {headers, body}).then( async ({gallery, total}) => {
                    // update total
                    this.totalItems = total || 0
                    this.galleryContainer.dataset.total = (total).toString()

                    // remove tooltip
                    tooltip.dispose()

                    // remove gallery
                    deleteLink.closest('.gallery-card').parentElement.remove()

                    //display gallery on next page
                    if (gallery.length > 0) {
                        await this.createGallery(gallery)
                    }

                    //refresh
                    if (refresh) {
                        console.log('page is empty, load data from previous page')
                        this.loadGallery(this.currentPage, this.category)
                    }

                    this.buildPagination();
                })
            } else {
                tooltip.enable()
            }
        }).catch(err => {
            console.error(err)
        }).finally(_ => {
            this.displayAlertIfEmptyGalleries(this.totalItems)
        })
    }


    /**
     * @param {number} page
     * @param {string|null} category
     */
    loadGallery(page, category = null) {
        const url = this.url + `?page=${page}` + (category ? `&c=${encodeURIComponent(category)}` : '')
        const options = {headers: { "Accept": "application/json"} }

        this.loadingStyle();

        sendRequest(url, 'GET', options).then( async ({galleries, total}) => {
            this.totalItems = total || 0
            this.galleryContainer.replaceChildren();
            this.galleryContainer.dataset.total = (this.totalItems).toString()

            this.displayAlertIfEmptyGalleries(galleries.length) // not sure here

            this.buildPagination()
            await this.createGallery(galleries)
        }).catch(err => {
            console.error(err)
        }).finally(_ => {
            this.loadingStyle();
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
     * @return {Promise<string>}
     */
    async createGallery(galleries) {

        return new Promise((resolve) => {
            if (galleries.length === 0) {
                resolve('empty galleries')
            }
            this.onLoadGallery(galleries, resolve)
        })
    }

    onLoadGallery (galleries, resolve) {
        for (let i = 0; i < galleries.length; i++) {
            const fragment = document.getElementById('gallery-card-template').content
            const gallery = galleries[i]
            const cardTemplate = fragment.cloneNode(true)

            // update links
            cardTemplate.querySelectorAll('a').forEach(link => {
                link.setAttribute(
                    'href',
                    link.getAttribute('href').replace("@id", gallery.id)
                )
            })

            // add delete event
            cardTemplate.querySelectorAll('.gallery-delete').forEach(link => {
                link.addEventListener('click', this.handleDelete.bind(this))
            })

            // tooltips
            cardTemplate.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => {
                new Tooltip(tooltipTriggerEl, {trigger: 'hover'})
            })

            // thumbnail
            const {thumbnail: {imageName}} = gallery
            const thumbnail = new Image()
            thumbnail.classList.add('gallery-thumbnail')
            thumbnail.src = `/uploads/thumbnails/${imageName}`

            cardTemplate.querySelector('.gallery-thumbnail').replaceWith(thumbnail)
            this.galleryContainer.appendChild(cardTemplate);

            if ((galleries.length - 1) === i) {
                thumbnail.onload = () => {
                    return resolve(`last image loaded, index: ${i} / ${galleries.length - 1} `)
                }
            }
        }
    }

    /**
     * Check given page
     * Change property currentPage and update data attr page to gallery container
     * @param {string} page
     */
    updateCurrentPage(page) {
        if (isNaN(parseInt(page))) {
            console.error('Invalid page.')
            return;
        }
        this.galleryContainer.dataset.page = page
        this.currentPage = parseInt(page)
    }

    /**
     * @param {number} count Gallery count
     */
    displayAlertIfEmptyGalleries (count) {
        if (count === 0) {
            const alert = this.createAlert("Il n'y a aucune galerie associée à cette catégorie.")
            this.galleryContainer.appendChild(alert);
        }
    }

    /**
     * Toggle loading style to gallery container
     */
    loadingStyle() {
        this.galleryContainer.classList.toggle('loading')

        if (this.galleryContainer.classList.contains('loading')) {
            this.galleryContainer.style.minHeight = "200px"
            this.galleryContainer.style.alignContent = "flex-start"
        } else {
            this.galleryContainer.removeAttribute('style')
        }
    }

}

export default PaginatedGallery;