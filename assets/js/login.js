import '../styles/login.scss';

const password = document.querySelector('#password');
document.querySelector('.password-icon').addEventListener('click', (e) => {
    e.currentTarget.classList.toggle('show');

    const eye = e.currentTarget.querySelector('.fa-eye, .fa-eye-slash');
    eye.dataset.icon = eye.dataset.icon === 'eye-slash' ? 'eye' : 'eye-slash';

    const type = password.getAttribute('type') === 'password' ? 'text' : 'password'
    password.setAttribute('type', type);
})