import axios from "axios";

class DropFile {
    /**
     * @param {HTMLElement} container
     *
     * @param {Object} options                  Selectors used to build Drag And Drop
     * @param {string} options.dropArea         Drag and Drop area
     * @param {string} options.fileArea         File area
     * @param {string} options.inputFile        Input file
     * @param {string} options.inputBtn         Button to add manually file without drag and drop
     *
     * @param {Object} template                 Template used to build each file dropped
     * @param {string} template.id              Template id
     * @param {string} template.filename        File name selector
     * @param {string} template.filesize        File size selector
     * @param {string} template.progress        progress bar selector
     * @param {string} template.state           File icon state
     * @param {string} template.error           File error container
     */
    constructor (container, options, template) {
        this.counter = 0;
        this.template = template;

        this.dropArea = container.querySelector(options.dropArea);
        this.fileArea = container.querySelector(options.fileArea);
        this.inputFile = container.querySelector(options.inputFile);
        this.inputBtn = container.querySelector(options.inputBtn);

        // event
        this.inputBtn.addEventListener('click', _ => this.inputFile.click())
        this.dropArea.addEventListener('dragenter', this.handleDragEnter.bind(this))
        this.dropArea.addEventListener('dragover', this.handleDragOver)
        this.dropArea.addEventListener('dragleave', this.handleDragLeave.bind(this))
        this.dropArea.addEventListener('drop', this.handleDrop.bind(this))
        this.inputFile.addEventListener('change', this.handleChange.bind(this))
    }

    /**
     * Change drop area style when user drag enter area
     * @param {DragEvent} e
     */
    handleDragEnter (e) {
        this.counter++;
        this.dropArea.classList.add('active');
    }

    /**
     * Required to enabling drop event
     * @param {DragEvent} e
     */
    handleDragOver (e) {
        e.preventDefault();
    }

    /**
     * Reset drop area style when user drag out area
     * @param {DragEvent} e
     */
    handleDragLeave (e) {
        this.counter--;
        if (this.counter === 0) {
            this.dropArea.classList.remove('active')
        }
    }

    /**
     *
     * @param {DragEvent} e
     */
    handleDrop (e) {
        e.preventDefault();
        this._resetDropAreaStyle();

        const files = Array.from(e.dataTransfer.files);
        const countFileItem = this.fileArea.childElementCount;
        this._buildFileDOM(files)
        this._uploadFile(files, 0, countFileItem)
    }

    handleChange (e) {
        const [...files] = e.currentTarget.files;
        const countFileItem = this.fileArea.childElementCount;
        this._buildFileDOM(files)
        this._uploadFile(files, 0, countFileItem)
        e.currentTarget.value = null
    }

    /**
     * Building the HTML representation of each dropped file.
     * @param {File[]} files Dropped files
     * @private
     */
    _buildFileDOM (files) {
        const fragment = document.getElementById(this.template.id).content
        this.fileContainer = fragment.firstElementChild.className;

        for (const file of files) {
            const fileTemplate = fragment.cloneNode(true);
            const filename = this._getFileName(file, 12);
            const filesize = this._getFileSize(file)
            fileTemplate.querySelector(this.template.filename).innerText = filename
            fileTemplate.querySelector(this.template.filesize).innerText = filesize
            this.fileArea.append(fileTemplate)
        }
    }

    /**
     * @param {File[]} files
     * @param {number} index
     * @param {number} count
     * @private
     */
    _uploadFile (files, index, count) {
        const file = files[index];
        const url = this.fileArea.dataset.url

        const controller = new AbortController();
        const formData = new FormData();
        formData.append('upload', file);

        const fileItems = Array.from(this.fileArea.querySelectorAll('.' + this.fileContainer));
        const position = index + count
        const currentFile = fileItems[position]

        const fileProgress = currentFile.querySelector(this.template.progress)
        const fileState = currentFile.querySelector(this.template.state)
        const fileStop = currentFile.querySelector('.icon-abort');

        // enable pointer-event on abort btn
        fileStop.classList.add('active');
        fileStop.addEventListener('click', () => controller.abort(), {once: true})
        // reset icon to abort btn
        if (fileStop.classList.contains('abort')) {
            fileStop.innerHTML = '<i class="fa-solid fa-xmark"></i>'
            fileStop.classList.remove('abort');
        }

        axios({
            url,
            method: 'post',
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            signal: controller.signal,
            data: formData,
            onUploadProgress: function ({ loaded, total }) {
                fileProgress.style.width = Math.floor((loaded / total) * 100) + '%'
            }
        }).then(response => {
            this._handleSuccess(response.data, currentFile, fileState, fileStop)
        }).catch(error => {
            if (axios.isCancel(error)) {
                this._handleCancel(file, fileStop, fileState, position)
                return;
            }
            if (error.response.status === 422) {
                const data = error.response.data
                this._handleError(data.errors, currentFile, fileState, fileStop)
            }
        }).finally(_ => {
            if (index < (files.length - 1)) {
                this._uploadFile(files, index + 1, count)
            }
        })
    }

    /**
     * Get filename and truncated it if it exceeds limit
     * @param {File} file
     * @param {number} limit
     * @return string
     * @private
     */
    _getFileName (file, limit) {
        const fullFileName = file.name;

        const hasDot = fullFileName.match(/\./g);

        if (!hasDot) {
            return fullFileName;
        }

        const nbDot = hasDot.length;
        const splitFullName = fullFileName.split('.')
        const filename = splitFullName.slice(0, nbDot).join('.')

        if (filename.length >= limit ) {
            const extension = splitFullName.slice(-1).toString();

            return filename.substring(0, limit) + '... .' + extension;
        }

        return fullFileName;
    }

    /**
     * Get filesize
     * @param {File} file
     * @return string
     * @private
     */
    _getFileSize (file) {
        let size = (file.size / 1000).toFixed(1);
        return (size < 1000) ? `${size} KB` : `${(size/1000).toFixed(1)} MB`
    }

    /**
     * Reset drop area style and counter
     * @private
     */
    _resetDropAreaStyle () {
        this.counter = 0;
        this.dropArea.classList.remove('active');
    }

    /**
     * Update style when upload success
     * @param {Object} data
     * @param {HTMLElement} currentFile
     * @param {HTMLElement} fileState
     * @param {HTMLElement} fileStop
     * @private
     */
    _handleSuccess (data, currentFile, fileState, fileStop) {
        fileState.classList.remove('loading')
        fileState.classList.remove('abort')
        fileState.classList.add('success')

        fileStop.classList.remove('active')

        currentFile.classList.add('valid-file')
        currentFile.dataset.pictureId = data.id
    }

    /**
     * Update style when upload canceled
     * @param {File} file
     * @param {HTMLElement} fileStop
     * @param {HTMLElement} fileState
     * @param {number} position
     * @private
     */
    _handleCancel (file, fileStop, fileState, position) {
        fileStop.classList.add('abort')
        fileStop.innerHTML = '<i class="fa-solid fa-rotate-right"></i>'
        fileState.classList.add('abort')
        fileStop.addEventListener('click', () => {
            this._uploadFile([file], 0 , position)
        }, {once: true})
    }

    /**
     * Update style when upload failed
     * @param {Object[]} errors
     * @param {HTMLElement} currentFile
     * @param {HTMLElement} fileState
     * @param {HTMLElement} fileStop
     * @private
     */
    _handleError(errors, currentFile, fileState, fileStop) {
        const itemErrorContainer = currentFile.querySelector(this.template.error)

        for (const error of errors) {
            itemErrorContainer.innerText = error.message;
        }
        fileStop.classList.remove('active')
        fileState.classList.remove('loading');
        fileState.classList.add('failed');
        currentFile.classList.add('invalid-file')
    }

}

export default DropFile;