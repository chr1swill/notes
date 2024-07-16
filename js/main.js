import { renderListOfLinksToDom } from "./dom-update.js";
import { initDB } from "./storage.js";

function main() {
    initDB()
        .then(function(v) {
            if (v === 1) {
                console.debug("Sucessfully init of db");
            } else {
                console.error("An unhandled error occured while trying to init db: ", v);
            };
        })
        .catch(function(e) {
            console.error("Error occurred while trying to init db: ", e);
        });

    const path = window.location.pathname;
    const search = window.location.search;
    const searchParams = new URLSearchParams(search)

    if (path === '/' || path === '/index.html') {
        window.location.href = window.location.origin + '/all-folders/'
        return;
    }

    if (path === '/all-folder/' || path === '/all-folders/index.html') {
        const queriedId = searchParams.get('id');
        const idOfFolderListContainer = "folder_list_container"
        if (queriedId === null) {
            // type of list (folder , notes), where to insert it into the dom, id of the data 
            renderListOfLinksToDom(0, idOfFolderListContainer, 0);
            return;
        }

        renderListOfLinksToDom(0, idOfFolderListContainer, parseFloat(queriedId));
        return;
    }

    console.debug("Visited page with not hanlder set up: ", path);
    console.debug("Redirecting to /all-folders/");
    window.location.href = window.location.origin + '/all-folders/'
    return;
}

main();
