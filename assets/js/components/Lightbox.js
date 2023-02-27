import '../../styles/components/_lightbox.scss';
import {enableBodyScroll, disableBodyScroll} from "./body_scroll_lock";

/**
 * @property {HTMLElement} lightbox
 * @property {string[]} imagesUrl
 * @property {?string} url
 */
export class Lightbox {

    constructor() {
        const links = Array.from(document.querySelectorAll('a[href$=".png"], a[href$=".jpg"], a[href$=".jpeg"], a[href$=".gif"]'));
        this.imagesUrl = links.map(link => link.getAttribute('href'));

        links.forEach(link => {
            link.addEventListener('click', this.displayLightbox.bind(this))
        })
    }

    /**
     * @param {PointerEvent} e
     */
    displayLightbox (e) {
        e.preventDefault();
        let url = e.currentTarget.getAttribute('href')
        this.lightbox = this.buildDOM(url)
        this.loadImage(url)

        document.body.appendChild(this.lightbox)
        disableBodyScroll(this.lightbox)
        document.addEventListener('keyup', this.onKeyUp)
    }

    /**
     *
     * @param {HTMLElement[]} links
     */
    add (links) {
        const addedLinks = links.map(link => link.getAttribute('href'));
        this.imagesUrl = [...this.imagesUrl, ...addedLinks]

        links.forEach(link => {
            link.addEventListener('click', this.displayLightbox.bind(this))
        })
    }

    // /**
    //  * @param {string} url URL de l'image visionné
    //  * @param {string[]} imagesUrl URL de toutes les images de la galerie
    //  */
    // constructor (url, imagesUrl) {
    //     this.lightbox = this.buildDOM(url)
    //     this.imagesUrl = imagesUrl
    //     console.log(this.imagesUrl)
    //
    //     this.onKeyUp = this.onKeyUp.bind(this);
    //     this.loadImage(url)
    //
    //     document.body.appendChild(this.lightbox)
    //     disableBodyScroll(this.lightbox)
    //     document.addEventListener('keyup', this.onKeyUp)
    // }


    loadImage (url) {
        this.url = null
        const image = new Image();
        const container = this.lightbox.querySelector('.lightbox_container')
        const loader = document.createElement('div')
        loader.classList.add('lightbox_loader');
        container.innerHTML = ''
        container.appendChild(loader)

        image.onload = () => {
            container.removeChild(loader)
            container.appendChild(image)
            this.url = url
        }
        image.src = url
    }

    /**
     * close lightbox
     * @param {PointerEvent|KeyboardEvent} e
     */
    close(e) {
        e.preventDefault()
        this.lightbox.classList.add('fadeOut')
        enableBodyScroll(this.lightbox)
        setTimeout(() => {
            this.lightbox.parentElement.removeChild(this.lightbox)
        }, 500)
        document.removeEventListener('keyup', this.onKeyUp)
    }

    /**
     * @param {KeyboardEvent} e
     */
    onKeyUp (e) {
        if (e.key === 'Escape') {
            this.close(e)
        } else if (e.key === 'ArrowLeft') {
            this.prev(e)
        } else if (e.key === 'ArrowRight') {
            this.next(e)
        }
    }

    /**
     * @param {PointerEvent|KeyboardEvent} e
     */
    next (e) {
        e.preventDefault()

        let index = this.imagesUrl.findIndex(url => url === this.url)
        if (index === this.imagesUrl.length - 1) {
            index = -1
        }
        this.loadImage(this.imagesUrl[index + 1])
    }

    /**
     * @param {PointerEvent|KeyboardEvent} e
     */
    prev (e) {
        e.preventDefault()
        let index = this.imagesUrl.findIndex(url => url === this.url)
        if (index === 0) {
            index = this.imagesUrl.length
        }
        this.loadImage(this.imagesUrl[index - 1])
    }

    /**
     * @param {string} url URL de l'image visionné
     * @return {HTMLElement}
     */
    buildDOM(url) {
        const div = document.createElement('div')
        div.classList.add('lightbox')

        div.innerHTML = `<button type="button" class="lightbox_close"><i class="fa-solid fa-xmark"></i></button>
        <button type="button" class="lightbox_next" title="Suivant"><i class="fa-solid fa-chevron-right"></i></button>
        <button type="button" class="lightbox_prev" title="Précédent"><i class="fa-solid fa-chevron-right"></i></button>
        <div class="lightbox_container"></div>`

        div.querySelector('.lightbox_close').addEventListener('click', this.close.bind(this))
        div.querySelector('.lightbox_prev').addEventListener('click', this.prev.bind(this))
        div.querySelector('.lightbox_next').addEventListener('click', this.next.bind(this))

        return div
    }
}