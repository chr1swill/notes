import { createNewFolder } from "./folder.js";
import { getAllObjectsFromDBStore, getObjectFromDBStore, saveObjectToDB } from "./storage.js";
/**
 * @typedef {import('types.js').Folder} Folder
 */

/**
 * @typedef {import('types.js').Note } Note
 */

/**
 * @param {0|1} listType - a list of type NOTES(0) or FOLDERS(1) components
 * @param {Array<Folder | Note > | null } data
 * @returns {DocumentFragment}
 */
function createFragmentOfElementsForDom(listType, data) {
    const fragment = new DocumentFragment();

    if (data === null || data.length === 0) {
        if (listType === 0) {
            fragment.textContent = "Folder is empty";
            return fragment
        }

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = "All Notes Folder";

        // to indicate need all list
        a.setAttribute('data-folder-id', "0");
        a.href = window.location.origin + '/folder-view/' + '?id=0';

        fragment
            .appendChild(li)
            .appendChild(a)

        return fragment;
    }

    if (listType === 0) {
        const noteArray = /**@type {Array<Note>} */(data);

        let i = 0;
        while (i < noteArray.length) {
            const note = noteArray[i];

            const li = document.createElement('li');
            const a = document.createElement('a');

            const noteBody = note.body;

            let noteTitle;
            if (noteBody.length > 125) {
                const indexOfNewLineChar = noteBody.indexOf('\n', 0);

                if (indexOfNewLineChar < 125) {
                    noteTitle = noteBody.slice(0, indexOfNewLineChar);
                } else {
                    noteTitle = noteBody.slice(0, 124);
                }
            } else {
                noteTitle = noteBody;
            }

            a.textContent = noteTitle;
            a.setAttribute('data-note-id', note.id.toString());
            a.href = window.location.origin + '/note-view/' + `?id=${note.id}`;

            fragment
                .appendChild(li)
                .appendChild(a);

            i++;
        }

    } else {
        const folderArray = /**@type {Array<Folder>} */(data);

        let i = 0;
        while (i < folderArray.length) {
            const folder = folderArray[i];

            const li = document.createElement('li');
            const a = document.createElement('a');

            const folderName = folder.name;

            let folderTitle;
            if (folderName.length > 125) {
                const indexOfNewLineChar = folderName.indexOf('\n', 0);

                if (indexOfNewLineChar < 125) {
                    folderTitle = folderName.slice(0, indexOfNewLineChar);
                } else {
                    folderTitle = folderName.slice(0, 124);
                }
            } else {
                folderTitle = folderName;
            }

            a.textContent = folderTitle;
            a.setAttribute('data-folder-id', folder.id.toString());
            a.href = window.location.origin + '/folder-view/' + `?id=${folder.id}`;

            fragment
                .appendChild(li)
                .appendChild(a);

            i++;
        }
    }

    return fragment;
}

/**
 * @param {0|1} listType - a list of type NOTES(0) or FOLDERS(1) components
 * @param {string} idOfDomElementToInsertResultTo - used to as the location for the insertion of the resulting list
 * @param {number} [idOfDataToAccessFromStorage=0] - an id of 0 will result in all element of provided list type being render to provided container id
 * @returns {void}
 */
export function renderListOfLinksToDom(listType, idOfDomElementToInsertResultTo, idOfDataToAccessFromStorage = 0) {
    const container = document.getElementById(idOfDomElementToInsertResultTo);
    if (container === null) {
        console.error("Inavlid id was provided for container: ", idOfDomElementToInsertResultTo)
        return;
    }

    if (listType !== 0 && listType !== 1) {
        console.error("Invalid list type was provided: ", listType)
        return;
    }

    let jumpTable;
    if (idOfDataToAccessFromStorage === 0) {
        jumpTable = {
            0: getAllObjectsFromDBStore("notes"),
            1: getAllObjectsFromDBStore("folders"),
        };

        /**@type{DocumentFragment}*/
        let fragment;
        jumpTable[listType]
            .then(function(data) {
                const dataArrayOrNull = data === null || data.length === 0 ? null : data;
                fragment = createFragmentOfElementsForDom(listType, dataArrayOrNull);
                return fragment;
            })
            .catch(function(e) {
                console.error("No data to process: ", e);

                fragment = createFragmentOfElementsForDom(listType, null);
                return fragment;
            })
            .finally(function() {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }

                console.debug("the so called fragment: ", fragment);
                container
                    .appendChild(fragment);
            });

    } else {
        jumpTable = {
            0: getObjectFromDBStore("notes", idOfDataToAccessFromStorage),
            1: getObjectFromDBStore("folders", idOfDataToAccessFromStorage),
        }

        /**@type{DocumentFragment}*/
        let fragment;
        jumpTable[listType]
            .then(function(data) {
                const dataArrayOrNull = data === null ? null : [data];
                fragment = createFragmentOfElementsForDom(listType, dataArrayOrNull);
                return fragment;
            })
            .catch(function(e) {
                console.error("No data to process: ", e);
                fragment = createFragmentOfElementsForDom(listType, null);
                return fragment;
            })
            .finally(function() {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }

                container
                    .appendChild(fragment);
            });
    }
}

/**
 * @param {string} idOfDomContainerToInsertReRender - a fragement containing all the list will be appended to this element
 */
export function handleClickOnCreateNewFolderButton(idOfDomContainerToInsertReRender) {
    const folder = createNewFolder();

    /**@type{string | null}*/
    let prompt = null;
    while (prompt === null || prompt?.trim()?.length < 1 || prompt?.trim()?.length > 125) {
        prompt = window.prompt("What would you like to name the folder?");
    }

    folder.name = prompt.trim();
    console.debug("Choosen name for folder: ", folder.name);

    saveObjectToDB(1, folder)
    .then(function(result) {
        console.assert(result === 1, "Function did not fail but return an unexpected result: ", result);
        renderListOfLinksToDom(1, idOfDomContainerToInsertReRender, 0)
    })
    .catch(function(e) {
        console.error(e);
        // TODO function showErrorToUser('Failed to create a new folder') + some actionable or useful information
        return;
    });
}
