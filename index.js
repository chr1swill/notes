(function() {
    const form = /**@type{HTMLFormElement | null }*/
        (document.getElementById("form"));
    if (form === null) {
        console.error("Could not find element with id: #form");
        return;
    }


    const buttonNewNote = /**@type{HTMLButtonElement | null}*/
        (document.getElementById("button_new_note"));
    if (buttonNewNote === null) {
        console.error("Could not find element with id: #button_new_note");
        return;
    }


    const buttonSave = /**@type{HTMLButtonElement | null}*/
        (document.getElementById("button_save"));
    if (buttonSave === null) {
        console.error("Could not find element with id: #button_save");
        return;
    }

    const textareaNoteBody = /**@type{HTMLTextAreaElement | null}*/
        (document.getElementById("note_body"));
    if (textareaNoteBody === null) {
        console.error("Could not find element with id: #note_body");
        return;
    }

    /**
     * @typedef {Object} Note
     * @property {string} id - generated id of note
     * @property {string} body - the text the is contained in a note
     */

    class NoteController {

        /**@type {string} */
        #currentNoteId = ""

        constructor() {
            const noteId = localStorage.getItem("currentNoteId");

            if (noteId === null) {
                /**@type{string | null}*/
                const newNoteId = this.createNewNote();
                if (newNoteId === null) {
                    console.error("Failed to created a new note");
                    return;
                }

                this.#currentNoteId = newNoteId;

                try {
                    localStorage.setItem("currentNoteId", this.#currentNoteId);
                } catch (e) {
                    console.error(e);
                    return;
                }

                if (form === null) {
                    console.error("Could note find element with id: #form");
                    return;
                }

                form.setAttribute("data-note-id", this.#currentNoteId);
            } else {
                /**@type{Note | null}*/
                let currentNote;
                try {
                    currentNote = /**@type{Note | null }*/(localStorage.getItem(noteId));
                    if (currentNote === null)
                        throw new ReferenceError(`Could not find note with id matching current note id:  ${noteId}`);

                } catch (e) {
                    console.error(e);
                    return;
                }

                this.#currentNoteId = currentNote.id;

                if (form === null || textareaNoteBody === null) {
                    console.error("Failed to access element form or textarea");
                    return;
                }

                form.setAttribute("data-note-id", this.#currentNoteId);
                textareaNoteBody.value = currentNote.body;
            }
        }

        /**
         * @returns{string}
         */
        #generateNoteId() {
            return (Date.now() + Math.random()).toString();
        }

        /**
         * @returns{Note | null} - the note you just saved created note
         */
        saveCurrentNote() {
            if (form === null) {
                console.error("Could not find element with id: #form");
                return null;
            }

            /**@type{Note}*/
            const note = {}

            let noteId = form?.getAttribute("data-note-id");

            if (noteId === null) {
                noteId = this.createNewNote()
                if (noteId === null) {
                    console.error("Failed to create new note");
                    return null;
                }
            }
            console.assert(noteId === this.#currentNoteId,
                `The current note from local storage did not match the id in the attribute data-note-id on the form:  
                noteId: ${noteId} 
                this.currentNoteId ${this.#currentNoteId}`,)

            if (textareaNoteBody === null) {
                console.error("Could not find element matching id: #note_body");
            }
            const noteBody = textareaNoteBody?.value || "";

            note.id = noteId;
            note.body = noteBody;

            try {
                localStorage.setItem(this.#currentNoteId, JSON.stringify(note));
            } catch (e) {
                console.error(e);
                return null;
            }

            return note;
        }

        /**
         * @returns{string | null} id of the newly created note
         */
        createNewNote() {
            const newNoteId = this.#generateNoteId();

            try {
                localStorage.setItem("currentNoteId", newNoteId);
            } catch (e) {
                console.error(e);
                return null;
            }

            this.#currentNoteId = /**@type{string}*/(newNoteId);

            return this.#currentNoteId;
        }

        /**
         * @returns{Note | null} - a note matching the provided id or null if no match
         */
        getCurrentNoteFromStorage() { 
            /**@type {Note}*/
            let note = {};

            /**@type {string | Note | null}*/
            let tmp;

            try {
                tmp = localStorage.getItem(this.#currentNoteId);
            } catch (e) {
                console.error(e);
                return null;
            }

            note.id = this.#currentNoteId;

            if (tmp === null) {
                console.debug("Could not find any key in localStorage matching current notes id");
                note.body = "";
                return note;
            }

            tmp = /**@type{Note}*/(JSON.parse(tmp));
            note.body = tmp.body;

            // for gc ;)
            tmp = null;

            return note;
        }
    }

    /**
     * @typedef {Object} Folder
     * @property {number} id 
     * @property {string} name
     * @property {Array<number>} notesInFolder
     */

    /**
     * @returns{number}
     */
    function createFolderId() {
        return Date.now() + Math.random();
    }

    /**
     * @typedef { { [key: number]: Folder } } FolderCollection - the number used to index into the Folder will be its corisponsing id
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

    function renderFolderListToDOM() {
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
            a.setAttribute("href", `${window.location.origin + "/folder-view/folder?id=" + allActiveFolder[folder].id.toString()}`);

            li.appendChild(a);
            fragment.appendChild(li);
        }

        while (folderListContainer.firstChild) {
            folderListContainer.removeChild(folderListContainer.firstChild);
        }

        folderListContainer.appendChild(fragment);
    }

    function main() {
        const nc = new NoteController();

        switch (window.location.pathname) {
            case "/": 
                if (buttonSave === null) {
                    console.error("Could note find element with id: #button_save");
                    return;
                }

                buttonSave.onclick = function(e) {
                    e.preventDefault();
                    const note = nc.saveCurrentNote();
                    if (note === null) {
                        console.error("Failed to save note");
                        return;
                    } else {
                        console.debug("Note saved sucessfully");
                        return;
                    }
                }

                if (buttonNewNote === null) {
                    console.error("Could note find element with id: #button_new_note");
                    return;
                }

                buttonNewNote.onclick = function(e) {
                    e.preventDefault();
                    nc.createNewNote()
                }

                window.onload = function () {
                    if ( form === null ) { 
                        console.error("Failed to access element with id: #form");
                        return; 
                    }
                    const id = window.localStorage.getItem("currentNoteId");
                    if (id === null) { 
                        console.error("Failed to access localStorage key: currentNoteId");
                        return; 
                    }

                    form.setAttribute("data-note-id", id);
                    const note = nc.getCurrentNoteFromStorage();
                    if (note === null) {
                        console.error("Failed to get not from storage");
                        return;
                    }

                    if (textareaNoteBody === null) {
                        console.error("Could not find element matching id: note_body");
                        return;
                    }

                    textareaNoteBody.value = note.body;
                };

                break;
            case "/all-folder/":
                window.onload = renderFolderListToDOM;
                break;
            default :
                console.error("No Client side handle for page path");
                break;

        }
    }

    main();
})();
