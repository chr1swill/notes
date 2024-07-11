import { getActiveFoldersFromLocalStorage, saveFolderToLocalStorage } from './all-folders.js'

/**
 * @typedef {import('../types/types.js').Note} Note
 */

/**
 * @returns{number | null} 
 */
function parsePageUrlForId() {
    const pageUri = window.location.href;
    const url = new URL(pageUri);
    const params = new URLSearchParams(url.search);

    /**@type{string | null }*/
    let id = params.get('id');
    if (id === null) {
        console.error("There is no id in the query params of the page url: ", pageUri);
        return null;
    }

    return parseFloat(id);
}

function handleClickOnNewNoteButton() { }

function handleGetRequestFolder() {
    const folders = getActiveFoldersFromLocalStorage()
    if (folders === null) {
        console.error("An Error occured trying to access all the active folders");
        return;
    }

    const id = parsePageUrlForId();
    if (id === null) {
        console.error("No id was provided");
        return;
    }

    if (!(id in folders)) {
        console.error("Provided id is not in the current collection of folders: ", id);
        return;
    }

    const requestFolder = folders[id]
    const folderNotes = requestFolder.notesInFolder;

    const noteListContainer = document.getElementById("note_list_container");
    if (noteListContainer === null) {
        console.error("Could not find element with id: #note_list_container");
        return;
    }

    if (folderNotes.length < 1) {
        console.debug("There are no notes in this folder promote user to add notes to folder");

        while (noteListContainer.firstChild) {
            const fc = noteListContainer.firstChild;
            noteListContainer.removeChild(fc);
            console.debug("Removed child element from note list", fc);
        }

        noteListContainer.textContent = "No notes in folder"

        return;
    }

    const fragment = new DocumentFragment;

    const _li = document.createElement("li");

    let folderHasBeenUpdatedNeedToSaveInMemoryCopy = false;

    for (let i = 0; i < folderNotes.length; i++) {
        const currentNoteId = folderNotes[i];

        const noteAsString = localStorage.getItem(currentNoteId.toString());
        if (noteAsString === null) {
            console.debug("There was a note in folder that did not exist in localStorage");
            folderHasBeenUpdatedNeedToSaveInMemoryCopy = true;
            console.debug("Removing id form notes array: ", currentNoteId);
            console.debug("Notes array before removal: ", folderNotes);
            folderNotes.splice(i, 1);
            console.debug("Notes array after removal: ", folderNotes);

            break;
        } 

        /**@type{Note}*/
        const note = JSON.parse(noteAsString)

        const a = document.createElement("a");
        a.setAttribute("data-note-id", note.id.toString())
        a.setAttribute("href", `${window.location.origin + "/note-view/index.html?id=" + note.id.toString()}`)

        const li = _li.cloneNode(true);
        li.appendChild(a);
        fragment.appendChild(li);
    }

    noteListContainer.appendChild(fragment);

    if (folderHasBeenUpdatedNeedToSaveInMemoryCopy === true) {
        const savedFolder = saveFolderToLocalStorage(requestFolder);
        if (savedFolder === null) {
            console.error("Failed to update folder with changes that were applied to the folder");
            return;
        }

        console.debug("Successfully saved update made to folder in memory to localStorage");
    }

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

    window.onload = handleGetRequestFolder;

    newNoteButton.onclick = ;
};
