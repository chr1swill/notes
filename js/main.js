import { handleClickOnCreateNewFolderButton, openInNoteView, renderListOfLinksToDom } from "./dom-update.js";
import { createNewNote } from "./notes.js";
import { initDB, pushIdIntoFoldersNoteArray, saveObjectToDB } from "./storage.js";

/**
 * @typedef{import('types.js').Note} Note
 */

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
            if (queriedId === null) {
                console.debug("query was null");
                // create note in all notes folder only
                window.location.href = window.location.origin + '/note-view/?folder=0';
                return;
            } else {
                console.debug("query NOT was null");
                // it is requried that the tenary is wrapped in bracked or odd error occurs
                let newLocation = window.location.origin + '/note-view/?folder=' + ((!isNaN(parseFloat(queriedId)) && isFinite(parseFloat(queriedId))) ? queriedId : "0");
                console.debug("newLocation url: ", newLocation);
                window.location.href = newLocation;
                console.assert(window.location.pathname === '/note-view/', "There was an error in assembling the new note page url");
                return;
            };
        };

        return;
    }

    if (path === '/note-view/' || path === '/note-view/index.html') {
        const noteId = searchParams.get('id');
        const folderId = searchParams.get('folder');

        openInNoteView(noteId, folderId)

        const saveNoteButton = document.getElementById('button_save');
        if (saveNoteButton === null) {
            console.error('Could not find element with id: #button_save');
            return;
        }

        saveNoteButton.onclick = function() {
            const textarea = /**@type{HTMLTextAreaElement | null}*/(document.getElementById('note_body'));
            if (textarea === null) {
                console.error('Could not find element with id: #note_body');
                return;
            };

            const noteBody = textarea.value || "";

            const searchQuery = new URLSearchParams(window.location.search)
            const noteId = searchQuery.get('id');

            /**@type{number}*/
            let folderId;
            const folderParam = searchQuery.get('folder');
            if (
                folderParam === null || 
                isNaN(parseFloat(folderParam)) || 
                !isFinite(parseFloat(folderParam))
            ) {
                folderId = 0;
            } else {
                folderId = parseFloat(folderParam);
            };

            //make a function to update the note folder array

            /**
             * @param{number} noteIdAsNumber
             * @param{number} folderId
             */
            const addNoteIdToFolderArray  = function(noteIdAsNumber, folderId) {
                if (folderId < 0 && !isNaN(noteIdAsNumber) && isFinite(noteIdAsNumber) && noteIdAsNumber < 0 ) {
                    pushIdIntoFoldersNoteArray(folderId, noteIdAsNumber)
                        .then(function(result) {
                            if (result !== 1) {
                                throw new Error('Failed to add new note to folders array of notes');
                            } else {
                                console.debug('Successfully added note id: ', noteIdAsNumber, ' to folder id: ', folderId, ' array of notes');
                            };
                        })
                        .catch(function(err) {
                            console.error(err);
                            return;
                        });
                };
            }

            /**@type{Note}*/
            let note = createNewNote();
            if (noteId === null ||
                isNaN(parseFloat(noteId)) ||
                !isFinite(parseFloat(noteId)) ) {
                // assemble a new note
                
                note.folder = folderId;
                note.body = noteBody;

                addNoteIdToFolderArray(note.id, folderId);
                textarea.setAttribute('data-note-id', note.id.toString());
                textarea.setAttribute('data-folder-id', folderId.toString());
            } else {
                note.id = parseFloat(noteId);
                note.folder = folderId;
                note.body = noteBody;

                addNoteIdToFolderArray(note.id, folderId);
                textarea.setAttribute('data-note-id', note.id.toString());
                textarea.setAttribute('data-folder-id', folderId.toString());
            };

            saveObjectToDB(0, note)
            .then(function(result) {
                if (result !== 1) {
                    throw result;
                } else {
                    console.debug('Sucessfully saved note');
                }
            })
            .catch(function(err) {
                console.error(err);
            });

            return;
        };

        return;
    }

    console.debug("Visited page with not hanlder set up: ", path);
    console.debug("Redirecting to /all-folders/");
    window.location.href = window.location.origin + '/all-folders/'
    return;
}
