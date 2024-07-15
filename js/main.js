function main() {
    const path = window.location.pathname;

    if (path === '/' || path === '/index.html') {
        window.location.href = window.location.origin + '/all-folders/'
        return;
    }

    if (path === '/all-folder/' || path === '/all-folders/index.html') {

        return;
    }

    console.debug("Visited page with not hanlder set up: ", path);
    console.debug("Redirecting to /all-folders/");
    window.location.href = window.location.origin + '/all-folders/'
    return;
}

main();
