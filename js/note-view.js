/**
 * @typedef {import('../types/types.ts').Note} Note
 */

class NoteController {

    constructor() {
        const noteId = localStorage.getItem("currentNoteId");

        if (noteId === null) {
            /**@type{number | null}*/
            const newNoteId = this.createNewNote();
            if (newNoteId === null) {
                console.error("Failed to created a new note");
                return;
            }

            this.#currentNoteId = newNoteId;

            try {
                localStorage.setItem("currentNoteId", this.#currentNoteId.toString());
            } catch (e) {
                console.error(e);
                return;
            }

            this.form = this.#getElement("form");
            if (this.form === null) {
                console.error("Could note find element with id: #form");
                return;
            }

            this.form.setAttribute("data-note-id", this.#currentNoteId.toString());
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

            if (this.form === null || textareaNoteBody === null) {
                console.error("Failed to access element form or textarea");
                return;
            }

            form.setAttribute("data-note-id", this.#currentNoteId.toString());
            textareaNoteBody.value = currentNote.body;
        }
    }

    /**
     * @param {string} id  - element id 
     * @returns {HTMLElement | null}  
     */
    #getElement(id) {
        const element = document.getElementById(id);
        if (element === null) {
            console.error("Could not find element with id in dom: ", id);
            return null;
        }

        return element;
    }

    #init() {

    }

    /**
     * @returns{number}
     */
    #generateNoteId() {
        return Date.now() + Math.random();
    }

    /**
     * @returns{Note | null} - the note you just saved created note
     */
    saveCurrentNote() {
        if (this.form === null) {
            console.error("Could not find element with id: #form");
            return null;
        }

        /**@type{Note}*/
        const note = {}

        /**@type { string | number | null }*/
        let noteId = this.form.getAttribute("data-note-id");

        if (noteId === null) {
            noteId = this.createNewNote()
            if (noteId === null) {
                console.error("Failed to create new note");
                return null;
            }

        } else {
            noteId = parseFloat(noteId)
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
            localStorage.setItem(this.#currentNoteId.toString(), JSON.stringify(note));
        } catch (e) {
            console.error(e);
            return null;
        }

        return note;
    }

    /**
     * @returns{number | null} id of the newly created note
     */
    createNewNote() {
        const newNoteId = this.#generateNoteId();

        try {
            localStorage.setItem("currentNoteId", newNoteId.toString());
        } catch (e) {
            console.error(e);
            return null;
        }

        this.#currentNoteId = newNoteId;

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
            tmp = localStorage.getItem(this.#currentNoteId.toString());
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


function main() {
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


    const nc = new NoteController();

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

    window.onload = function() {
        if (form === null) {
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

}
