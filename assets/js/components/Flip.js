class Flip {
    constructor() {
        this.duration = 500
        this.position = {}
    }

    /**
     * Memo position foreach element
     * @param {HTMLElement[]} elements
     */
    read(elements) {
        elements.forEach(element => {
            const index = element.dataset.index;
            this.position[index] = element.getBoundingClientRect()
        })
    }

    /**
     *
     * @param {HTMLElement[]} elements
     */
    play(elements) {
        elements.forEach(element => {
            const index = element.dataset.index;
            const newPosition = element.getBoundingClientRect();
            const oldPosition = this.position[index];

            const deltaX = oldPosition.x - newPosition.x;
            const deltaY = oldPosition.y - newPosition.y;
            const deltaW = oldPosition.width / newPosition.width
            const deltaH = oldPosition.height / newPosition.height

            element.animate([
                {transform: `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`},
                {transform: 'none'},
            ], {
                duration: this.duration,
                easing: 'ease-in-out',
                fill: 'both'
            })
            //element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`
        })
    }

    /**
     *
     * @param {HTMLElement[]} elements
     */
    remove(elements) {
        // Move deleted element to the end
        elements.forEach(element => element.parentNode.appendChild(element));

        // Animate deleted element
        elements.forEach(element => {
            const index = element.dataset.index;
            const newPosition = element.getBoundingClientRect();
            const oldPosition = this.position[index];

            const deltaX = oldPosition.x - newPosition.x;
            const deltaY = oldPosition.y - newPosition.y;

            element.animate([
                {
                    transform: `translate(${deltaX}px, ${deltaY}px)`,
                    opacity: 1
                },
                {
                    transform: `translate(${deltaX}px, ${deltaY - 30}px)`,
                    opacity: 0
                },
            ], {
                duration: this.duration,
                easing: 'ease-in-out',
                fill: 'both'
            })

            // Remove from DOM
            window.setTimeout(_ => {
                element.parentNode.removeChild(element)
            } , this.duration)
        });
    }
}

export { Flip };