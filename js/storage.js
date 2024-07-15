/**@type{Readonly<number>}*/
const DB_VERSION = 1;

function init() {
    let db;

    const dbOpenRequest = window.indexedDB.open("NoteApp", DB_VERSION);

    dbOpenRequest.onerror = function () {
        db = dbOpenRequest.result;

        if (!db) console.debug("There was no result of the attempt to open the db");
        console.error("Error opening DB: ", dbOpenRequest.error);
    }

    dbOpenRequest.onsuccess = function () {}
    dbOpenRequest.onupgradeneeded = function () {}
}
