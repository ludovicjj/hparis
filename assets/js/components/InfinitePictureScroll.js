import {Lightbox} from "./Lightbox";

export class InfinitePictureScroll {
    /**
     *
     * @param {number} perPage
     * @param {string} watcherClassName
     * @param {string} containerClassName
     */
    constructor(perPage, watcherClassName, containerClassName) {
        this.perPage = perPage
        this.watcher = document.querySelector(watcherClassName)
        this.container = document.querySelector(containerClassName)

        this.lightbox = new Lightbox()

        if (!this.watcher || !this.container) {
            return
        }
        this.galleryId = this.container.dataset.gallery
        this.page = parseInt(this.container.dataset.page)
        this.url = this.container.dataset.url

        new IntersectionObserver(this.handleIntersect.bind(this)).observe(this.watcher)
    }

    handleIntersect(entries) {
        if (entries[0].isIntersecting) {
            this.page++
            this.watcher.classList.add('loading')
            this.addContent().then(_ => {
                this.watcher.classList.remove('loading')
            })
        }
    }

    async addContent() {
        const url = this.url + `?id=${encodeURIComponent(this.galleryId)}&page=${encodeURIComponent(this.page)}&count=${this.perPage}`
        const data = await this.fetchData(url);

        if (data) {
            const links = data.map(({imageName}) => {
                return this.createPicture(imageName)
            })
            this.lightbox.add(links)
            if (!data.length || data.length !== this.perPage) {
                this.watcher.remove()
            }
        }
    }

    async fetchData(url) {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        });

        return (
            response.headers.has('content-type') &&
            response.headers.get('content-type') === 'application/json'
        ) ? await response.json() : null
    }

    createPicture(imageName) {
        const div = document.createElement('div');
        div.classList.add('col-6', 'col-sm-4', 'col-md-3', 'mb-4')

        const card = document.createElement('div')
        card.classList.add('card', 'gallery-card')

        const link = document.createElement('a')
        link.setAttribute('href', `/uploads/pictures/${imageName}`)

        const picture = new Image()
        picture.className = 'picture'
        picture.src =`/uploads/pictures/${imageName}`

        link.appendChild(picture)
        card.appendChild(link)
        div.appendChild(card)
        this.container.querySelector('.row').appendChild(div)

        return link
    }
}