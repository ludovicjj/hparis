import '../../styles/admin/gallery_index.scss';
import Masonry from 'masonry-layout';
import imagesLoaded  from 'imagesloaded'

const btn = document.querySelector('#add-item')



// init Masonry
const grid = document.querySelector('.grid');
const masonry = new Masonry(grid, {
    itemSelector: '.grid-item',
    percentPosition: true,
    transitionDuration: 0,
    //horizontalOrder: true
    // stagger: 30 //ms
})

imagesLoaded( grid ).on( 'progress', function(imgLoad, image ) {
    console.log('one image is ready')
    // image.img.parentNode.classList.add('on');
    //image.img.className.add('on')
    // layout Masonry after each image loads
    masonry.layout();
});

btn.addEventListener('click', () => {

    const {fragment, items} = getItemsFragment();

    grid.appendChild( fragment );
    masonry.appended(items)

    let imgLoad = imagesLoaded( grid );
    imgLoad.on( 'progress', onProgress );

})

function onProgress( imgLoad, image ) {
    // change class if the image is loaded or broken
    //image.img.parentNode.className = image.isLoaded ? 'cool' : 'is-broken';
    image.img.parentNode.classList.add('in');
    masonry.layout();
}

function getItemsFragment() {
    let fragment = document.createDocumentFragment();
    let items = [];
    // let lastChildLeft = grid.lastElementChild.style.left //x: 0% (left)
    // let lastChildTop = grid.lastElementChild.style.top //y: 400px (top)

    for ( let i = 0; i < 7; i++ ) {
        let item = getImageItem(i);
        // item.style.left = lastChildLeft;
        // item.style.top= lastChildTop
        item.classList.add('hidden')
        items.push(item)
        fragment.appendChild( item );
    }

    return {fragment, items};
}

function getImageItem(i) {
    const item = document.createElement('div');
    item.classList.add('grid-item');
    item.classList.add('col-6');
    item.classList.add('col-md-4');
    item.classList.add('col-xl-3');

    // if (i % 2 === 0) {
    //     item.classList.add('small');
    // } else {
    //     item.classList.add('medium');
    // }

    // spacing
    item.classList.add('pb-3');
    item.classList.add('px-2');

    let img = document.createElement('img');

    let rando = Math.ceil( Math.random() * 1000 );
    img.src = `https://picsum.photos/300/400/?${rando}`
    item.append(img)

    return item;
}
