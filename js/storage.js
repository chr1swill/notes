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

