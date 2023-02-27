import '../../styles/admin/gallery_read.scss';
import {InfinitePictureScroll} from "../components/InfinitePictureScroll";

const top = document.getElementById('top');

if (top) {
    top.addEventListener('click', () => {
        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0
    })
}

new InfinitePictureScroll(
    12,
    '.intersection-watcher',
    '.picture-container'
)