/**
 * @typedef{import('types.js').Note} Note
 */

/**
 * @typedef{import('types.js').Folder} Folder
 */

/**
 * @typedef{import('types.js').FolderCollection} FolderCollection
 */

const pgIndex = (function() {

    function run() {
        const page = window.location.href + 'all-folders/';
        window.location.replace(`${page}`);
        console.debug("Redirect to uri: ", page);
    }

    return { run: run }
})();

const pgAllFolders = (function() {
    /**
     * @returns{number}
     */
    function createFolderId() {
        return Date.now() + Math.random();
    }

    /**
     * @typedef { import('../types/types.js').FolderCollection } FolderCollection
     */

    /**
     * @returns {FolderCollection | null}
     */
    function getActiveFoldersFromLocalStorage() {
        const allFolders = localStorage.getItem("folderCollection");
        if (allFolders === null) {
            console.debug("Attempting to initalized folderCollection key in localStorage with empty object");
            /**@type{FolderCollection}*/
            const initFolderCollection = {};

            try {
                localStorage.setItem("folderCollection", JSON.stringify(initFolderCollection));
            } catch (e) {
                console.error(e);
                return null;
            }

            console.debug("Successfully initalized folderCollection key in localStorage with empty object");
            return initFolderCollection;
        }

        return JSON.parse(allFolders);
    }

    /**
     * @param {Folder} folder - the folder you would like to save to localStorage
     * @returns {Folder | null}
     */
    function saveFolderToLocalStorage(folder) {
        const allActiveFolders = getActiveFoldersFromLocalStorage();
        if (allActiveFolders === null) {
            console.error("Failed to access active Folder from localStorage: an error occurred trying to init key folderCollection in localStorage");
            return null;
        }

        allActiveFolders[folder.id] = folder;
        const updatedFoldersAsString = JSON.stringify(allActiveFolders);

        try {
            localStorage.setItem("folderCollection", updatedFoldersAsString);
        } catch (e) {
            console.error(e);
            return null;
        }

        return folder;
    }

    /**
     * @param {string} name - the choosen name of the folder
     * @returns {Folder | null}
     */
    function createFolder(name) {
        name = name.trim();

        if (name.length < 1) {
            console.error("Invalid name, name must contain atleast one character");
            return null;
        }

        if (name.length > 125) {
            console.warn("Provided name was too long, truncated input to 125 chars");
            const indexOfCharNumber125 = 124;
            name = name.slice(0, indexOfCharNumber125);
        }
        console.assert(name.length < 125 && name.length > 0, "The folder name is currently an invalid length");

        if (localStorage.getItem(name) !== null) {
            console.error("Chossen folder name already exist in storage, select a new name");
            return null;
        }

        /**@type{Folder}*/
        const newFolder = {
            id: createFolderId(),
            name: name,
            notesInFolder: []
        }

        const savedFolder = saveFolderToLocalStorage(newFolder);
        if (savedFolder === null) {
            console.error("Could not save your newly created folder to localStorage");
            return null;
        }

        return newFolder;
    }

    function handleClickOnCreateFolderButton() {
        let prompt = window.prompt("Choose Folder Name: ");

        while (prompt === null || prompt.trim().length < 1 || prompt.trim().length > 125) {
            if (prompt === null) return;
            prompt = window.prompt("Choose Folder Name: ");
        }

        const newFolder = createFolder(prompt);
        if (newFolder === null) {
            console.error("An error occured while trying to create a new folder");
            return;
        }

        renderFolderListToDOM();
    }

    function renderFolderListToDOM() {
        pgFolderView.removeWindowListenersIfNotRequiedOnPage("all-folders", 'load', renderFolderListToDOM);

        const folderListContainer = /**@type{HTMLUListElement | null} */
            (document.getElementById("folder_list_container"));
        if (folderListContainer === null) {
            console.error("Could not not find element with id: #folder_list_container");
            return;
        }

        const fragment = new DocumentFragment();

        const allActiveFolder = getActiveFoldersFromLocalStorage();
        if (allActiveFolder === null) {
            console.error("Failed to access all active folder");
            return;
        }

        for (const folder in allActiveFolder) {
            const li = document.createElement("li");
            const a = document.createElement("a");

            a.textContent = allActiveFolder[folder].name;
            a.setAttribute("data-folder-name", allActiveFolder[folder].id.toString());
            a.setAttribute("href", `${window.location.origin + "/folder-view/index.html?id=" + allActiveFolder[folder].id.toString()}`);

            li.appendChild(a);
            fragment.appendChild(li);
        }

        const aEl = document.createElement("a");
        aEl.textContent = "All Notes";
        aEl.setAttribute("data-folder-name", "all-notes");
        aEl.setAttribute("href", `${window.location.origin + "/folder-view/index.html?id=" + "all-notes"}`);

        const liEl = document.createElement("li");
        liEl.appendChild(aEl);

        fragment.prepend(liEl);

        while (folderListContainer.firstChild) {
            folderListContainer.removeChild(folderListContainer.firstChild);
        }

        folderListContainer.appendChild(fragment);
    }

    function run() {
        const newFolderButton = document.getElementById("button_create_new_folder");
        if (newFolderButton === null) {
            console.error("Failed to find element matching id: #button_create_new_folder");
            return;
        }

        newFolderButton.onclick = handleClickOnCreateFolderButton;
        window.addEventListener('load', renderFolderListToDOM);
    }

    return { run: run, getActiveFoldersFromLocalStorage: getActiveFoldersFromLocalStorage, saveFolderToLocalStorage: saveFolderToLocalStorage }
})();

const pgFolderView = (function() {
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
        const newNote = pgNoteView.createNote()
        const savedNote = pgNoteView.saveNote(newNote);
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
    function removeWindowListenersIfNotRequiedOnPage(pathname, eventType, functionName) {
        if (window.location.pathname !== `/${pathname}/index.html` || window.location.pathname !== `/${pathname}/`) {
            console.debug("Removeing window event listener callback: ", functionName);
            window.removeEventListener(eventType, functionName);
        }

        return;
    }

    function handleGetRequestFolder() {
        removeWindowListenersIfNotRequiedOnPage("folder-view", 'load', handleGetRequestFolder);

        const folders = pgAllFolders.getActiveFoldersFromLocalStorage()
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
            const savedFolder = pgAllFolders.saveFolderToLocalStorage(requestFolder);
            if (savedFolder === null) {
                console.error("Failed to update folder with changes that were applied to the folder");
                return;
            }

            console.debug("Successfully saved update made to folder in memory to localStorage");
        }

    }

    function run() {
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
    }

    return { run: run, removeWindowListenersIfNotRequiedOnPage: removeWindowListenersIfNotRequiedOnPage }
})();

const pgNoteView = (function() {

    /**
     * @returns {number}
     */
    function generateId() {
        return Date.now() + Math.random();
    }

    /**
     * @returns {Note}
     */
    function createNote() {
        return { id: generateId(), body: "" };
    }

    /**
     * @param {Note} note
     * @returns {boolean} 
     */
    function validateNote(note) {
        if (!('id' in note) || !('body' in note) || typeof note.id !== 'number' || typeof note.body !== 'string') {
            console.error("Note provided was invalid could not save it: ", note);
            return false;
        }

        return true
    }

    /**
     * @param {Note} note
     * @returns {Note | null}
     */
    function saveNote(note) {
        const typeCheckNote = validateNote(note);
        if (!typeCheckNote) {
            console.error("Invalid note was provided: ", note);
            return null;
        }

        try {
            localStorage.setItem(note.id.toString(), JSON.stringify(note));
        } catch (e) {
            console.error(e);
            return null;
        }

        return note;
    }

    /**
     * @param {number} id - the key of the note you would like to get the localStoage value
     * @returns {Note | null}
     */
    function getNote(id) {
        const noteAsString = localStorage.getItem(id.toString());
        if (noteAsString === null) {
            console.error("There was not a key in local storage matching the provided id: ", id);
            return null;
        }

        const note = JSON.parse(noteAsString);
        const typeCheckNote = validateNote(note);
        if (!typeCheckNote) {
            console.error("Value recieved was not a valid note: ", note);
            return null;
        }

        return note;
    }

    /**
     * @param {number} id - the key of the note you would like to get the localStoage value
     * @param {string} body - the text content you would like to update on the note
     * @returns {Note | null} 
     */
    function updateNote(id, body) {
        body = body.trim();

        const noteAsString = localStorage.getItem(id.toString());
        if (noteAsString === null) {
            console.error("There was not note in localStorage matching the provided id: ", id);
            return null;
        }

        const note = JSON.parse(noteAsString);
        const typeCheckNote = validateNote(note);
        if (!typeCheckNote) {
            console.error("Value recieved was not a valid note: ", note);
            return null;
        }

        note.body = body;

        const saved = saveNote(note)
        if (saved === null) {
            console.error("Failed to saved the updated note");
            return null;
        }

        return note
    }

    function getUrlStateToLocalStorage() { }
    function saveUrlStateToLocalStorage() { }

    function run() {
        const form = /**@type{HTMLFormElement | null} */(document.getElementById("form"));
        if (form === null) {
            console.error("Could not find element with id: #form");
            return;
        }

        const buttonNewNote = /**@type{HTMLButtonElement | null}*/ (document.getElementById("button_new_note"));
        if (buttonNewNote === null) {
            console.error("Could not find element with id: #button_new_note");
            return;
        }

        const buttonSaveNote = /**@type{HTMLButtonElement | null}*/ (document.getElementById("button_save"));
        if (buttonSaveNote === null) {
            console.error("Could not find element with id: #button_save");
            return;
        }

        const noteBody = /**@type{HTMLTextAreaElement | null}*/(document.getElementById("note_body"));
        if (noteBody === null) {
            console.error("Could note find element with id: #note_body");
            return;
        }
    }

    return { run: run, createNote: createNote, saveNote: saveNote }
})();


function main() {
    const uriJumpTable = Object.freeze({
        '/': pgIndex.run(),
        '/index.html': pgIndex.run(),
        '/all-folder/': pgAllFolders.run(),
        '/all-folder/index.html': pgAllFolders.run(),
        '/folder-view/': pgFolderView.run(),
        '/folder-view/index.html': pgFolderView.run(),
        '/note-view/': pgNoteView.run(),
        '/note-view/index.html': pgNoteView.run(),
    })

    const path = window.location.pathname;
    if (!(path in uriJumpTable)) {
        console.debug("Provided uri is not note have a handler", path);
        uriJumpTable['/'];
        return;
    }

    //@ts-ignore
    uriJumpTable[path];
}

main();
