import '../styles/app_ui.scss';
import NavbarUi from "./components/NavbarUi";

const navbar = document.querySelector('nav.header')
new NavbarUi(navbar, '.navbar-toggler');