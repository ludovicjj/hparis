class NavbarUi {
    /**
     * @param {HTMLElement} element
     * @param {string} hamburgerClass
     * @param {number} threshold
     */
    constructor(element, hamburgerClass, threshold = 50) {
        this.nav = element;
        this.navHeight = this.nav.getBoundingClientRect().height;
        this.threshold = threshold;
        this.hamburger = this.nav.querySelector(hamburgerClass)

        NavbarUi.init(this.nav)

        this.handleThrottle = this.throttle.bind(this);
        this.handleStyle = this.style.bind(this);
        this.handleClick = this.open.bind(this);

        window.addEventListener('scroll', this.handleThrottle(this.handleStyle, 500));
        this.hamburger?.addEventListener('click', this.handleClick)
    }

    static init (nav) {
        if (window.scrollY > window.innerHeight) {
            nav.classList.add('is-hidden')
        }
    }

    throttle(callback, limit) {
        let wait = false;
        let oldScrollY = window.scrollY;

        return ()  => {
            if (!wait) {
                wait = true;
                let scrollDirection = window.scrollY - oldScrollY;
                callback(scrollDirection);

                setTimeout(_ => {
                    wait = false;
                    oldScrollY = window.scrollY;
                    this.resetStyle(oldScrollY);
                }, limit)
            }
        }
    }

    style(scrollDirection) {
        // user scrolled down
        if (
            scrollDirection > 0 &&
            !this.nav.classList.contains('is-hidden') &&
            window.scrollY > (this.navHeight + this.threshold)
        ) {
            this.nav.classList.add('is-hidden');
            console.log('down');
        }

        // user scrolled up
        if (scrollDirection < 0 && this.nav.classList.contains('is-hidden')) {
            this.nav.classList.remove('is-hidden');
            this.nav.classList.add('is-fixed')
        }
    }

    resetStyle(scrollY) {
        if (
            scrollY < (this.navHeight) &&
            (this.nav.classList.contains('is-hidden') || this.nav.classList.contains('is-fixed'))
        ) {
            this.nav.classList.remove('is-hidden');
            this.nav.classList.remove('is-fixed');
        }
    }

    open() {
        this.nav.classList.toggle('is-open');
        if (this.nav.classList.contains('is-open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.removeProperty('overflow');
        }
    }
}
export default NavbarUi