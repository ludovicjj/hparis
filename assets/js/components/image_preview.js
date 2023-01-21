const imagePreview = (e, containerClassName, imageSelector) => {
    let inputFile = e.currentTarget;
    let imageLabel = inputFile.closest(containerClassName).querySelector(imageSelector);

    if (inputFile.files && inputFile.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            imageLabel.setAttribute('src', e.target.result);
        }
        reader.readAsDataURL(inputFile.files[0]);
    } else {
        imageLabel.setAttribute('src', imageLabel.dataset.origin);
    }
}

export { imagePreview }