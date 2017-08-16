import cookie from 'js-cookie';

function getCookie(key) {
    return cookie.get(key);
}

function setCookie(key, value) {
    return cookie.set(key, value, {
        expires: 7,
        path: "/",
        domain: ".2vnet.net"
    });
}

function removeCookie(key) {
    return cookie.remove(key, {
        path: ''
    });
}
export {
    getCookie,
    setCookie,
    removeCookie
}