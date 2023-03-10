import '../../styles/admin/gallery_update.scss';
import GalleryForm from "../components/GalleryForm";
import DropFile from "../components/DropFile";
import PaginatedPicture from "../components/PaginatedPicture";


const form = document.querySelector('#form-gallery');
new GalleryForm(form, true);

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
new PaginatedPicture(
    document.querySelector('.picture'),
    document.querySelector('.pagination')
)
