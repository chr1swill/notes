import { handleClickOnCreateNewFolderButton, handleClickOnCreateNewNoteButton, renderListOfLinksToDom } from "./dom-update.js";
import { initDB } from "./storage.js";

window.addEventListener('load', main);

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
    console.debug("reqpath: ", path);
    console.debug("reqsearch: ", search);

    if (path === '/' || path === '/index.html') {
        const allFoldersPath = window.location.origin + '/all-folders/';
        window.location.href = allFoldersPath;
        return;
    }

    if (path === '/all-folders/' || path === '/all-folders/index.html') {
        const queriedId = searchParams.get('id');
        const idOfFolderListContainer = "folder_list_container"
        renderListOfLinksToDom(1, idOfFolderListContainer, queriedId === null ? 0 : parseFloat(queriedId));

        
        const newFolderButton = /**@type { HTMLButtonElement | null } */
            (document.getElementById("button_create_new_folder"));
        if (newFolderButton === null) {
            console.error("Could not find element with id: #button_create_new_folder");
            return;
        }

        newFolderButton.onclick = function () {
            handleClickOnCreateNewFolderButton(idOfFolderListContainer);
            return;
        };

        return;
    } 

    if (path === '/folder-view/' || path === '/folder-view/index.html') {
        const queriedId = searchParams.get('id');
        const idOfFolderListContainer = "note_list_container";
        renderListOfLinksToDom(0, idOfFolderListContainer, queriedId === null ? 0 : parseFloat(queriedId));

        const newNoteButton = document.getElementById('button_create_new_note');
        if (newNoteButton === null) {
            console.error("Could not find element with id: #button_create_new_note");
            return;
        }

        newNoteButton.onclick = function() {
            handleClickOnCreateNewNoteButton(idOfFolderListContainer);
            return;
        }

        return;
    }

    if (path === '/note-view/' || path === '/note-view/index.html') {
        const queriedId = searchParams.get('id');
        if (queriedId === null || queriedId.trim() === "") {
            console.debug("Could not render without a id param to the note you would like to open");
            window.location.href = window.location.origin + '/folder-view/';
            console.debug("Redirected back to /folder-view/");
            return;
        }

        return;
    }

    console.debug("Visited page with not hanlder set up: ", path);
    console.debug("Redirecting to /all-folders/");
    window.location.href = window.location.origin + '/all-folders/'
    return;
}

