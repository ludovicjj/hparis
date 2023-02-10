import '../../styles/admin/gallery_update.scss';
import GalleryForm from "../components/GalleryForm";
import DropFile from "../components/DropFile";


const form = document.querySelector('#form-gallery');
new GalleryForm(form);

new DropFile(
    form,
    {
        dropArea: '.upload-drop-area',
        fileArea: '.upload-info-items',
        inputFile: '#uploads',
        inputBtn: '.upload-drop_add'
    },
    {
        id: 'file-template',
        filename: '.file-name',
        filesize: '.file-size',
        progress: '.progress',
        state: '.icon-state',
        error: '.file-error'
    }
)
const pictureContainer = document.querySelector('.picture');
const paginationContainer = document.querySelector('.pagination');

const itemPerPage = parseInt(pictureContainer.dataset.perPage)
const galleryId = pictureContainer.dataset.gallery;


/**
 *
 * @param {number} currentPage
 * @param {number} totalPage
 * @return {(number|string)[]}
 */
const getPaginationLinks = (currentPage, totalPage) => {
    const delta = 2;
    const pages = [...Array(totalPage + 1).keys()].slice(1);
    const index = pages.findIndex(page => page === currentPage);
    const start = Math.max(index - delta, 0)
    const end = Math.min(index + delta + 1, totalPage - 1)

    const limit = (totalPage - delta) -1

    // console.log(`page: ${currentPage}, index: ${index}, start: ${start}, end: ${end}, limit: ${(totalPage - delta) -1}, totalPage: ${totalPage}`)

    if ( limit < delta) {
        return [...pages.slice(0)];
    }

    let links
    if (currentPage < limit) {
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

const deletePicture = (e) => {
    e.preventDefault();

    const pictureId = e.currentTarget.dataset.pictureId
    const count = pictureContainer.childElementCount;
    const page = paginationContainer.querySelector('.active').dataset.page
    e.currentTarget.closest('.picture-item').remove()
    const body = JSON.stringify({page, count, galleryId});

    handleDelete(pictureId, body).then(pictures => {
        pictureContainer.dataset.total = (pictureContainer.dataset.total - 1).toString()
        pictures.forEach(({id, imageName}) => {
            createPicture(id, imageName)
        })

    }).catch(err => {
        console.log(err)
    }).finally(_ => {
        buildPagination()
    })

}

const handleDelete = async (pictureId, body) => {
    const response = await fetch(`/api/pictures/${pictureId}`, {
        method: 'DELETE',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        },
        body
    })

    let data = [];
    if (response.headers.get('content-type') === 'application/json') {
        data = await response.json();
    }

    if (response.ok) {
        return Promise.resolve(data)
    } else {
        return Promise.reject(data)
    }
}

/**
 * Build Bootstrap-style pagination links
 * @param page
 * @param currentPage
 * @return {HTMLLIElement}
 */
function getPaginationHTML(page, currentPage) {
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
        li.addEventListener('click', handlePageClick)
    }

    return li;
}
function buildPagination () {
    const currentPage = pictureContainer.dataset.page;
    const totalItems = parseInt(pictureContainer.dataset.total)
    const totalPage = Math.ceil(totalItems / itemPerPage);

    let paginationLinks = getPaginationLinks(parseInt(currentPage), totalPage);

    paginationContainer.replaceChildren()

    paginationLinks.forEach(link => {
        const linkHTML = getPaginationHTML(link, currentPage)
        paginationContainer.appendChild(linkHTML)
    })
}
const handlePageClick = (e) => {
    e.preventDefault();
    const page = e.currentTarget.dataset.page
    pictureContainer.dataset.page = page
    pictureContainer.classList.add('loading')

    buildPagination()

    loadPicture(page).then(pictures => {
        pictureContainer.replaceChildren();
        pictures.forEach(({id, imageName}) => {
            createPicture(id, imageName)
        })
    }).catch(err => {
        console.log(err)
    }).finally(_ => {
        pictureContainer.classList.remove('loading')
    })
}

const createPicture = (id, imageName) => {
    const img = document.createElement('img')
    img.setAttribute('src', `/uploads/pictures/${imageName}`)

    const div = document.createElement('div');
    div.classList.add('picture-item')

    const btn = document.createElement('button');
    btn.classList.add('picture-delete');
    btn.setAttribute('type', 'button')
    btn.innerHTML = '<i class="fa-solid fa-xmark"></i>'
    btn.dataset.pictureId = id

    btn.addEventListener('click', deletePicture)

    div.appendChild(img)
    div.appendChild(btn)
    pictureContainer.appendChild(div)
}
const loadPicture = async (page) => {
    const response = await fetch(`/api/pictures?page=${page}&id=${galleryId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
    })
    const data = await response.json()

    if (!response.ok) {
        return Promise.reject(data)
    }

    return Promise.resolve(data)
}

buildPagination();
document.querySelectorAll('.picture-delete').forEach(btn => {
    btn.addEventListener('click', deletePicture)
})
