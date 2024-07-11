import { getActiveFoldersFromLocalStorage } from './all-folders.js'

function handleGetRequestFolder() {
    const pageUri = window.location.href;
    const url = new URL(pageUri);
    const params = new URLSearchParams(url.search);
    /**@type{string | null | number}*/
    let id = params.get('id');
    if (id === null) {
        console.debug("pageURI: ", pageUri);
        return;
    }

    const folders = getActiveFoldersFromLocalStorage()
    if (folders === null) {
        console.error("An Error occured trying to access all the active folders");
        return;
    }

    if (!(id in folders)) {
        console.error("Provided id is not in the current collection of folders: ", id);
        return;
    }

    id = parseFloat(id);
    const requestFolder = folders[id]
    // continue to build render page and do a similar link based apporach for rendering the notes from the url location
}

function main() {
    const noteListContainer = document.getElementById("note_list_container");
    if (noteListContainer === null) {
        console.error("Could not find element with id: #note_list_container");
        return;
    }

    const newNoteButton = document.getElementById("button_create_new_note");
    if (newNoteButton === null) {
        console.error("Could not find element with id: #button_create_new_note");
        return;
    }

    window.onload = ;
};
