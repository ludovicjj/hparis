class PaginatedPicture {

    /**
     *
     * @param {HTMLElement} pictureContainer
     * @param {HTMLElement} paginationContainer
     */
    constructor(pictureContainer, paginationContainer) {
        this.pictureContainer = pictureContainer
        this.paginationContainer = paginationContainer
        this.itemPerPage = parseInt(this.pictureContainer.dataset.perPage)
        this.galleryId = parseInt(this.pictureContainer.dataset.gallery)
        this.url = this.pictureContainer.dataset.url

        this.buildPagination()
        this.pictureContainer.querySelectorAll('.picture-delete').forEach(btn => {
            btn.addEventListener('click', this.deletePicture.bind(this))
        })
    }

    buildPagination () {
        const currentPage = parseInt(this.pictureContainer.dataset.page);
        this.totalItems = parseInt(this.pictureContainer.dataset.total)
        this.totalPage = Math.ceil(this.totalItems / this.itemPerPage);

        let paginationLinks = this.getPaginationLinks(currentPage, this.totalPage);
        this.paginationContainer.replaceChildren();

        paginationLinks.forEach(link => {
            const linkHTML = this.getPaginationHTML(link, currentPage)
            this.paginationContainer.appendChild(linkHTML)
        })
    }

    /**
     * get pages with range
     * @param {number} currentPage
     * @param {number} totalPage
     * @return {array}
     */
    getPaginationLinks(currentPage, totalPage) {
        const delta = 2;
        const pages = [...Array(totalPage + 1).keys()].slice(1);
        const index = pages.findIndex(page => page === currentPage);
        const start = Math.max(index - delta, 0)
        const end = Math.min(index + delta + 1, totalPage - 1)
        const range = (totalPage - delta) -1

        if ( range < delta) {
            return [...pages.slice(0)];
        }

        let links
        if (currentPage < range) {
            links = [...pages.slice(start, end), '...', totalPage];
        } else {
            links = [...pages.slice(start, end), totalPage];
        }

        if (links.findIndex(page => page === 2) === -1) {
            links = ['...', ...links];
        }
        if (links.findIndex(page => page === 1) === -1) {
            links = [1, ...links];
        }
        return links;
    }

    /**
     * Build Bootstrap-style pagination links
     * @param page
     * @param currentPage
     * @return {HTMLLIElement}
     */
    getPaginationHTML(page, currentPage) {
        let a = document.createElement('a');
        a.classList.add('page-link')
        a.innerText = page;
        a.setAttribute('href', '#')

        let li = document.createElement('li');
        li.classList.add('page-item')
        li.dataset.page = page
        if (Number.isNaN(Number(page))) {
            li.classList.add('disabled');
        }

        if (parseInt(currentPage) === page) {
            li.classList.add('active')
        }
        li.appendChild(a)

        if (!li.classList.contains('disabled')) {
            li.addEventListener('click', this.changePage.bind(this))
        }

        return li;
    }

    /**
     *
     * @param {PointerEvent} e
     */
    changePage(e) {
        e.preventDefault()

        const page = e.currentTarget.dataset.page

        if (page > this.totalPage) {
            console.error('Page not Found');
            return
        }

        this.pictureContainer.dataset.page = page
        this.pictureContainer.classList.add('loading')

        this.buildPagination()
        this.loadPictures(page)

    }

    loadPictures(page) {
        const url = this.url + `?page=${page}&id=${this.galleryId}`
        const options = {headers: { "Accept": "application/json"} }

        this.sendRequest(url, 'GET', options).then(pictures => {
            this.pictureContainer.replaceChildren();
            pictures.forEach(({id, imageName}) => {
                this.createPicture(id, imageName)
            })
        }).catch(err => {
            console.error(err)
        }).finally(_ => {
            this.pictureContainer.removeAttribute('style')
            this.pictureContainer.classList.remove('loading')
        })
    }

    /**
     *
     * @param {string }id
     * @param {string} imageName
     */
    createPicture(id, imageName) {
        const img = document.createElement('img')
        img.setAttribute('src', `/uploads/pictures/${imageName}`)

        const div = document.createElement('div');
        div.classList.add('picture-item')

        const btn = document.createElement('button');
        btn.classList.add('picture-delete');
        btn.setAttribute('type', 'button')
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i>'
        btn.dataset.pictureId = id

        btn.addEventListener('click', this.deletePicture.bind(this))

        div.appendChild(img)
        div.appendChild(btn)
        this.pictureContainer.appendChild(div)
    }

    deletePicture(e) {
        e.preventDefault()
        const pictureId = e.currentTarget.dataset.pictureId
        const count = this.pictureContainer.childElementCount;
        const page = this.pictureContainer.dataset.page
        const body = JSON.stringify({page, count, galleryId: this.galleryId});
        let refresh = false

        if (count === 1 && this.totalPage > 1) {
            refresh = true
            this.pictureContainer.dataset.page = (page - 1).toString()
            this.pictureContainer.style.height = `${this.pictureContainer.offsetHeight}px`
            this.pictureContainer.classList.add('loading')
        }

        e.currentTarget.closest('.picture-item').remove()

        const url = this.url + `/${pictureId}`
        const options = { headers: {"Content-Type": "application/json", "Accept": "application/json"}, body}

        this.sendRequest(url, 'DELETE', options)
            .then(nextPictures => {
                const updatedTotal = this.totalItems - 1
                this.pictureContainer.dataset.total = (updatedTotal).toString()
                this.totalItems = updatedTotal

                nextPictures.forEach(({id, imageName}) => {
                    this.createPicture(id, imageName)
                })

                if (refresh) {
                    setTimeout(() => {
                        this.loadPictures((page - 1).toString())
                    },200)
                }
            }).catch(err => {
            console.error(err)
        }).finally(_ => {
            if (!this.totalItems) {
                const alert = this.createAlert("Il n'y a actuellement aucune image dans la galerie.")
                this.pictureContainer.appendChild(alert)
            }

            this.buildPagination()
        })
    }

    /**
     *
     * @param {string} url
     * @param {string} method
     * @param {Object} options
     * @return {Promise<Object[]>}
     */
    async sendRequest(url, method, options = {}) {
        const params = {
            method,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                ...options?.headers
            },
            body: options?.body
        }

        const response = await fetch(url, params)
        const data = response.headers.get('content-type') === 'application/json' ? await response.json() : []

        if (response.ok) {
            return Promise.resolve(data)
        } else {
            return Promise.reject(data)
        }

    }

    /**
     *
     * @param {string} message
     * @return {HTMLDivElement}
     */
    createAlert(message) {
        const alert = document.createElement('div')
        alert.classList.add('alert', 'alert-primary', 'text-center')
        alert.setAttribute('role', 'alert')
        alert.innerText = message
        return alert
    }
}
export default PaginatedPicture