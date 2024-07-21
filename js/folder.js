import { generateUniqueId } from './utils.js';

/**
 * @typedef {import('types.js').Folder} Folder
 */


/**
 * @returns {Folder}
 */
export function createNewFolder() {
    return { id: generateUniqueId(), name: "", notesInFolder: []}
}
