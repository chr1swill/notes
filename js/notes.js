import { generateUniqueId } from "./utils.js";

/**
 * @typedef { import('types.js').Note } Note
 */

/**
 * @returns {Note}
 * - initized to folder 0 which is the all folder Folder
 */
export function createNewNote() {
    return { id: generateUniqueId(), body: "", folder: 0 }; 
}
