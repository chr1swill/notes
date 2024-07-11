import { getActiveFoldersFromLocalStorage, saveFolderToLocalStorage } from './all-folders.js'
import { createNote, saveNote } from './note-view.js';

/**
 * @typedef {import('../types/types.js').Note} Note
 */

/**
 * @typedef {import('../types/types.js').FolderCollection} FolderCollection
 */

/**
 * @typedef {import('../types/types.js').Folder} Folder
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

/**
 * @param {number} id 
 */
function renderNotesInFolder(id) {
}

/**
 * @returns{Folder}
 */
function createAllNotesFolder() {
    return { id: 0, name: "allNotesFolder", notesInFolder: [] }
}

/**
 * @returns{FolderCollection}
 *
 * create a new folder collection obj with the key of the all notes folder only
 */
function createFolderCollection() {
    const allNotesFolder = createAllNotesFolder()
    const allNotesFolderId = allNotesFolder.id;
    return { [allNotesFolderId]: allNotesFolder };
}

/**
 * @param {FolderCollection} folderCollection
 * @returns {boolean} 
 */
function saveFolderCollection(folderCollection) {
    try {
        localStorage.setItem("folderCollection", JSON.stringify(folderCollection));
    } catch (e) {
        console.error(e);
        return false;
    }

    return true;
}

function handleClickOnNewNoteButton() {
    const newNote = createNote()
    const savedNote = saveNote(newNote);
    if (savedNote === null) {
        console.error("Failed to save note");
        return;
    }

    const searchQuery = window.location.search;
    const url = new URLSearchParams(searchQuery);
    const folderId = url.get('id');
    if (folderId === null) {
        console.debug("No query param id, going to place in folder all notes");
        const folderCollectionAsString = localStorage.getItem("folderCollection");
        /**@type {FolderCollection}*/
        let fc;

        if (folderCollectionAsString === null) {
            const initFolderCollection = createFolderCollection()
            const ok = saveFolderCollection(initFolderCollection);

            if (ok === false) {
                console.error("Failed to save newly created folder collection to localStorage");
                return;
            }

            initFolderCollection[0].notesInFolder.push(newNote.id);
            fc = initFolderCollection;
        } else {
            fc = JSON.parse(folderCollectionAsString);
        }
        // working here pal im pretty sure now is when you save the folder collection

    }
}

/**
 * @param {string} pathname 
 * @param {keyof WindowEventMap} eventType 
 * @param {EventListenerOrEventListenerObject} functionName
 */
export function removeWindowListenersIfNotRequiedOnPage(pathname, eventType, functionName) {
    if (window.location.pathname !== `/${pathname}/index.html` || window.location.pathname !== `/${pathname}/`) {
        console.debug("Removeing window event listener callback: ", functionName);
        window.removeEventListener(eventType, functionName);
    }

    return;
}

function handleGetRequestFolder() {
    removeWindowListenersIfNotRequiedOnPage("folder-view", 'load', handleGetRequestFolder);

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

    window.addEventListener('load', handleGetRequestFolder);

    newNoteButton.onclick = handleClickOnNewNoteButton;
};

if (window.location.pathname === "/folder-view/" || window.location.pathname === '/folder-view/index.htm') main();
