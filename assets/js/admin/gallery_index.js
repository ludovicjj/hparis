import '../../styles/admin/gallery_index.scss';
import { Tooltip } from 'bootstrap';
import PaginatedGallery from "../components/PaginatedGallery";

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
tooltipTriggerList.forEach(tooltipTriggerEl => new Tooltip(tooltipTriggerEl, {trigger: 'hover'}))

new PaginatedGallery(
    document.querySelector('.gallery'),
    document.querySelector('.pagination'),
    document.querySelector('.categories'),
);