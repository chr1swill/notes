import { generateUniqueId } from "./utils.js";

/**
 * @typedef { import('types.js').Note } Note
 */

/**
 * @returns {Note}
 */
function createNote() {
    return { id: generateUniqueId(), body: "" }; 
}

/**
 * @param {number} id
 * @return {Note | null} 
 */
function updateNote(id) {
}
