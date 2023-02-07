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
const total = parseInt(pictureContainer.dataset.total)
const limit = parseInt(pictureContainer.dataset.limit)
const galleryId = pictureContainer.dataset.gallery;
const currentPage = pictureContainer.dataset.current;
const page = Math.ceil(total / limit);
const targetPagination = document.querySelector('.pagination');

function buildPagination () {
    let arrayPage = [...Array(page).keys()];
    arrayPage.forEach(page => {
        page = (page + 1).toString()

        // a
        let a = document.createElement('a');
        a.classList.add('page-link')
        a.innerText = page;
        a.setAttribute('href', '#')

        // li
        let li = document.createElement('li');
        li.classList.add('page-item')
        li.dataset.page = page
        if (currentPage === page) {
            li.classList.add('active')
        }

        // add event
        li.addEventListener('click', handlePage)

        // append
        li.appendChild(a)
        targetPagination.appendChild(li);
    })
}
const handlePage = async (e) => {
    e.preventDefault();

    const page = e.currentTarget.dataset.page;
    targetPagination.querySelectorAll('li').forEach(item => {
        item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');


    ///api/pictures?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}&gallery=${encodeURIComponent(galleryId)}
    const response = await fetch(`/api/pictures?page=${page}&id=${galleryId}&limit=${limit}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
    })
    if (response.ok) {
        const pictures = await response.json()
        pictureContainer.replaceChildren();
        pictures.forEach(picture => {
            const img = document.createElement('img')
            img.setAttribute('src', `/uploads/pictures/${picture.imageName}`)
            const div = document.createElement('div');
            div.classList.add('picture-item')

            div.appendChild(img)
            pictureContainer.appendChild(div)
        })

    }
}
buildPagination();
