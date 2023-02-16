import '../../styles/admin/gallery_index.scss';
import { Tooltip } from 'bootstrap';
import PaginatedGallery from "../components/PaginatedGallery";

document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltipTriggerEl => {
    new Tooltip(tooltipTriggerEl)
})

new PaginatedGallery(
    document.querySelector('.gallery'),
    document.querySelector('.pagination'),
    document.querySelector('.categories')
);