/**
 * @typedef {import('types.js').Note} Note
 */

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
    if (!('id' in note) || !('body' in note) || typeof note.id !== 'number' ||  typeof note.body !== 'string') {
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

export function getUrlStateToLocalStorage() {}
export function saveUrlStateToLocalStorage() {}

function main() {
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

if (window.location.pathname === "/note-view/" || window.location.pathname === "/note-view/index.html") main();
