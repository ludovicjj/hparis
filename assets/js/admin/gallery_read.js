import '../../styles/admin/gallery_read.scss';

const pictureContainer = document.querySelector('.picture-container')
const watcher = document.querySelector('.intersection-watcher')

const count = 12
const galleryId = pictureContainer?.dataset.gallery
let page = parseInt(pictureContainer?.dataset.page)
const url = pictureContainer?.dataset.url

const fetchData = async (url) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    });

    return (
        response.headers.has('content-type') && response.headers.get('content-type') === 'application/json'
    ) ? await response.json() : null
}

const createPicture = (imageName) => {
    const div = document.createElement('div');
    div.classList.add('col-6', 'col-sm-4', 'col-md-3', 'mb-4')

    const card = document.createElement('div')
    card.classList.add('card', 'gallery-card')

    const picture = document.createElement('img')
    picture.className = 'picture'
    picture.setAttribute('alt', 'Gallery Picture')
    picture.setAttribute('src', `/uploads/pictures/${imageName}`)

    card.appendChild(picture)
    div.appendChild(card)
    pictureContainer.querySelector('.row').appendChild(div)

}

const addContent = async () => {
    page = page + 1

    const targetUrl = url + `?id=${encodeURIComponent(galleryId)}&page=${encodeURIComponent(page)}&count=${count}`
    const data = await fetchData(targetUrl)

    if (data) {
        data.forEach(({imageName}) => {
            createPicture(imageName)
        })
        if (!data.length || data.length !== 12) {
            watcher.remove()
        }
    }
}

const handleIntersect = entries => {
    if (entries[0].isIntersecting) {
        addContent().then(_ => {
            pictureContainer.dataset.page = page
        })
    }
}
if (pictureContainer && watcher) {
    new IntersectionObserver(handleIntersect).observe(watcher)
}