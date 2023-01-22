import { imagePreview } from "./image_preview";
import { Flip } from "./Flip";

class CollectionHolder {
    /**
     * @param {Object} options
     */
    constructor(options) {
        this.options = Object.assign(options, {})
    }

    removeFormToCollection(e) {
        const formToDelete = e.currentTarget.closest(this.options.formClassName);
        let forms = Array.from(this.collectionHolder.querySelectorAll(this.options.formClassName))
        let flip = new Flip();

        flip.read(forms);
        flip.remove([formToDelete]);
        forms = forms.filter(form => form !== formToDelete)
        flip.play(forms)

        // show helper
        if (!forms.length) {
            this.showHelper();
        }
    }

    addFormToCollection(e) {
        this.collectionHolder = document.querySelector('.' + e.currentTarget.dataset.collectionHolderClass);
        let prototype = this.collectionHolder.dataset.prototype;
        let index = this.collectionHolder.dataset.index;

        // remove to collection
        let form = this.parsePrototypeToHtml(prototype, index);
        form.querySelector(this.options.deleteClassName).addEventListener('click', this.removeFormToCollection.bind(this))

        // hide helper
        this.hideHelper();

        // enable preview image
        form.querySelector('input[type="file"]').addEventListener('change', (e) => {
            imagePreview(e, this.options.formClassName, '.image_label img')
        })


        this.collectionHolder.appendChild(form)
        this.collectionHolder.dataset.index++;
    }

    /**
     * Parse prototype to HTMLDocument
     * Select and return HTMLElement from HTMLDocument
     * @param {string} prototype
     * @param {string} index
     * @return {HTMLElement}
     */
    parsePrototypeToHtml(prototype, index) {
        let parser = new DOMParser();
        let prototypeHtmlText = prototype.replace(/__name__/g, index);
        let htmlDocument = parser.parseFromString(prototypeHtmlText, 'text/html');
        return htmlDocument.querySelector(this.options.formClassName)
    }

    hideHelper() {
        let helper = this.collectionHolder.querySelector(this.options.helperClassName);
        if (!helper.classList.contains('hidden')) {
            helper.classList.add('hidden');
            helper.animate([
                {
                    transform: 'translate(0)',
                    opacity: 1
                },
                {
                    transform: 'translate(170px)',
                    opacity: 0
                },
            ], {
                duration: 300,
                easing: 'ease-in-out',
                fill: 'both'
            })
        }
    }

    showHelper() {
        let helper = this.collectionHolder.querySelector(this.options.helperClassName);
        let position = this.collectionHolder.getBoundingClientRect();
        this.collectionHolder.style.height = position.height +'px';
        helper.animate([
            {
                transform: 'translate(170px)',
                opacity: 0
            },
            {
                transform: 'none',
                opacity: 1
            },
        ], {
            duration: 400,
            easing: 'ease-in-out',
            fill: 'both'
        });

        window.setTimeout(_ => {
            helper.classList.remove('hidden');
            this.collectionHolder.style.height = '112px';
        }, 400)
        // clear height style :
        // timeout above => 400ms + transition height =>  400ms (css) = 900ms
        window.setTimeout(_ => {
            this.collectionHolder.style = "";
        }, 800)
    }
}

export { CollectionHolder };