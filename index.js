(function () {
    /**@type{HTMLFormElement | null }*/
    const form = document.getElementById("form");
    if (form === null) {
        console.error("Could not find element with id: #form");
        return;
    }

    /**@type{HTMLButtonElement | null}*/
    const buttonNewNote = document.getElementById("button_new_note");
    if (buttonNewNote === null) {
        console.error("Could not find element with id: #button_new_note");
        return;
    }

    /**@type{HTMLButtonElement | null}*/
    const buttonSave = document.getElementById("button_save");
    if (buttonSave === null) {
        console.error("Could not find element with id: #button_save");
        return;
    }

    /**@type{HTMLInputElement | null}*/
    const inputNoteTitle = document.getElementById("note_title");
    if (inputNoteTitle === null) {
        console.error("Could note find element with id: #note_title");
        return;
    }

    /**@type{HTMLTextAreaElement | null}*/
    const textareaNoteBody = document.getElementById("note_body");
    if (textareaNoteBody === null) {
        console.error("Could not find element with id: #note_body");
        return;
    }

    /**
     * @typedef {Object} Note
     * @property {string} id - generated id of note
     * @property {string} title - user chosen title
     * @property {string} body - user chosen body 
     */

    class NoteController {

        /**@type {Note.id} */
        #currentNoteId = ""

        constructor() {
            const noteId = localStorage.getItem("currentNoteId"); 

            if (noteId === null) {
                /**@type{Note.id}*/
                const newNoteId = this.createNewNote();
                if (newNoteId === null) {
                    console.error("Failed to created a new note");
                    return;
                }

                this.#currentNoteId = newNoteId;

                try {
                    localStorage.setItem("currentNoteId", this.#currentNoteId);
                } catch(e) {
                    console.error(e);
                    return;
                }

                form.setAttribute("data-note-id", this.#currentNoteId);
            } else {
                /**@type{Note | null}*/
                let currentNote;
                try { 
                    currentNote = /**@type{Note | null }*/(localStorage.getItem(noteId));
                    if (currentNote === null) 
                        throw new ReferenceError("Could not find note with id matching current note id: ", noteId);

                } catch (e) {
                    console.error(e);
                    return;
                }

                this.#currentNoteId = currentNote.id;

                form.setAttribute("data-note-id", this.#currentNoteId);
                inputNoteTitle.value = currentNote.title;
                textareaNoteBody.value = currentNote.body;
            }
        }

        /**
         * @returns{Note.id}
         */
        #generateNoteId() {
            return (Data.now() + Math.random()).toString();
        }

        /**
         * @returns{Note | null} - the note you just saved created note
         */
        saveCurrentNote() {
            /**@type{Note}*/
            const note = {}


            let noteId = form.getAttribute("data-note-id");
            if (noteId !== this.#currentNoteId()) {
                this.#currentNoteId = noteId.trim();
                form.setAttribute("data-note-id", noteId.trim());
            }

            if (noteId === null) {
                noteId = this.createNewNote()
            }

            const noteTitle = inputNoteTitle.value;
            const noteBody = textareaNoteBody;

            note.id = noteId;
            note.title = noteTitle;
            note.body = noteBody;
            
            try {
                localStorage.setItem(this.#currentNoteId, JSON.stringify(note));
            } catch {
                console.error(e);
                return null;
            }

            return note;
        }

        /**
         * @returns{Note.id | null} id of the newly created note
         */
        createNewNote() { 
            const newNoteId = this.#generateNoteId();

            try {
                localStorage.setItem("currentNoteId", newNoteId);
            } catch (e) {
                console.error(e);
                return null;
            }

            this.#currentNoteId = /**@type{Note.id}*/(newNoteId);

            return this.#currentNoteId;
        }

        /**
         * @param {Note.id} id - notes id
         * @returns{Note | null} - a note matching the provided id or null if no match
         */
        getNoteFromStorage(id) { }
    }

    function main() {
        const nc = new NoteController();

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

        buttonNewNote.onclick = function(e) {
            e.preventDefault();
            nc.createNewNote()
        }
    }

    main();
})();
