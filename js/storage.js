/**@type{Readonly<number>}*/
const DB_VERSION = 1;
/**@type{Readonly<string>}*/
const DB_NAME = "NoteAppDB";

/**
 * @returns {Promise<number>} 
 */
export function initDB() {
    return new Promise(function(resolve, reject) {
        const dbOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

        let db;
        dbOpenRequest.onerror = function() {
            db = dbOpenRequest.result;

            if (!db) console.debug("There was no result of the attempt to open the db");
            console.error("Error opening db: ", dbOpenRequest.error);
            reject(0);
        };

        dbOpenRequest.onsuccess = function() {
            console.debug("Successfully set up opned db")
            resolve(1);
        };

        dbOpenRequest.onupgradeneeded = function() {
            db = dbOpenRequest.result;

            db.createObjectStore("notes", { keyPath: "id" });
            db.createObjectStore("folders", { keyPath: "id" });
            console.debug("Upgraded db: name -> ", DB_NAME, " version -> ", DB_VERSION);
            resolve(1);
        };

    });
}

/**
 * @returns {Promise < IDBDatabase | Error >}
 */
export function openDB() {
    return new Promise(function(resolve, reject) {
        const openRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

        openRequest.onerror = function() {
            reject(openRequest.error);
        };

        openRequest.onsuccess = function() {
            resolve(openRequest.result);
        };

        openRequest.onupgradeneeded = function() {
            const db = openRequest.result;

            db.createObjectStore("notes", { keyPath: "id" });
            db.createObjectStore("folders", { keyPath: "id" });
            console.debug("Upgraded db: name -> ", DB_NAME, " version -> ", DB_VERSION);
            resolve(db);
        };

    });
};

/**
 * @param {IDBDatabase} db 
 * @param {IDBTransactionMode} mode 
 * @param {"notes" | "folders"} storeName 
 * @returns {Promise< IDBTransaction | Error >}
 */
function createTransaction(db, storeName, mode) {
    return new Promise(function(resolve, reject) {
        let transaction;

        try {
            transaction = db.transaction(storeName, mode, { durability: 'default' });
        } catch (err) {
            reject(err);
            return;
        };

        transaction.onerror = function() {
            reject(transaction.error);
        };

        transaction.oncomplete = function() {
            resolve(transaction);
        }

        resolve(transaction);
    });
};


/**
 * @typedef {Note | Folder} DBData
 */

/**
 * @typedef {Function} DBSuccessCallback
 * @param {IDBRequest< Array<DBData>>} data
 */

/**
 * @param {IDBTransaction} transaction
 * @param {"notes" | "folders"} storeName
 * @param {IDBValidKey | IDBKeyRange} key - in our case a number is the key for our object stores
 * @param {DBSuccessCallback} [callback=undefined] - callback will be performed on sucess event
 * @returns {Promise<DBData | Error> }
 */
function readData(transaction, storeName, key, callback) {
    return new Promise(function(resolve, reject) {
        const store = transaction.objectStore(storeName);

        const read = store.get(key)

        read.onerror = function() {
            reject(read.error);
        }

        read.onsuccess = function() {
            const data = read.result;
            if (callback) {
                callback(Array.from(data));
                resolve(data);
            } else {
                resolve(data);
            };
        };
    });
};

/**
 * @param {IDBTransaction} transaction
 * @param {"notes" | "folders"} storeName
 * @param {IDBValidKey | IDBKeyRange} key - in our case a number is the key for our object stores
 * @param {DBSuccessCallback} [callback=undefined] - callback will be performed on sucess event
 * @returns {Promise< Array<DBData>| Error> }
 */
function readAllData(transaction, storeName, key, callback) {
    return new Promise(function(resolve, reject) {
        const store = transaction.objectStore(storeName);

        const read = store.getAll(key)

        read.onerror = function() {
            reject(read.error);
        }

        read.onsuccess = function() {
            const data = read.result;
            if (callback) {
                callback(data);
                resolve(data);
            } else {
                resolve(data);
            };
        };
    });
};

/**
 * @param {IDBTransaction} transaction
 * @param {"notes" | "folders"} storeName
 * @param {IDBValidKey} key - in our case a number is the key for our object stores
 * @param {DBData} data 
 * @param {DBSuccessCallback} [callback=undefined] - callback will be performed on sucess event
 * @returns {Promise< 1 | Error>}
 */
function writeData(transaction, storeName, key, data, callback) {
    return new Promise(function(resolve, reject) {
        const store = transaction.objectStore(storeName);

        const write = store.put(data, key);

        write.onerror = function() {
            reject(write.error);
        };

        write.onsuccess = function() {
            if (callback) {
                //@ts-ignore
                callback(Array.from(data));
                resolve(1) 
            } else {
                resolve(1)
            };
        };

    });
};

/**
 * @typedef {import('types.js').Folder} Folder
 */

/**
 * @typedef {import('types.js').Note } Note
 */

/**
 * @param {number} id - the key to the note you would like to access
 * @param {"notes" | "folders"} objectStoreName 
 * @returns {Promise<Note | Folder | null>} 
 */
export function getObjectFromDBStore(objectStoreName, id) {
    return new Promise(function(resolve, reject) {
        const dbOpenRequest = indexedDB.open(DB_NAME, DB_VERSION);

        dbOpenRequest.onerror = function() {
            console.debug("Error occured while access id: ", id, " from db: ", dbOpenRequest.error);
            reject(null);
        };

        dbOpenRequest.onsuccess = function() {
            const db = dbOpenRequest.result;


            let transaction;
            try {
                transaction = db.transaction(objectStoreName, 'readonly', { durability: 'default' });
            } catch (e) {
                console.error(e);
                reject(null);
                return;
            };

            transaction.onerror = function() {
                console.error(transaction.error);
                reject(null);
            };

            transaction.oncomplete = function() {
                console.debug("Transaction completed");
            };

            const objectStore = transaction.objectStore(objectStoreName);

            const data = objectStore.get(id);

            data.onerror = function() {
                console.error(data.error);
                reject(null);
            };

            data.onsuccess = function() {
                resolve(data.result || null);
            };
        };
    });
}

/**
 * @param {"notes" | "folders"} objectStoreName 
 * @returns {Promise<Note[] | Folder[] | null>} 
 */
export function getAllObjectsFromDBStore(objectStoreName) { 
    return new Promise(function(resolve, reject) {
        const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

        openRequest.onerror = function() {
            console.error(openRequest.error);
            resolve(null);
        };

        openRequest.onsuccess = function () {
            const db = openRequest.result;


            let transaction;
            try {
                transaction = db.transaction(objectStoreName, 'readonly', { durability: 'default' });
            } catch (e) {
                console.error(e);
                reject(null);
                return;
            };

            transaction.onerror = function() {
                console.error(transaction.error);
                reject(null);
            };

            transaction.oncomplete = function() {
                console.debug("Transaction completed");
            };

            const objectStore = transaction.objectStore(objectStoreName);

            const data = objectStore.getAll();

            data.onerror = function() {
                console.error(data.error);
                reject(null);
            };

            data.onsuccess = function() {
                resolve(data.result || null);
            };
        };
    });
};

/**
 * @param {0|1} objectStoreType - NOTES(0) or FOLDERS(1) will be used to determine the location to store object
 * @param {Note|Folder} objectToSave 
 * @returns {Promise<1 | DOMException>} - 1 if sucessful and error if one occurs
 */
export function saveObjectToDB(objectStoreType, objectToSave) {
    return new Promise(function(resolve, reject) {
        const openRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

        openRequest.onerror = function () {
            reject(openRequest.error);
        };

        openRequest.onsuccess = function () {
            const db = openRequest.result;

            const objectStoreTypeAsName = objectStoreType === 0 ? 'notes' : 'folders';

            let transaction;
            try {
                transaction = db.transaction(objectStoreTypeAsName, 'readwrite', { durability: 'default' });
            } catch (e) {
                reject(e);
                return;
            };

            transaction.onerror = function () {
                reject(transaction.error);
            };

            transaction.oncomplete = function () {
                console.debug("Transaction Complete");
            };

            const objectStore = transaction.objectStore(objectStoreTypeAsName);

            let putObject;
            try {
                putObject = objectStore.put(objectToSave);
            } catch (e) {
                reject(e);
                return;
            };

            putObject.onerror = function () {
                reject(putObject.error);
            };

            putObject.onsuccess = function () {
                console.debug("Successfully saved the object, returned result: ", putObject.result);
                resolve(1);
            }
        };
    });
}

/**
 * @param{Note} note - the note you would like to delete from db
 * @returns{Promise<1 | Error>} - returns 1 if sucesfull and the error if one is raied
 */
function deleteNoteFromAllObjectStores(note) {
    return new Promise(function(resolve, reject) {
        const openRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

        openRequest.onerror = function() {
            reject(openRequest.error);
        };

        openRequest.onsuccess = function() {
            const db = openRequest.result;
            const notesTransaction = db.transaction('notes', 'readonly', { durability: 'default' });

            notesTransaction.onerror = function() {
                reject(notesTransaction.error);
            };

            notesTransaction.oncomplete = function() {
                console.debug("Notes transaction complete");
            };

            const notesObjectStore = notesTransaction.objectStore('notes');
            const deleteNote = notesObjectStore.delete(note.id);

            deleteNote.onerror = function() {
                reject(deleteNote.error);
            };

            deleteNote.onsuccess = function() {
                resolve(1);
            };


            const folderTransaction = db.transaction('folders', 'readonly', { durability: 'default' });

            folderTransaction.onerror = function() {
                reject(folderTransaction.error);
            };

            folderTransaction.oncomplete = function() {
                console.debug("Folder transaction complete");
            };

            const foldersObjectStore = folderTransaction.objectStore('folder');
            const folderFromObjectStore = foldersObjectStore.get(note.folder);

            folderFromObjectStore.onerror = function() {
                reject(folderFromObjectStore.error);
            };

            folderFromObjectStore.onsuccess = function() {
                /**@type {Folder | null}*/
                const folder = folderFromObjectStore.result;
                if (folder === null || !("notesInFolder" in folder)) {
                    // if the folder that was reference in a note is null that is find we are removing the note either way
                    // can be treated as a early return 
                    resolve(1);
                    return;
                };

                const foldersNotes = folder.notesInFolder;
                if (foldersNotes.includes(note.id)) {
                    let i = 0;
                    while(i < foldersNotes.length) {
                        if (foldersNotes[i] === note.id) foldersNotes.splice(i, 1);
                        i++;
                    };
                };

                const updatedFolder = foldersObjectStore.put(folder, folder.id);

                updatedFolder.onerror = function() {
                    reject(updatedFolder.error);
                };

                updatedFolder.onsuccess = function() {
                    resolve(1);
                };
            };
        };

    });
}

/**
 * @param{Array<Note>} notesArray - the array of note you would like to delete
 * @returns{Array<1 | 0> | null} - indeies match up to the input array and will indicate which elements got deleted and which errored and null if input invalid
 */
export function deleteNotes(notesArray) {
    if (notesArray.length < 0) {
        
        /**@type{Array<1|0>}*/
        let returnResult = [];

        let i = 0;
        while (i < notesArray.length) {
            const note = notesArray[i];

            deleteNoteFromAllObjectStores(note)
            .then(function(result) {
                if (result !== 1) throw new Error(`An unexpected error occured while attempted to delete note from db: ${note}`);
                returnResult.push(1)
                return returnResult;
            })
            .catch(function(err) {
                console.error(err);
                returnResult.push(1)
                return returnResult;
            });

            i++;
        };

        return returnResult;
    } else {
        console.error("Notes array container no notes");
        return null;
    };
}

/**
 * @async
 *
 * @param{number} folderIdWithNotesIdArray - the id of the folder array which you would like to add the given notes id to 
 * @param {number} noteIdToPut - the note id which you would like to add to the given folders array
 * @returns{Promise<number>}
 */
export async function pushIdIntoFoldersNoteArray(folderIdWithNotesIdArray, noteIdToPut) {
    try {
        const result = await getObjectFromDBStore('folders', folderIdWithNotesIdArray);
        if (result === null) {
            throw new ReferenceError(`There was not an id in the folder objectStore matching the provided id: ${folderIdWithNotesIdArray}`);
        } else if (!('id' in result) || !('name' in result) || !('notesInFolder' in result)) {
            throw new TypeError(`The object accessed from the database was not a valid folder: ${result}`);
        } 

        const folder = result;
        if (folder.notesInFolder.includes(noteIdToPut)) {
            // no need to add the note id again to the folder
            return 1;
        }

        console.debug("Folder before adding note id", folder.notesInFolder);
        folder.notesInFolder.push(noteIdToPut);
        console.debug("Folder after adding note id", folder.notesInFolder);

        const saveUpdatedFolderToDB = await saveObjectToDB(1, folder);
        if (saveUpdatedFolderToDB !== 1) {
            throw saveUpdatedFolderToDB;
        } 

        return 1;

    } catch (err) {
        console.error(err);
        return 0;
    }
}

/**
 * @async
 * @param{number} noteIdAsNumber
 * @param{number} folderId
 * @returns{Promise<number>} - zero if an error occurs, one if successful, negative one if input was invalid (hit else branch)
 */
export async function addNoteIdToFolderArray(noteIdAsNumber, folderId) {
    if (folderId > 0 && !isNaN(noteIdAsNumber) && isFinite(noteIdAsNumber) && noteIdAsNumber > 0 ) {

        try { 

            const result = await pushIdIntoFoldersNoteArray(folderId, noteIdAsNumber);

            if (result !== 1) {
                throw new Error('Failed to add new note to folders array of notes');
            } else {
                console.debug('Successfully added note id: ', noteIdAsNumber, ' to folder id: ', folderId, ' array of notes');
                return 1;
            };

        } catch (err) {
            console.error(err);
            return 0;
        };

    } else {
        console.debug(`Did note run function, was provided inputs: noteIdAsNumber ${noteIdAsNumber}, folderId ${folderId}`);
        return -1;
    }
}

