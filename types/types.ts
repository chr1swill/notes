/**
* @property {string} id - generated id of note
* @property {string} body - the text the is contained in a note
* @property {string} folder - the folder the note belongs to
*/
export type Note = {
    id: number,
    body: string,
    folder: number,
}

/**
 * @property {number} id - generated id for the folder
 * @property {string} name - choosen name for the folder
 * @property {Array<number>} notesInFolder - collection of the the notes that currentlly reside in the folder
 */
export type Folder = {
    id: number,
    name: string, 
    notesInFolder: Array<number>,
}

/**
 *  @example the number used to index into the Folder will be its corresponsing id
 */
export type FolderCollection = { [key: number]: Folder }

export type DBData = Note | Folder;

export type DBSuccessCallback<T> = (data: T) => T;
