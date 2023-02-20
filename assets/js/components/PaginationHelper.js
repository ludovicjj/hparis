/**
 * get pages with range
 * @param {number} currentPage
 * @param {number} totalPage
 * @return {array}
 */
export function getPaginationLinks(currentPage, totalPage) {
    const delta = 2;
    const pages = [...Array(totalPage + 1).keys()].slice(1);
    const index = pages.findIndex(page => page === currentPage);
    const start = Math.max(index - delta, 0)
    const end = Math.min(index + delta + 1, totalPage - 1)
    const range = (totalPage - delta) -1

    if ( range < delta) {
        return [...pages.slice(0)];
    }

    let links
    if (currentPage < range) {
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

/**
 * Build Bootstrap-style pagination links
 * @param page
 * @param currentPage
 * @return {HTMLLIElement}
 */
export function getPaginationHTML(page, currentPage) {
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

    return li;
}

/**
 *
 * @param {string} url
 * @param {string} method
 * @param {Object} options
 * @return {Promise<Object[]>}
 */
export async function sendRequest(url, method, options = {}) {
    const params = {
        method,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            ...options?.headers
        },
        body: options?.body
    }

    const response = await fetch(url, params)
    const data = response.headers.get('content-type') === 'application/json' ? await response.json() : []

    if (response.ok) {
        return Promise.resolve(data)
    } else {
        return Promise.reject(data)
    }
}